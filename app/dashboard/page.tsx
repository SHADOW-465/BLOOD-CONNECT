"use client"

import { useEffect, useMemo, useState } from "react"
import { NButton, NCard, NModal, NField } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, HeartPulse, BellRing, Activity, Calendar, User as UserIcon } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { User } from "@supabase/supabase-js"
import { differenceInDays, formatDistanceToNow } from "date-fns"

type RequestMatch = {
  id: string
  distance_km: number
  score: number
  status: string
  emergency_requests: {
    id: string
    blood_type: string
    rh: string
    urgency: string
    created_at: string
  }
}

type MySentRequest = {
  id: string
  status: string
  created_at: string
  request_matches: {
    id: string
    distance_km: number
    score: number
    status: string
    profiles: {
      id: string
      name: string | null
    } | null
  }[]
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
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [myMatchedRequests, setMyMatchedRequests] = useState<RequestMatch[]>([])
  const [mySentRequest, setMySentRequest] = useState<MySentRequest | null>(null)
  const [impact, setImpact] = useState({ donations: 0, lives: 0, streak: 0 })
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [sosForm, setSosForm] = useState({
    bloodType: "A" as BloodType,
    rh: "+" as Rh,
    urgency: "high" as Urgency,
    units: 1,
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

      // Fetch profile, donations, and appointments in parallel
      const [profileRes, donationsRes, appointmentsRes] = await Promise.all([
        supabase.from("profiles").select("last_donation_date, blood_type, rh").eq("id", session.user.id).single(),
        supabase.from("donations").select("id, donated_at").eq("donor_id", session.user.id),
        supabase
          .from("appointments")
          .select("*")
          .eq("donor_id", session.user.id)
          .eq("status", "confirmed")
          .order("scheduled_at", { ascending: true })
          .limit(1),
      ])

      if (profileRes.data) {
        const profile = profileRes.data
        if (profile.last_donation_date) {
          const lastDonation = new Date(profile.last_donation_date)
          const nextEligible = new Date(lastDonation.setDate(lastDonation.getDate() + 56))
          setNextDonationDate(nextEligible)
        }
        if (profile.blood_type && profile.rh) {
          setSosForm((prev) => ({ ...prev, bloodType: profile.blood_type as BloodType, rh: profile.rh as Rh }))
        }
      }

      if (donationsRes.data) {
        setImpact({ donations: donationsRes.data.length, lives: donationsRes.data.length * 3, streak: 0 })
      }

      if (appointmentsRes.data) {
        setAppointments(appointmentsRes.data)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blood_type: sosForm.bloodType,
          rh: sosForm.rh,
          urgency: sosForm.urgency,
          units_needed: sosForm.units,
          location_lat: loc.lat,
          location_lng: loc.lng,
          radius_km: 50, // Increased radius
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      const newRequest = await res.json()
      // Immediately load the new request into state
      loadMySentRequest(newRequest.id)
    } catch (e) {
      console.log("[v0] SOS error", e)
    } finally {
      setLoading(false)
      setIsSosModalOpen(false)
    }
  }

  const loadMyMatchedRequests = async (userId: string) => {
    const { data, error } = await supabase
      .from("request_matches")
      .select(
        `
        id,
        distance_km,
        score,
        status,
        emergency_requests (
          id,
          blood_type,
          rh,
          urgency,
          created_at
        )
      `,
      )
      .eq("donor_id", userId)
      .order("created_at", { referencedTable: "emergency_requests", ascending: false })

    if (error) console.error("Error fetching matched requests:", error)
    else setMyMatchedRequests(data as any)
  }

  const loadMySentRequest = async (requestId: string) => {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select(
        `
        id,
        status,
        created_at,
        request_matches (
          id,
          distance_km,
          score,
          status,
          profiles (id, name)
        )
      `,
      )
      .eq("id", requestId)
      .single()

    if (error) console.error("Error fetching sent request:", error)
    else setMySentRequest(data as any)
  }

  useEffect(() => {
    if (!user) return

    // Initial data load
    loadMyMatchedRequests(user.id)

    // Set up real-time subscriptions
    const matchesChannel = supabase
      .channel("my-matched-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "request_matches",
          filter: `donor_id=eq.${user.id}`,
        },
        () => loadMyMatchedRequests(user.id),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(matchesChannel)
    }
  }, [supabase, user])

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NCard className="lg:col-span-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
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

          {mySentRequest ? (
            <NCard className="lg:col-span-3">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-[#e74c3c]" />
                <h3 className="font-semibold">My Active Request Status</h3>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold text-blue-600">{mySentRequest.status.toUpperCase()}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Sent {formatDistanceToNow(new Date(mySentRequest.created_at), { addSuffix: true })}
                </p>
                <h4 className="mt-4 font-medium text-sm">Notified Donors:</h4>
                <ul className="mt-2 space-y-2">
                  {mySentRequest.request_matches.map((match) => (
                    <li key={match.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                      <span>{match.profiles?.name || "Anonymous Donor"}</span>
                      <div className="flex gap-4">
                        <span>{match.distance_km.toFixed(1)} km</span>
                        <span>Score: {match.score.toFixed(0)}</span>
                        <span className="font-semibold">{match.status.toUpperCase()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </NCard>
          ) : (
            <NCard className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-[#e74c3c]" />
                <h3 className="font-semibold">My Alerts</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {myMatchedRequests.length > 0 ? (
                  myMatchedRequests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                      <div className="text-sm">
                        <div className="font-mono font-semibold">
                          {r.emergency_requests.blood_type}
                          {r.emergency_requests.rh}
                        </div>
                        <div className="text-xs text-gray-600">
                          Urgency: {r.emergency_requests.urgency} &middot;{" "}
                          {formatDistanceToNow(new Date(r.emergency_requests.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <MapPin className="w-4 h-4" />
                          {r.distance_km.toFixed(1)} km
                        </div>
                        <div className="text-xs text-gray-500">Score: {r.score.toFixed(0)}</div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active alerts for you right now. Great job!</p>
                )}
              </ul>
            </NCard>
          )}

          <NCard>
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <NButton onClick={() => location.assign("/schedule")}>Schedule Donation</NButton>
              <NButton onClick={() => location.assign("/blood-onboarding/availability")}>Update Availability</NButton>
              <NButton onClick={() => location.assign("/blood-onboarding/profile")}>View Profile</NButton>
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
