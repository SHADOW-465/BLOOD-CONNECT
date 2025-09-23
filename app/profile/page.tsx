"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NButton, NCard, NField, NSelect, NTextarea } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { MapPin, Save, Edit, X } from "lucide-react"

type Profile = {
  name: string
  phone: string
  blood_type: "A" | "B" | "AB" | "O"
  rh: "+" | "-"
  last_donation_date: string
  location_lat: number | null
  location_lng: number | null
  availability_status: "available" | "unavailable"
  availability_reason: string
  medical_notes: string
}

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
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        if (profileData) {
          setProfile(profileData)
          setFormState(profileData)
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
              location_lat: position.coords.latitude,
              location_lng: position.coords.longitude,
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
    if (!formState) return
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
      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      setFormState(updatedProfile)
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
          <p>No profile found. Please complete the onboarding process.</p>
          <Link href="/blood-onboarding/profile">
            <NButton className="mt-4">Go to Onboarding</NButton>
          </Link>
        </NCard>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <NCard>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NField name="name" label="Name" value={formState?.name || ""} onChange={handleInputChange} disabled={!isEditing} />
          <NField name="phone" label="Phone" value={formState?.phone || ""} onChange={handleInputChange} disabled={!isEditing} />
          <div className="flex gap-4">
            <NSelect
              name="blood_type"
              label="Blood Type"
              value={formState?.blood_type || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </NSelect>
            <NSelect name="rh" label="Rh Factor" value={formState?.rh || ""} onChange={handleInputChange} disabled={!isEditing}>
              <option value="+">+</option>
              <option value="-">-</option>
            </NSelect>
          </div>
          <NField
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
                  formState?.location_lat && formState?.location_lng
                    ? `${formState.location_lat.toFixed(4)}, ${formState.location_lng.toFixed(4)}`
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
            <NSelect
              name="availability_status"
              label="Availability Status"
              value={formState?.availability_status || "available"}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </NSelect>
          </div>

          {formState?.availability_status === "unavailable" && (
            <div className="md:col-span-2">
              <NTextarea
                name="availability_reason"
                label="Reason for Unavailability"
                value={formState?.availability_reason || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          )}

          <div className="md:col-span-2">
            <NTextarea
              name="medical_notes"
              label="Medical Notes"
              value={formState?.medical_notes || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </div>
      </NCard>
    </div>
  )
}
