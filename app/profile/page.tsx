"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { NCard, NField, NButton, NAvatar, NToggle, NAlert } from "@/components/nui"
import { User as UserIcon, Phone, Droplet, Save, Edit } from "lucide-react"

type Profile = {
  id: string
  name: string
  phone: string
  blood_type: string
  rh: string
  availability_status: "available" | "unavailable"
  availability_reason: string | null
  location_lat: number | null
  location_lng: number | null
}

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchProfile = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116: single row not found
      console.error("Error fetching profile:", error)
      setMessage({ type: "error", text: "Could not fetch profile." })
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        await fetchProfile(session.user)
      } else {
        setLoading(false)
      }
    }
    initUser()
  }, [supabase, fetchProfile])

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user || !profile) return

    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        phone: profile.phone,
        availability_status: profile.availability_status,
        availability_reason: profile.availability_status === 'available' ? null : profile.availability_reason,
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile." })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      setIsEditing(false)
    }
    setLoading(false)
  }

  const handleAvailabilityChange = (available: boolean) => {
    if (!profile) return
    const newStatus = available ? "available" : "unavailable"
    setProfile(prev => ({
      ...prev!,
      availability_status: newStatus,
      // Clear reason if becoming available
      availability_reason: newStatus === 'available' ? null : prev!.availability_reason,
    }))
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Please <a href="/login" className="text-blue-500">log in</a> to view your profile.</p>
      </div>
    )
  }

  if (!profile) {
    return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <NCard className="text-center">
            <p className="mb-4">You haven't completed your profile yet.</p>
            <NButton onClick={() => location.assign('/blood-onboarding/profile')}>
                Complete Profile
            </NButton>
        </NCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <NCard>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <NAvatar src={user.user_metadata?.avatar_url} alt={profile.name} size="xl" />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{isEditing ? 'Editing Profile' : profile.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                 <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-sm">
                  {profile.blood_type && (
                    <div className="flex items-center gap-1 font-mono text-lg font-bold text-[#e74c3c]">
                      <Droplet className="w-5 h-5" />
                      {profile.blood_type}{profile.rh}
                    </div>
                  )}
                </div>
              </div>
              <NButton type="button" onClick={() => setIsEditing(!isEditing)} className="!w-12 !h-12 !rounded-full">
                {isEditing ? <Save className="w-5 h-5"/> : <Edit className="w-5 h-5"/>}
              </NButton>
            </div>

            {message && <NAlert type={message.type} className="mb-6">{message.text}</NAlert>}

            <div className="space-y-6">
              <NField
                label="Full Name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
              <NField
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />

              <NCard className="!p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Availability Status</h3>
                        <p className={`text-sm ${profile.availability_status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                            You are currently {profile.availability_status}.
                        </p>
                    </div>
                    <NToggle
                        checked={profile.availability_status === 'available'}
                        onChange={handleAvailabilityChange}
                    />
                </div>
                {profile.availability_status === 'unavailable' && (
                    <div className="mt-4">
                        <NField
                            label="Reason for Unavailability (optional)"
                            type="text"
                            value={profile.availability_reason || ''}
                            onChange={(e) => setProfile({ ...profile, availability_reason: e.target.value })}
                            placeholder="e.g., On vacation, Feeling unwell"
                        />
                    </div>
                )}
              </NCard>

              {isEditing || profile.availability_status === 'unavailable' ? (
                <div className="flex justify-end gap-4 mt-8">
                  {isEditing && (
                    <NButton type="button" onClick={() => { setIsEditing(false); fetchProfile(user); }} className="bg-gray-200 text-gray-700">Cancel</NButton>
                  )}
                  <NButton type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </NButton>
                </div>
              ) : null}
            </div>
          </form>
        </NCard>
      </div>
    </div>
  )
}
