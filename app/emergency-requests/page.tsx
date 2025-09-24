"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NBadge, NAlert, NList, NListItem } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Heart, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type EmergencyRequest = {
  id: string
  blood_type: string
  rh: string
  urgency: string
  units_needed: number
  status: string
  created_at: string
  patient_name?: string
  hospital?: string
}

export default function EmergencyRequestsPage() {
  const supabase = getSupabaseBrowserClient()
  const [requests, setRequests] = useState<EmergencyRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()

    const channel = supabase
      .channel("emergency_requests_list")
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
    setLoading(true)
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })

    if (data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#e74c3c] mb-2">All Emergency Requests</h1>
          <p className="text-gray-600">Browse all open requests and see where you can help.</p>
        </div>

        {loading && requests.length === 0 ? <p>Loading requests...</p> : (
            requests.length > 0 ? (
                <NList>
                    {requests.map((request) => (
                    <Link href={`/emergency-requests/${request.id}`} key={request.id}>
                        <NListItem className="hover:bg-red-50 transition-colors">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="flex-1 mb-2 sm:mb-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-2xl font-bold text-[#e74c3c]">
                                        {request.blood_type}{request.rh}
                                        </span>
                                        <NBadge variant={getUrgencyColor(request.urgency)}>
                                        {request.urgency}
                                        </NBadge>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        For: {request.patient_name || "Patient"} at {request.hospital || "Hospital"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                                        <Clock className="w-4 h-4" />
                                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {request.units_needed} unit(s) needed
                                    </div>
                                </div>
                            </div>
                        </NListItem>
                    </Link>
                    ))}
              </NList>
            ) : (
                <NAlert type="info">
                <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Open Requests</h3>
                    <p className="text-gray-600">There are currently no open emergency requests. Thank you for your willingness to help!</p>
                </div>
                </NAlert>
            )
        )}
      </div>
    </div>
  )
}
