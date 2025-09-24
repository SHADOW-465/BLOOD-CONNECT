"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { NButton, NCard, NModal, NField, NStatCard, NBadge, NAlert, NList, NListItem, NProgress } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, HeartPulse, BellRing, Activity, Calendar, User as UserIcon, Clock, Users, TrendingUp } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { User } from "@supabase/supabase-js"
import { differenceInDays, formatDistanceToNow } from "date-fns"

type RequestRow = {
  id: string
  blood_type: string
  rh: string
  urgency: string
  location_lat: number | null
  location_lng: number | null
  status: string
  created_at: string
  patient_name?: string
  patient_age?: number
  hospital?: string
  contact?: string
  matches_count?: number
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
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [impact, setImpact] = useState({ donations: 0, lives: 0, streak: 0, responseRate: 0 })
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [sosForm, setSosForm] = useState({
    bloodType: "A" as BloodType,
    rh: "+" as Rh,
    urgency: "high" as Urgency,
    units: 1,
    patientName: "",
    patientAge: "",
    hospital: "",
    contact: "",
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

      const { data: profile } = await supabase.from("profiles").select("last_donation_date, blood_type, rh").eq("id", session.user.id).single()
      if (profile) {
        if (profile.last_donation_date) {
          const lastDonation = new Date(profile.last_donation_date)
          const nextEligible = new Date(lastDonation.setDate(lastDonation.getDate() + 56))
          setNextDonationDate(nextEligible)
        }
        if (profile.blood_type && profile.rh) {
          setSosForm((prev) => ({ ...prev, bloodType: profile.blood_type, rh: profile.rh }))
        }
      }

      const { data: donations } = await supabase.from("donations").select("id, donated_at").eq("donor_id", session.user.id)
      
      // Calculate response rate
      const { data: matches } = await supabase
        .from("request_matches")
        .select("status")
        .eq("donor_id", session.user.id)
      
      let responseRate = 0
      if (matches && matches.length > 0) {
        const accepted = matches.filter(m => m.status === 'accepted').length
        responseRate = Math.round((accepted / matches.length) * 100)
      }
      
      if (donations) {
        setImpact({ 
          donations: donations.length, 
          lives: donations.length * 3, 
          streak: 0,
          responseRate 
        })
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
          patient_name: sosForm.patientName,
          patient_age: sosForm.patientAge,
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

  async function loadNearby() {
    const res = await fetch("/api/requests")
    if (!res.ok) return
    const data = (await res.json()) as RequestRow[]
    setRequests(data)
  }

  useEffect(() => {
    loadNearby()
    const channel = supabase
      .channel("requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "emergency_requests" }, loadNearby)
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

          <NStatCard
            title="Lives Saved"
            value={impact.lives}
            subtitle="Through your donations"
            icon={<HeartPulse className="w-6 h-6" />}
            className="lg:col-span-1"
          />
          
          <NStatCard
            title="Total Donations"
            value={impact.donations}
            subtitle="Blood units donated"
            icon={<TrendingUp className="w-6 h-6" />}
            className="lg:col-span-1"
          />
          
          <NStatCard
            title="Response Rate"
            value={`${impact.responseRate}%`}
            subtitle="Emergency requests accepted"
            icon={<Users className="w-6 h-6" />}
            className="lg:col-span-1"
          />

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

          <NCard className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-[#e74c3c]" />
              <h3 className="font-semibold">Nearby Emergency Requests</h3>
            </div>
            {requestsWithDistance.length > 0 ? (
              <NList>
                {requestsWithDistance.map((r) => (
                  <Link href={`/emergency-requests/${r.id}`} key={r.id}>
                    <NListItem className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-lg font-bold">
                          {r.blood_type}{r.rh}
                        </span>
                        <NBadge variant={r.urgency === 'critical' ? 'error' : r.urgency === 'high' ? 'warning' : 'info'}>
                          {r.urgency}
                        </NBadge>
                      </div>
                      {r.patient_name && (
                        <div className="text-sm text-gray-600">
                          Patient: {r.patient_name} {r.patient_age && `(${r.patient_age} years)`}
                        </div>
                      )}
                      {r.hospital && (
                        <div className="text-xs text-gray-500">
                          Hospital: {r.hospital}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {r?.dist ? `${r.dist.toFixed(1)} km` : "—"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    </NListItem>
                  </Link>
                ))}
              </NList>
            ) : (
              <NAlert type="info">
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">No emergency requests nearby</p>
                  <p className="text-sm text-gray-500">Check back later or expand your radius</p>
                </div>
              </NAlert>
            )}
          </NCard>

          <NCard>
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <NButton onClick={() => location.assign("/schedule")}>Schedule Donation</NButton>
              <NButton onClick={() => location.assign("/profile")}>Update Availability</NButton>
              <NButton onClick={() => location.assign("/profile")}>View Profile</NButton>
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
          <div className="grid grid-cols-2 gap-4">
            <NField
              label="Patient Name"
              type="text"
              value={sosForm.patientName}
              onChange={(e) => setSosForm({ ...sosForm, patientName: e.target.value })}
              placeholder="Enter patient name"
            />
            <NField
              label="Patient Age"
              type="number"
              value={sosForm.patientAge}
              onChange={(e) => setSosForm({ ...sosForm, patientAge: e.target.value })}
              placeholder="Enter patient age"
            />
          </div>
          <NField
            label="Hospital"
            type="text"
            value={sosForm.hospital}
            onChange={(e) => setSosForm({ ...sosForm, hospital: e.target.value })}
            placeholder="Enter hospital name"
          />
          <NField
            label="Contact Number"
            type="tel"
            value={sosForm.contact}
            onChange={(e) => setSosForm({ ...sosForm, contact: e.target.value })}
            placeholder="Enter contact number"
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
