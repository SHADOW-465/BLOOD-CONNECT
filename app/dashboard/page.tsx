"use client"

import { useEffect, useMemo, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, HeartPulse, BellRing, Activity, Calendar, User as UserIcon, Share2, Check } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { User } from "@supabase/supabase-js"
import { differenceInDays, format, formatDistanceToNow } from "date-fns"
import { NButton } from "@/components/ui/NButton"
import { NCard, NCardContent, NCardHeader, NCardTitle } from "@/components/ui/NCard"
import { NInput } from "@/components/ui/NInput"
import { Database } from "@/lib/supabase/types"

type RequestRow = Database["public"]["Tables"]["blood_requests"]["Row"] & { dist?: number }
type MyRequestRow = Database["public"]["Tables"]["blood_requests"]["Row"] & { request_responses: any[] }
type Appointment = Database["public"]["Tables"]["appointments"]["Row"]

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [myRequests, setMyRequests] = useState<MyRequestRow[]>([])
  const [impact, setImpact] = useState({ donations: 0, lives: 0, streak: 0 })
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [sosForm, setSosForm] = useState({
    blood_type: "A" as const,
    rh_factor: "+" as const,
    urgency: "high" as const,
    units_needed: 1,
    patient_name: "Jayasurya. J",
    hospital_name: "Rajiv Gandhi government general hospital",
    contact_phone: "8015118403",
    notes: "",
    required_by: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
  })

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc(null),
      { enableHighAccuracy: true },
    )

    const getUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUser(session.user)

      const { data: profileData } = await supabase.from("users").select("*, user_profiles(*)").eq("id", session.user.id).single()
      if (profileData) {
        const { user_profiles, ...userData } = profileData
        const fullProfile = { ...userData, ...user_profiles }
        setProfile(fullProfile)
        if (fullProfile.last_donation_date) {
          const lastDonation = new Date(fullProfile.last_donation_date)
          const nextEligible = new Date(lastDonation.setDate(lastDonation.getDate() + 56))
          setNextDonationDate(nextEligible)
        }
        if (fullProfile.blood_type && fullProfile.rh_factor) {
          setSosForm((prev) => ({ ...prev, blood_type: fullProfile.blood_type, rh_factor: fullProfile.rh_factor }))
        }
      }

      const { data: donations } = await supabase.from("donations").select("id, donation_date").eq("donor_id", session.user.id)
      if (donations) {
        setImpact({ donations: donations.length, lives: donations.length * 3, streak: 0 })
      }

      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "confirmed")
        .order("appointment_datetime", { ascending: true })
        .limit(1)
      if (appointmentData) {
        setAppointments(appointmentData as Appointment[])
      }
    }

    getUserData()
  }, [supabase])

  async function handleSendRequest() {
    if (!loc || !user) return
    setLoading(true)
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          ...sosForm,
          latitude: loc.lat,
          longitude: loc.lng,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      await loadNearby()
    } catch (e) {
      console.log("[v0] SOS error", e)
    } finally {
      setLoading(false)
      setIsSosModalOpen(false)
    }
  }

  async function handleAcceptRequest(requestId: string) {
    setAccepting(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: "POST",
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to accept request")
      }
      alert("Request accepted! The requester has been notified.")
      loadNearby()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setAccepting(null)
    }
  }

  async function loadNearby() {
    const res = await fetch("/api/requests")
    if (!res.ok) return
    const data = (await res.json()) as RequestRow[]
    setRequests(data)
  }

  async function loadMyRequests() {
    const res = await fetch("/api/requests/mine")
    if (!res.ok) return
    const data = await res.json()
    setMyRequests(data)
  }

  useEffect(() => {
    loadNearby()
    loadMyRequests()
    const channel = supabase
      .channel("requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => {
        loadNearby()
        loadMyRequests()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const requestsWithDistance = useMemo(() => {
    if (!loc) return requests
    return requests
      .map((r) => ({
        ...r,
        dist: r.latitude && r.longitude ? kmDistance(loc.lat, loc.lng, r.latitude, r.longitude) : null,
      }))
      .sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9))
  }, [requests, loc])

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile && !profile.latitude && (
            <NCard className="lg:col-span-3 bg-yellow-100/80">
              <NCardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
                <div>
                  <h2 className="text-xl font-semibold text-yellow-800">Update Your Location</h2>
                  <p className="text-sm text-yellow-700">
                    Your profile is missing a location. Please update it to be matched with nearby requests.
                  </p>
                </div>
                <NButton
                  onClick={() => (window.location.href = "/profile")}
                  className="min-w-56 h-12 bg-yellow-300 text-yellow-900"
                >
                  Update Profile
                </NButton>
              </NCardContent>
            </NCard>
          )}
          <NCard className="lg:col-span-3">
            <NCardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
              <div>
                <h2 className="text-xl font-semibold text-[#e74c3c]">Emergency Request</h2>
                <p className="text-sm text-gray-600">Your location will be used to notify nearby compatible donors.</p>
              </div>
              <NButton onClick={() => setIsSosModalOpen(true)} disabled={!loc} className="min-w-56 h-14 text-lg">
                <BellRing className="w-5 h-5 mr-2" />
                SOS Now
              </NButton>
            </NCardContent>
          </NCard>

          <NCard className="lg:col-span-2">
            <NCardHeader>
              <NCardTitle className="flex items-center gap-3">
                <HeartPulse className="w-5 h-5 text-[#e74c3c]" />
                Impact Summary
              </NCardTitle>
            </NCardHeader>
            <NCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#e74c3c]">{impact.lives}</div>
                  <div className="text-xs text-gray-600">Lives saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e74c3c]">{impact.donations}</div>
                  <div className="text-xs text-gray-600">Donations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e74c3c]">{impact.streak}</div>
                  <div className="text-xs text-gray-600">Current streak</div>
                </div>
              </div>
            </NCardContent>
          </NCard>

          <NCard>
            <NCardHeader>
              <NCardTitle className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-[#e74c3c]" />
                My Requests
              </NCardTitle>
            </NCardHeader>
            <NCardContent className="text-center">
              <div className="text-2xl font-bold text-[#e74c3c]">{myRequests.length}</div>
              <div className="text-xs text-gray-600">Active requests</div>
              <NButton onClick={() => document.getElementById("my-requests-section")?.scrollIntoView({ behavior: "smooth" })} className="mt-2 text-sm">
                View
              </NButton>
            </NCardContent>
          </NCard>

          <NCard className="lg:col-span-3">
            <NCardHeader>
              <NCardTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#e74c3c]" />
                Nearby Requests
              </NCardTitle>
            </NCardHeader>
            <NCardContent className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {requestsWithDistance.map((r) => (
                <NCard key={r.id}>
                  <NCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-bold text-[#e74c3c]">
                        {r.blood_type}
                        {r.rh_factor}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {r?.dist ? `${r.dist.toFixed(1)} km` : "—"}
                      </div>
                    </div>
                  </NCardHeader>
                  <NCardContent>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Patient:</strong> {r.patient_name}
                      </p>
                      <p>
                        <strong>Hospital:</strong> {r.hospital_name}
                      </p>
                      <p>
                        <strong>Urgency:</strong> <span className="font-semibold text-red-500">{r.urgency}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <NButton
                        onClick={() => handleAcceptRequest(String(r.id))}
                        disabled={accepting === String(r.id) || r.status === "fulfilled"}
                        className="w-full bg-green-500 text-white shadow-md hover:bg-green-600 disabled:bg-gray-400"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {accepting === String(r.id) ? "Accepting..." : r.status === "fulfilled" ? "Accepted" : "Accept"}
                      </NButton>
                      <NButton className="w-full bg-blue-500 text-white shadow-md hover:bg-blue-600">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </NButton>
                    </div>
                  </NCardContent>
                </NCard>
              ))}
            </NCardContent>
          </NCard>

          <NCard className="lg:col-span-3" id="my-requests-section">
            <NCardHeader>
              <NCardTitle className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-[#e74c3c]" />
                My Requests
              </NCardTitle>
            </NCardHeader>
            <NCardContent className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {myRequests.map((r) => (
                <NCard key={r.id}>
                  <NCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-bold text-[#e74c3c]">
                        {r.blood_type}
                        {r.rh_factor}
                      </div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {r.status}
                      </div>
                    </div>
                  </NCardHeader>
                  <NCardContent>
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Patient:</strong> {r.patient_name}
                      </p>
                      <p>
                        <strong>Hospital:</strong> {r.hospital_name}
                      </p>
                      <p>
                        <strong>Urgency:</strong> <span className="font-semibold text-red-500">{r.urgency}</span>
                      </p>
                      <p>
                        <strong>Created:</strong> {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm">Donors ({r.request_responses.length})</h4>
                      <div className="mt-2 space-y-2">
                        {r.request_responses.length > 0 ? (
                          r.request_responses.map((d: any) => (
                            <div key={d.id} className="flex items-center gap-2">
                              <img src={d.users.user_profiles.profile_picture_url || "/placeholder-user.jpg"} alt="donor" className="w-8 h-8 rounded-full" />
                              <div>
                                <p className="text-sm font-semibold">{d.users.name}</p>
                                <p className="text-xs text-gray-500">
                                  {d.users.user_profiles.blood_type}
                                  {d.users.user_profiles.rh_factor}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No donors have responded to this request yet.</p>
                        )}
                      </div>
                    </div>
                  </NCardContent>
                </NCard>
              ))}
            </NCardContent>
          </NCard>

          <NCard>
            <NCardHeader>
              <NCardTitle className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#e74c3c]" />
                Next Donation
              </NCardTitle>
            </NCardHeader>
            <NCardContent className="text-center">
              {nextDonationDate ? (
                differenceInDays(nextDonationDate, new Date()) > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-[#e74c3c]">
                      {differenceInDays(nextDonationDate, new Date())} days
                    </div>
                    <div className="text-xs text-gray-600">until you're eligible</div>
                  </>
                ) : (
                  <div className="text-lg font-semibold text-green-600">You are eligible to donate!</div>
                )
              ) : (
                <div className="text-sm text-gray-600">No donation history</div>
              )}
              {appointments.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Next appointment: {formatDistanceToNow(new Date(appointments[0].appointment_datetime), { addSuffix: true })}
                </div>
              )}
            </NCardContent>
          </NCard>
        </div>
      </div>
      {isSosModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <NCard className="w-full max-w-lg">
            <NCardHeader>
              <NCardTitle>New Emergency Request</NCardTitle>
            </NCardHeader>
            <NCardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Blood Type</label>
                    <select
                      value={sosForm.blood_type}
                      onChange={(e) => setSosForm({ ...sosForm, blood_type: e.target.value as "A" | "B" | "AB" | "O" })}
                      className="w-full mt-1"
                    >
                      <option>A</option>
                      <option>B</option>
                      <option>AB</option>
                      <option>O</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rh Factor</label>
                    <select
                      value={sosForm.rh_factor}
                      onChange={(e) => setSosForm({ ...sosForm, rh_factor: e.target.value as "+" | "-" })}
                      className="w-full mt-1"
                    >
                      <option>+</option>
                      <option>-</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Urgency</label>
                  <select
                    value={sosForm.urgency}
                    onChange={(e) => setSosForm({ ...sosForm, urgency: e.target.value as "moderate" | "urgent" | "critical" })}
                    className="w-full mt-1"
                  >
                    <option value="moderate">Moderate</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <NInput
                  label="Units Needed"
                  type="number"
                  value={String(sosForm.units_needed)}
                  onChange={(e) => setSosForm({ ...sosForm, units_needed: parseInt(e.target.value, 10) || 1 })}
                />
                <NInput
                  label="Patient Name"
                  type="text"
                  value={sosForm.patient_name}
                  onChange={(e) => setSosForm({ ...sosForm, patient_name: e.target.value })}
                />
                <NInput
                  label="Hospital"
                  type="text"
                  value={sosForm.hospital_name}
                  onChange={(e) => setSosForm({ ...sosForm, hospital_name: e.target.value })}
                />
                <NInput
                  label="Contact Phone"
                  type="text"
                  value={sosForm.contact_phone}
                  onChange={(e) => setSosForm({ ...sosForm, contact_phone: e.target.value })}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <NButton onClick={() => setIsSosModalOpen(false)} variant="secondary">
                  Cancel
                </NButton>
                <NButton onClick={handleSendRequest} disabled={loading}>
                  {loading ? "Sending..." : "Send Request"}
                </NButton>
              </div>
            </NCardContent>
          </NCard>
        </div>
      )}
    </>
  )
}
