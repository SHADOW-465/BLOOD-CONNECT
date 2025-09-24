"use client"

import { useEffect, useState } from "react"
import { NButton, NCard, NModal, NField, NBadge, NAlert, NList, NListItem, NProgress } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { MapPin, Clock, Phone, User, Heart, Navigation, CheckCircle, XCircle } from "lucide-react"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { formatDistanceToNow } from "date-fns"

type EmergencyRequest = {
  id: string
  blood_type: string
  rh: string
  urgency: string
  units_needed: number
  location_lat: number | null
  location_lng: number | null
  status: string
  created_at: string
  patient_name?: string
  patient_age?: number
  hospital?: string
  contact?: string
  matches_count?: number
  distance?: number
}

type RequestMatch = {
  id: string
  request_id: string
  donor_id: string
  distance_km: number
  score: number
  status: string
  response_time_seconds?: number
  created_at: string
  donor_name?: string
  donor_phone?: string
}

export default function EmergencyRequestsPage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [requests, setRequests] = useState<EmergencyRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null)
  const [matches, setMatches] = useState<RequestMatch[]>([])
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false)
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined'>('accepted')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      }
    }
    getUserData()
  }, [supabase])

  useEffect(() => {
    loadRequests()
    
    // Set up real-time subscription
    const channel = supabase
      .channel("emergency_requests")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "emergency_requests" 
      }, loadRequests)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })

    if (data) {
      setRequests(data)
    }
  }

  const loadMatches = async (requestId: string) => {
    const { data, error } = await supabase
      .from("request_matches")
      .select(`
        *,
        profiles!request_matches_donor_id_fkey(name, phone)
      `)
      .eq("request_id", requestId)
      .order("score", { ascending: false })

    if (data) {
      const matchesWithNames = data.map(match => ({
        ...match,
        donor_name: match.profiles?.name,
        donor_phone: match.profiles?.phone
      }))
      setMatches(matchesWithNames)
    }
  }

  const handleRespondToRequest = async () => {
    if (!selectedRequest || !user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: responseStatus }),
      })

      if (response.ok) {
        setIsRespondModalOpen(false)
        setSelectedRequest(null)
        loadRequests()
      }
    } catch (error) {
      console.error("Error responding to request:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'declined': return 'error'
      case 'en_route': return 'info'
      case 'arrived': return 'success'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#e74c3c] mb-2">Emergency Blood Requests</h1>
          <p className="text-gray-600">Real-time emergency blood requests in your area</p>
        </div>

        <div className="grid gap-6">
          {requests.length > 0 ? (
            requests.map((request) => (
              <NCard key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-[#e74c3c]">
                      {request.blood_type}{request.rh}
                    </div>
                    <NBadge variant={getUrgencyColor(request.urgency)}>
                      {request.urgency.toUpperCase()}
                    </NBadge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {request.units_needed} unit{request.units_needed > 1 ? 's' : ''} needed
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    {request.patient_name && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Patient:</strong> {request.patient_name}
                          {request.patient_age && ` (${request.patient_age} years)`}
                        </span>
                      </div>
                    )}
                    {request.hospital && (
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Hospital:</strong> {request.hospital}
                        </span>
                      </div>
                    )}
                    {request.contact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Contact:</strong> {request.contact}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    {request.distance && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <strong>Distance:</strong> {request.distance.toFixed(1)} km
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Requested:</strong> {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <NButton 
                    onClick={() => {
                      setSelectedRequest(request)
                      loadMatches(request.id)
                      setIsRespondModalOpen(true)
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Respond to Request
                  </NButton>
                  <NButton 
                    onClick={() => {
                      setSelectedRequest(request)
                      loadMatches(request.id)
                    }}
                    variant="outline"
                  >
                    <Navigation className="w-4 h-4" />
                    View Details
                  </NButton>
                </div>
              </NCard>
            ))
          ) : (
            <NAlert type="info">
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Emergency Requests</h3>
                <p className="text-gray-600">There are currently no emergency blood requests in your area.</p>
              </div>
            </NAlert>
          )}
        </div>
      </div>

      {/* Response Modal */}
      <NModal isOpen={isRespondModalOpen} onClose={() => setIsRespondModalOpen(false)}>
        <h2 className="text-xl font-semibold text-[#e74c3c] mb-4">Respond to Emergency Request</h2>
        
        {selectedRequest && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold mb-2">
              {selectedRequest.blood_type}{selectedRequest.rh} - {selectedRequest.urgency.toUpperCase()}
            </div>
            {selectedRequest.patient_name && (
              <div className="text-sm text-gray-600">
                Patient: {selectedRequest.patient_name}
              </div>
            )}
            {selectedRequest.hospital && (
              <div className="text-sm text-gray-600">
                Hospital: {selectedRequest.hospital}
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <div className="flex gap-3">
            <NButton
              onClick={() => setResponseStatus('accepted')}
              className={`flex-1 ${responseStatus === 'accepted' ? 'bg-green-500 text-white' : ''}`}
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </NButton>
            <NButton
              onClick={() => setResponseStatus('declined')}
              className={`flex-1 ${responseStatus === 'declined' ? 'bg-red-500 text-white' : ''}`}
            >
              <XCircle className="w-4 h-4" />
              Decline
            </NButton>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <NButton 
            onClick={() => setIsRespondModalOpen(false)}
            className="bg-gray-200 text-gray-700"
          >
            Cancel
          </NButton>
          <NButton 
            onClick={handleRespondToRequest}
            disabled={loading}
          >
            {loading ? "Responding..." : "Submit Response"}
          </NButton>
        </div>
      </NModal>
    </div>
  )
}
