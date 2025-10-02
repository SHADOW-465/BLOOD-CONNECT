"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { NButton, NCard, NModal, NField, NBadge, NAlert, NList, NListItem } from "@/components/nui"
import { MapPin, BellRing, Activity, ShieldCheck, ShieldOff } from "lucide-react"
import { kmDistance } from "@/lib/compatibility"
import { formatDistanceToNow, addMonths } from "date-fns"
import { toast } from "sonner"
import RequestActionButtons from "@/components/RequestActionButtons"
import { useAuth } from "@/lib/hooks/useAuth"

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
  requester_id: string
}

type BloodType = "A" | "B" | "AB" | "O"
type Rh = "+" | "-"
type Urgency = "low" | "medium" | "high" | "critical"

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [isEligibleToDonate, setIsEligibleToDonate] = useState(true)
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null)

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

  const loadNearby = useCallback(async () => {
    try {
        const res = await fetch("/api/requests")
        if (!res.ok) throw new Error("Failed to fetch requests")
        const data = (await res.json()) as RequestRow[]
        setRequests(data)
    } catch(e) {
        toast.error("Could not load nearby requests.")
    }
  }, [])

  const fetchInitialData = useCallback(async () => {
    try {
        setIsLoadingData(true)
        const profileRes = await fetch("/api/profile")
        if (!profileRes.ok) return
        const profile = await profileRes.json()

        if (profile.last_donation_date) {
            const lastDonation = new Date(profile.last_donation_date)
            const nextEligibleDate = addMonths(lastDonation, 6)
            setNextDonationDate(nextEligibleDate)
            setIsEligibleToDonate(new Date() > nextEligibleDate)
        } else {
            setIsEligibleToDonate(true)
        }
    } catch(e) {
        console.error("Could not fetch initial data", e)
        toast.error("Could not load your user data.")
    } finally {
        setIsLoadingData(false)
    }
  }, [])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc(null),
      { enableHighAccuracy: true },
    )
    if(user) {
      loadNearby()
      fetchInitialData()
    }
  }, [user, loadNearby, fetchInitialData])

  async function handleSendRequest() {
    if (!loc) return
    setSubmittingRequestId("sos")
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
          patient_name: sosForm.patientName,
          patient_age: sosForm.patientAge,
          hospital: sosForm.hospital,
          contact: sosForm.contact,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      toast.success("Emergency request sent to nearby donors.")
      await loadNearby()
    } catch (e) {
      toast.error("Failed to send emergency request.")
    } finally {
      setSubmittingRequestId(null)
      setIsSosModalOpen(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    if (!isEligibleToDonate) {
        toast.warning("You are not eligible to donate yet.", {
            description: `You can donate again ${nextDonationDate ? formatDistanceToNow(nextDonationDate, { addSuffix: true }) : 'soon'}. You can still share requests.`
        })
        return
    }
    
    setSubmittingRequestId(requestId)
    try {
      const response = await fetch(`/api/requests/${requestId}/accept`, { method: 'POST' })
      if (response.ok) {
        toast.success("Request accepted! The requester has been notified.")
        // The request list should be re-fetched to show the new status
        await loadNearby()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to accept request")
      }
    } catch (error) {
      toast.error("An error occurred while accepting the request.")
    } finally {
        setSubmittingRequestId(null)
    }
  }

  const handleShareRequest = async (request: any) => {
    try {
      const response = await fetch(`/api/requests/${request.id}/share`)
      const shareData = await response.json()
      
      if (!response.ok) {
        toast.error("Failed to generate share message")
        return
      }
      
      await fetch(`/api/requests/${request.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: navigator.share ? 'native' : 'clipboard' })
      })
      
      if (navigator.share) {
        await navigator.share({ title: shareData.title, text: shareData.message, url: shareData.url })
        toast.success("Request shared successfully!")
      } else {
        await navigator.clipboard.writeText(`${shareData.message}\n${shareData.url}`)
        toast.success("Share message copied to clipboard!")
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      toast.error("Failed to share request")
    }
  }

  const requestsWithDistance = useMemo(() => {
    if (!loc) return requests
    return requests
      .map((r) => ({
        ...r,
        dist: r.location_lat && r.location_lng ? kmDistance(loc.lat, loc.lng, r.location_lat, r.location_lng) : null,
      }))
      .sort((a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9))
  }, [requests, loc])

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">

          <NButton
            onClick={() => setIsSosModalOpen(true)}
            disabled={!loc}
            className="w-full h-16 text-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg"
          >
            <BellRing className="w-6 h-6 mr-3" />
            Request Blood
          </NButton>

          <NCard>
            {isEligibleToDonate ? (
                <div className="flex items-center text-green-600">
                    <ShieldCheck className="w-6 h-6 mr-3"/>
                    <div>
                        <h3 className="font-semibold">You are eligible to donate!</h3>
                        <p className="text-sm text-gray-600">You can accept blood requests and save lives.</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center text-orange-600">
                    <ShieldOff className="w-6 h-6 mr-3"/>
                    <div>
                        <h3 className="font-semibold">Not eligible to donate yet</h3>
                        <p className="text-sm text-gray-600">
                            You can donate again {nextDonationDate ? formatDistanceToNow(nextDonationDate, { addSuffix: true }) : 'soon'}.
                            You can still share requests.
                        </p>
                    </div>
                </div>
            )}
          </NCard>

          <NCard>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-red-500" />
                Nearby Emergency Requests
            </h2>
            {isLoadingData ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
                </div>
            ) : requestsWithDistance.length > 0 ? (
              <NList>
                {requestsWithDistance.map((r) => (
                  <NListItem key={r.id}>
                    <div className="flex items-center justify-between mb-3">
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
                    </div>
                    <RequestActionButtons
                      request={r}
                      onAccept={handleAcceptRequest}
                      onShare={handleShareRequest}
                      isEligibleToDonate={isEligibleToDonate}
                      isAccepting={submittingRequestId === r.id}
                      isAccepted={r.status.toLowerCase() === 'matched'}
                      isOwnRequest={!!user && user.id === r.requester_id}
                    />
                  </NListItem>
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
        </div>
      </div>
      <NModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)}>
        <h2 className="text-xl font-semibold text-red-500">New Emergency Request</h2>
        <p className="text-sm text-gray-500 mb-6">Your location will be used to find nearby donors.</p>
        <div className="space-y-4">
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
          <NButton onClick={handleSendRequest} disabled={submittingRequestId === 'sos'}>
            {submittingRequestId === 'sos' ? "Sending..." : "Send Request"}
          </NButton>
        </div>
      </NModal>
    </>
  )
}