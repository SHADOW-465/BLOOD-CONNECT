"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useApp } from "../AppContext"
import { kmDistance } from "@/lib/compatibility"
import { formatDistanceToNow, addMonths, format } from "date-fns"
import { toast } from "sonner"
import { useSupabase } from "@/lib/supabase/provider"
import EligibilityStatus from "@/components/EligibilityStatus"
import MyImpact from "@/components/MyImpact"
import RequestCard from "@/components/RequestCard"
import RequestCardSkeleton from "@/components/RequestCardSkeleton"
import { FileText } from "lucide-react"

type RequestRow = {
  id: string
  blood_type: string
  rh: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
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

export default function DashboardPage() {
  const { session } = useSupabase()
  const { loc, setLoc, registerLoadNearby } = useApp()
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [isEligibleToDonate, setIsEligibleToDonate] = useState(true)
  const [nextDonationDate, setNextDonationDate] = useState<Date | null>(null)
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null)

  const loadNearby = useCallback(async () => {
    try {
        const res = await fetch("/api/requests-v2")
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
        await loadNearby()
    } catch(e) {
        console.error("Could not fetch initial data", e)
        toast.error("Could not load your user data.")
    } finally {
        setIsLoadingData(false)
    }
  }, [loadNearby])

  useEffect(() => {
    registerLoadNearby(fetchInitialData);
  }, [registerLoadNearby, fetchInitialData]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc(null),
      { enableHighAccuracy: true },
    )
    if(session) {
      fetchInitialData()
    } else {
      setIsLoadingData(false)
      setRequests([])
    }
  }, [session, fetchInitialData, setLoc])

  const handleAcceptRequest = async (requestId: string) => {
    if (!isEligibleToDonate) {
        toast.warning("You are not eligible to donate yet.", {
            description: `You can donate again ${nextDonationDate ? formatDistanceToNow(nextDonationDate, { addSuffix: true }) : 'soon'}.`
        })
        return
    }
    
    setSubmittingRequestId(requestId)
    try {
      const response = await fetch(`/api/requests/${requestId}/accept`, { method: 'POST' })
      if (response.ok) {
        toast.success("Request accepted! The requester has been notified.")
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

  const handleDetailsRequest = (requestId: string) => {
    // In a real app, this would navigate to a details page or open a detailed modal.
    toast.info("Details button clicked.", { description: `This would show more details for request ID: ${requestId}` })
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

  return (
    <div className="space-y-6">
      {/* Quick Stats & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <EligibilityStatus eligible={isEligibleToDonate} nextDate={nextDonationDate} />
        <MyImpact />
      </div>

      {/* Nearby Requests Feed */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark-grey">Nearby Requests</h2>
          <button className="text-sm font-semibold text-primary-red">See All</button>
        </div>

        <div className="space-y-4">
          {isLoadingData ? (
            <>
              <RequestCardSkeleton />
              <RequestCardSkeleton />
              <RequestCardSkeleton />
            </>
          ) : requestsWithDistance.length > 0 ? (
            requestsWithDistance.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                onAccept={handleAcceptRequest}
                onDetails={handleDetailsRequest}
              />
            ))
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-dark-grey">No Urgent Requests Nearby</h3>
                <p className="text-medium-grey mt-1">We'll notify you immediately if one appears.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}