"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit, User, Mail, Phone, MapPin, Save, X, Heart, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/hooks/useAuth"

type Profile = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  stats: {
    donations: number
    livesSaved: number
  }
}

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
  })

  const fetchProfile = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await response.json()
      setProfile(data)
      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
      })
    } catch (error) {
      toast.error("Could not load your profile. Please try again later.")
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    const formData = new FormData()
    formData.append("name", editForm.name)
    formData.append("phone", editForm.phone)

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully!")
      await fetchProfile() // Re-fetch profile to show updated data
      setIsEditModalOpen(false)

    } catch (error) {
      toast.error("Could not update your profile. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isAuthLoading || (isLoadingData && !profile)) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center">
            <h2 className="text-xl font-semibold text-gray-700">Could not load profile</h2>
            <p className="text-gray-500 mb-4">There was an issue fetching your data.</p>
            <button onClick={fetchProfile} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
                Try Again
            </button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <img
                src={`https://ui-avatars.com/api/?name=${profile.name || profile.email}&background=e74c3c&color=fff&size=128`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-800">{profile.name || "Update Your Name"}</h1>
              <p className="text-gray-500">{profile.email}</p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
            <div className="bg-red-50 p-4 rounded-lg flex items-center">
                <Heart className="w-8 h-8 text-red-500 mr-4"/>
                <div>
                    <div className="text-2xl font-bold text-gray-800">{profile.stats.livesSaved}</div>
                    <div className="text-sm text-gray-600">Lives Saved</div>
                </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mr-4"/>
                <div>
                    <div className="text-2xl font-bold text-gray-800">{profile.stats.donations}</div>
                    <div className="text-sm text-gray-600">Total Donations</div>
                </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="space-y-4">
                <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-4"/>
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium text-gray-800">{profile.email}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-4"/>
                    <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium text-gray-800">{profile.phone || "Not provided"}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
             {isUpdating && <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div></div>}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>

            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 border rounded-lg"/>
              <input type="text" placeholder="Phone Number" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full p-3 border rounded-lg"/>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
                <X className="w-4 h-4 inline-block mr-1"/>
                Cancel
              </button>
              <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:bg-red-300">
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-4 h-4 inline-block mr-1"/>}
                {isUpdating ? "" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}