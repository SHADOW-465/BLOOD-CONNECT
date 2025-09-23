"use client"

import { useEffect, useMemo, useState } from "react"
import { NButton, NCard, NModal, NField } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, HeartPulse, BellRing, Activity, Calendar, User as UserIcon, Share2, Check } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { User } from "@supabase/supabase-js"
import { differenceInDays, format, formatDistanceToNow } from "date-fns"

type RequestRow = {
  id: string
  blood_type: string
  rh: string
  urgency: string
  location_lat: number | null
  location_lng: number | null
  status: string
  created_at: string
  name: string
  age: number
  hospital: string
  contact: string
}

type Appointment = {
  id: string
  scheduled_at: string
  location: string
  status: string
}

type BloodType = "A" | "B" | "AB" | "O"
type Rh = "+" | "-"
type Urgency = "low" | "medium" | "high" | "critical"

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [impact, setImpact] = useState({ donations: 0, lives: 0, streak: 0 })
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [sosForm, setSosForm] = useState({
    bloodType: "A" as BloodType,
    rh: "+" as Rh,
    urgency: "high" as Urgency,
    units: 1,
    name: "Jayasurya. J",
    age: 26,
    hospital: "Rajiv Gandhi government general hospital",
    contact: "8015118403",
  })

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc(null),
      { enableHighAccuracy: true },
    )

    const getUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        return
      }
      setUser(session.user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      if (profileData) {
        setProfile(profileData)
        if (profileData.last_donation_date) {
          const lastDonation = new Date(profileData.last_donation_date)
          const nextEligible = new Date(lastDonation.setDate(lastDonation.getDate() + 56))
          setNextDonationDate(nextEligible)
        }
        if (profileData.blood_type && profileData.rh) {
          setSosForm((prev) => ({ ...prev, bloodType: profileData.blood_type, rh: profileData.rh }))
        }
      }

      const { data: donations } = await supabase.from("donations").select("id, donated_at").eq("donor_id", session.user.id)
      if (donations) {
        setImpact({ donations: donations.length, lives: donations.length * 3, streak: 0 })
      }

      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("*")
        .eq("donor_id", session.user.id)
        .eq("status", "confirmed")
        .order("scheduled_at", { ascending: true })
        .limit(1)
      if (appointmentData) {
        setAppointments(appointmentData)
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
          requester_id: user.id,
          blood_type: sosForm.bloodType,
          rh: sosForm.rh,
          urgency: sosForm.urgency,
          units_needed: sosForm.units,
          location_lat: loc.lat,
          location_lng: loc.lng,
          radius_km: 10,
          name: sosForm.name,
          age: sosForm.age,
          hospital: sosForm.hospital,
          contact: sosForm.contact,
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
      // First, fetch the full request details to get the requester_id
      const requestRes = await fetch(`/api/requests/${requestId}`)
      if (!requestRes.ok) {
        throw new Error("Failed to fetch request details")
      }
      const request = await requestRes.json()

      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: "POST",
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to accept request")
      }

      // Create a notification for the requester
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({
          user_id: request.requester_id,
          title: "Your blood request has been accepted!",
          message: `A donor has accepted your request for ${request.blood_type}${request.rh} blood.`,
        }),
      })

      alert("Request accepted! The requester has been notified.")
      loadNearby() // to get updated request status
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
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, () => {
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
        dist: r.location_lat && r.location_lng ? kmDistance(loc.lat, loc.lng, r.location_lat, r.location_lng) : null,
      }))
      .sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9))
  }, [requests, loc])

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile && !profile.location_lat && (
            <NCard className="lg:col-span-3 bg-yellow-100/80">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-yellow-800">Update Your Location</h2>
                  <p className="text-sm text-yellow-700">
                    Your profile is missing a location. Please update it to be matched with nearby requests.
                  </p>
                </div>
                <NButton
                  onClick={() => (window.location.href = "/blood-onboarding/profile")}
                  className="min-w-56 h-12 bg-yellow-300 text-yellow-900"
                >
                  Update Profile
                </NButton>
              </div>
            </NCard>
          )}
          <NCard className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#e74c3c]">Emergency Request</h2>
                <p className="text-sm text-gray-600">Your location will be used to notify nearby compatible donors.</p>
              </div>
              <NButton onClick={() => setIsSosModalOpen(true)} disabled={!loc} className="min-w-56 h-14 text-lg">
                <BellRing className="w-5 h-5" />
                SOS Now
              </NButton>
            </div>
          </NCard>

          <NCard className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">Impact Summary</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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
          </NCard>

          <NCard>
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">My Requests</h3>
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-[#e74c3c]">{myRequests.length}</div>
              <div className="text-xs text-gray-600">Active requests</div>
              <NButton onClick={() => document.getElementById("my-requests-section")?.scrollIntoView({ behavior: "smooth" })} className="mt-2 text-sm">
                View
              </NButton>
            </div>
          </NCard>

          <NCard className="lg:col-span-3">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">Nearby Requests</h3>
            </div>
            <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
              {requestsWithDistance.map((r) => (
                <div key={r.id} className="bg-[#f0f3fa] rounded-2xl p-4 flex flex-col shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg font-bold text-[#e74c3c]">
                      {r.blood_type}
                      {r.rh}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {r?.dist ? `${r.dist.toFixed(1)} km` : "—"}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <strong>Patient:</strong> {r.name}, {r.age}
                    </p>
                    <p>
                      <strong>Hospital:</strong> {r.hospital}
                    </p>
                    <p>
                      <strong>Contact:</strong> {r.contact}
                    </p>
                    <p>
                      <strong>Urgency:</strong> <span className="font-semibold text-red-500">{r.urgency}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex-grow" />
                  <div className="flex gap-2 mt-auto">
                    <NButton
                      onClick={() => handleAcceptRequest(r.id)}
                      disabled={accepting === r.id || r.status === "matched"}
                      className="w-full bg-green-500 text-white shadow-md hover:bg-green-600 disabled:bg-gray-400"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {accepting === r.id ? "Accepting..." : r.status === "matched" ? "Accepted" : "Accept"}
                    </NButton>
                    <NButton className="w-full bg-blue-500 text-white shadow-md hover:bg-blue-600">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </NButton>
                  </div>
                </div>
              ))}
            </div>
          </NCard>

          <NCard className="lg:col-span-3" id="my-requests-section">
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">My Requests</h3>
            </div>
            <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
              {myRequests.map((r) => (
                <div key={r.id} className="bg-[#f0f3fa] rounded-2xl p-4 flex flex-col shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg font-bold text-[#e74c3c]">
                      {r.blood_type}
                      {r.rh}
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === "open" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {r.status}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <strong>Patient:</strong> {r.name}, {r.age}
                    </p>
                    <p>
                      <strong>Hospital:</strong> {r.hospital}
                    </p>
                    <p>
                      <strong>Urgency:</strong> <span className="font-semibold text-red-500">{r.urgency}</span>
                    </p>
                    <p>
                      <strong>Created:</strong> {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm">Donors ({r.donations.length})</h4>
                    <div className="mt-2 space-y-2">
                      {r.donations.length > 0 ? (
                        r.donations.map((d: any) => (
                          <div key={d.id} className="flex items-center gap-2">
                            <img src={d.profiles.avatar_url || "/placeholder-user.jpg"} alt="donor" className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="text-sm font-semibold">{d.profiles.name}</p>
                              <p className="text-xs text-gray-500">
                                {d.profiles.blood_type}
                                {d.profiles.rh}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No donors have accepted this request yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NCard>

          <NCard>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">Next Donation</h3>
            </div>
            <div className="mt-4 text-center">
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
                  Next appointment: {formatDistanceToNow(new Date(appointments[0].scheduled_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </NCard>
        </div>
      </div>
      <NModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)}>
        <h2 className="text-xl font-semibold text-[#e74c3c]">New Emergency Request</h2>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <NField
              label="Blood Type"
              as="select"
              value={sosForm.bloodType}
              onChange={(e) => setSosForm({ ...sosForm, bloodType: e.target.value as BloodType })}
            >
              <option>A</option>
              <option>B</option>
              <option>AB</option>
              <option>O</option>
            </NField>
            <NField
              label="Rh Factor"
              as="select"
              value={sosForm.rh}
              onChange={(e) => setSosForm({ ...sosForm, rh: e.target.value as Rh })}
            >
              <option>+</option>
              <option>-</option>
            </NField>
          </div>
          <NField
            label="Urgency"
            as="select"
            value={sosForm.urgency}
            onChange={(e) => setSosForm({ ...sosForm, urgency: e.target.value as Urgency })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </NField>
          <NField
            label="Units needed"
            type="number"
            value={sosForm.units}
            onChange={(e) => setSosForm({ ...sosForm, units: parseInt(e.target.value, 10) || 1 })}
          />
          <NField
            label="Name"
            type="text"
            value={sosForm.name}
            onChange={(e) => setSosForm({ ...sosForm, name: e.target.value })}
          />
          <NField
            label="Age"
            type="number"
            value={sosForm.age}
            onChange={(e) => setSosForm({ ...sosForm, age: parseInt(e.target.value, 10) || 0 })}
          />
          <NField
            label="Hospital"
            type="text"
            value={sosForm.hospital}
            onChange={(e) => setSosForm({ ...sosForm, hospital: e.target.value })}
          />
          <NField
            label="Contact"
            type="text"
            value={sosForm.contact}
            onChange={(e) => setSosForm({ ...sosForm, contact: e.target.value })}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <NButton onClick={() => setIsSosModalOpen(false)} className="bg-gray-200 text-gray-700">
            Cancel
          </NButton>
          <NButton onClick={handleSendRequest} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </NButton>
        </div>
      </NModal>
    </>
  )
}
