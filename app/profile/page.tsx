"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { MapPin, Save, Edit, X } from "lucide-react"
import { NButton } from "@/components/ui/NButton"
import { NCard, NCardContent, NCardHeader, NCardTitle } from "@/components/ui/NCard"
import { NInput } from "@/components/ui/NInput"
import { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["users"]["Row"] & Database["public"]["Tables"]["user_profiles"]["Row"];

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formState, setFormState] = useState<Profile | null>(null)

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const { data: profileData } = await supabase
          .from("users")
          .select("*, user_profiles(*)")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
            const { user_profiles, ...userData } = profileData
            const fullProfile = { ...userData, ...user_profiles }
            setProfile(fullProfile)
            setFormState(fullProfile)
        }
      }
      setLoading(false)
    }
    getUserAndProfile()
  }, [supabase])

  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (formState) {
            setFormState({
              ...formState,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          }
        },
        (error) => {
          console.error("Error getting location", error)
          alert("Could not get your location. Please ensure you have location services enabled.")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (formState) {
      setFormState({ ...formState, [e.target.name]: e.target.value })
    }
  }

  const handleCancel = () => {
    setFormState(profile)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!formState || !user) return
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) {
        throw new Error("Failed to save profile")
      }
      const updatedProfileData = await res.json()
      const { user_profiles, ...userData } = updatedProfileData
      const fullProfile = { ...userData, ...user_profiles }
      setProfile(fullProfile)
      setFormState(fullProfile)
      setIsEditing(false)
      alert("Profile saved successfully!")
    } catch (error) {
      console.error(error)
      alert("An error occurred while saving your profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <NCard>
          <NCardContent className="p-6">
            <p>No profile found. Please complete the onboarding process.</p>
            <Link href="/blood-onboarding/profile">
              <NButton className="mt-4">Go to Onboarding</NButton>
            </Link>
          </NCardContent>
        </NCard>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <NCard>
        <NCardHeader>
          <div className="flex justify-between items-center">
            <NCardTitle>My Profile</NCardTitle>
            <div>
              {!isEditing ? (
                <NButton onClick={() => setIsEditing(true)}>
                  <Edit className="w-5 h-5 mr-2" />
                  Edit Profile
                </NButton>
              ) : (
                <div className="flex gap-2">
                  <NButton onClick={handleSave} disabled={saving}>
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </NButton>
                  <NButton onClick={handleCancel} variant="secondary">
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </NButton>
                </div>
              )}
            </div>
          </div>
        </NCardHeader>
        <NCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NInput name="name" label="Name" value={formState?.name || ""} onChange={handleInputChange} disabled={!isEditing} />
            <NInput name="phone_number" label="Phone" value={formState?.phone_number || ""} onChange={handleInputChange} disabled={!isEditing} />
            <div className="flex gap-4">
              <select
                name="blood_type"
                value={formState?.blood_type || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full mt-1"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
              <select name="rh_factor" value={formState?.rh_factor || ""} onChange={handleInputChange} disabled={!isEditing} className="w-full mt-1">
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            </div>
            <NInput
              name="last_donation_date"
              label="Last Donation"
              type="date"
              value={formState?.last_donation_date ? new Date(formState.last_donation_date).toISOString().split("T")[0] : ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="text"
                  readOnly
                  value={
                    formState?.latitude && formState?.longitude
                      ? `${formState.latitude.toFixed(4)}, ${formState.longitude.toFixed(4)}`
                      : "Not set"
                  }
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
                <NButton onClick={handleUpdateLocation} disabled={!isEditing} className="flex-shrink-0">
                  <MapPin className="w-5 h-5 mr-2" />
                  Update Location
                </NButton>
              </div>
            </div>

            <div className="md:col-span-2">
              <select
                name="availability_status"
                value={formState?.availability_status || "available"}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full mt-1"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <NInput
                name="medical_conditions"
                label="Medical Notes"
                value={formState?.medical_conditions || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </NCardContent>
      </NCard>
    </div>
  )
}
