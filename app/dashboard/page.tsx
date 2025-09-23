"use client"

import { useEffect, useMemo, useState } from "react"
import { NButton, NCard, NModal, NField, NToggle } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, HeartPulse, BellRing, Activity, Calendar, User as UserIcon, Share2 } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { User } from "@supabase/supabase-js"
import { differenceInDays, format, formatDistanceToNow } from "date-fns"

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
  } | null
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

type Profile = {
  id: string
  name: string | null
  availability_status: "available" | "unavailable"
  last_donation_date: string | null
  blood_type: BloodType | null
  rh: Rh | null
  location_lat: number | null
  location_lng: number | null
}

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [myMatchedRequests, setMyMatchedRequests] = useState<RequestMatch[]>([])
  const [allNearbyRequests, setAllNearbyRequests] = useState<any[]>([])
  const [mySentRequest, setMySentRequest] = useState<MySentRequest | null>(null)
  const [activeTab, setActiveTab] = useState<"alerts" | "nearby">("alerts")
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
      if (!session) return
      setUser(session.user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      if (profileData) {
        setProfile(profileData as Profile)
        if (profileData.last_donation_date) {
          const lastDonation = new Date(profileData.last_donation_date)
          const nextEligible = new Date(lastDonation.setDate(lastDonation.getDate() + 56))
          setNextDonationDate(nextEligible)
        }
        if (profileData.blood_type && profileData.rh) {
          setSosForm((prev) => ({ ...prev, bloodType: profileData.blood_type as BloodType, rh: profileData.rh as Rh }))
        }
      }

      const { data: donations } = await supabase.from("donations").select("id").eq("donor_id", session.user.id)
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
    const { error } = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blood_type: sosForm.bloodType,
        rh: sosForm.rh,
        urgency: sosForm.urgency,
        units_needed: sosForm.units,
        location_lat: loc.lat,
        location_lng: loc.lng,
        radius_km: 50,
      }),
    })
    if (error) {
      alert("Failed to send request.")
    } else {
      setIsSosModalOpen(false)
      alert("Request sent successfully!")
    }
  }

  const loadMyMatchedRequests = async (userId: string) => {
    const { data } = await supabase
      .from("request_matches")
      .select(`*, emergency_requests(*)`)
      .eq("donor_id", userId)
      .order("created_at", { ascending: false })
    setMyMatchedRequests(data as any)
  }

  const loadAllNearbyRequests = async () => {
    const { data } = await supabase.from("emergency_requests").select("*").eq("status", "open")
    setAllNearbyRequests(data || [])
  }

  const loadMySentRequest = async (userId: string) => {
    const { data } = await supabase
      .from("emergency_requests")
      .select(`*, request_matches(*, profiles(name))`)
      .eq("requester_id", userId)
      .eq("status", "open")
      .single()
    setMySentRequest(data as any)
  }

  useEffect(() => {
    if (!user) return
    loadMyMatchedRequests(user.id)
    loadAllNearbyRequests()
    loadMySentRequest(user.id)

    const changes = supabase
      .channel("dashboard-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadMyMatchedRequests(user.id)
        loadAllNearbyRequests()
        loadMySentRequest(user.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(changes)
    }
  }, [supabase, user])

  async function handleShare(request: RequestMatch["emergency_requests"]) {
    if (!request) {
      alert("Cannot share this request, details are missing.")
      return
    }
    const shareData = {
      title: "Urgent Blood Request",
      text: `An urgent request for ${request.blood_type}${request.rh} blood has been made. Your help can save a life.`,
      url: window.location.origin,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(`${shareData.text} \nFind out more: ${shareData.url}`)
      alert("Request details copied to clipboard!")
    }
  }

  async function handleMatchResponse(matchId: string) {
    const originalRequests = myMatchedRequests
    setMyMatchedRequests((prev) => prev.map((r) => (r.id === matchId ? { ...r, status: "accepted" } : r)))

    const { error } = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    })

    if (error) {
      setMyMatchedRequests(originalRequests)
      alert("Failed to update status.")
    }
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile && !profile.location_lat && (
            <NCard className="lg:col-span-3 bg-yellow-100/80">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
              {appointments.length > 0 ? (
                <div>
                  <p className="text-sm font-medium">Your next appointment is:</p>
                  <p className="text-lg font-bold text-[#e74c3c] mt-1">
                    {format(new Date(appointments[0].scheduled_at), "EEEE, MMM d")}
                  </p>
                  <p className="text-md font-semibold">{format(new Date(appointments[0].scheduled_at), "p")}</p>
                  <p className="text-xs text-gray-500 mt-1">{appointments[0].location}</p>
                </div>
              ) : nextDonationDate ? (
                differenceInDays(nextDonationDate, new Date()) > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-[#e74c3c]">
                      {differenceInDays(nextDonationDate, new Date())} days
                    </div>
                    <div className="text-xs text-gray-600">until you're eligible</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-semibold text-green-600">You are eligible to donate!</p>
                    <NButton onClick={() => (window.location.href = "/schedule")} className="w-full h-10">
                      Schedule Now
                    </NButton>
                  </div>
                )
              ) : (
                <div className="text-sm text-gray-600">No donation history</div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#e74c3c]" />
                  <h3 className="font-semibold">Requests</h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-200">
                  <button
                    onClick={() => setActiveTab("alerts")}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      activeTab === "alerts" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    My Alerts
                  </button>
                  <button
                    onClick={() => setActiveTab("nearby")}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      activeTab === "nearby" ? "bg-white shadow-sm" : "text-gray-600"
                    }`}
                  >
                    All Nearby
                  </button>
                </div>
              </div>

              {activeTab === "alerts" && (
                <ul className="mt-4 space-y-3">
                  {myMatchedRequests.length > 0 ? (
                    myMatchedRequests.filter(r => r.emergency_requests).map((r) => (
                      <li key={r.id} className="p-3 rounded-lg bg-red-50/70">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-mono font-semibold">
                              {r.emergency_requests!.blood_type} {r.emergency_requests!.rh}
                            </div>
                            <div className="text-xs text-gray-600">
                              Urgency: {r.emergency_requests!.urgency}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {r.distance_km.toFixed(1)} km away
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-red-100 flex justify-between items-center">
                          <NButton
                            onClick={() => handleShare(r.emergency_requests)}
                            className="h-8 px-3 text-xs bg-blue-100 text-blue-800"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </NButton>
                          {r.status === "notified" ? (
                            <NButton onClick={() => handleMatchResponse(r.id)} className="h-8 px-4 text-xs">
                              Accept
                            </NButton>
                          ) : (
                            <p className="text-xs font-semibold text-gray-700">
                              You responded: <span className="uppercase">{r.status}</span>
                            </p>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 pt-4">No active alerts for you right now.</p>
                  )}
                </ul>
              )}

              {activeTab === "nearby" && (
                <ul className="mt-4 space-y-3">
                  {allNearbyRequests.length > 0 ? (
                    allNearbyRequests.map((r) => (
                      <li key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                        <div className="text-sm">
                          <div className="font-mono">
                            {r.blood_type} {r.rh}
                          </div>
                          <div className="text-xs text-gray-600">Urgency: {r.urgency}</div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {loc && r.location_lat && r.location_lng
                            ? `${kmDistance(loc.lat, loc.lng, r.location_lat, r.location_lng).toFixed(1)} km`
                            : "—"}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 pt-4">No nearby requests at the moment.</p>
                  )}
                </ul>
              )}
            </NCard>
          )}

          <NCard>
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <NButton onClick={() => location.assign("/schedule")}>Schedule Donation</NButton>
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
          <NButton onClick={handleSendRequest}>
            Send Request
          </NButton>
        </div>
      </NModal>
    </>
  )
}
