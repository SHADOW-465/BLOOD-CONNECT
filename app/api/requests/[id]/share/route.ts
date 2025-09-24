import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { id } = params
  
  // Get request details
  const { data: request, error } = await supabase
    .from("emergency_requests")
    .select("*")
    .eq("id", id)
    .eq("status", "open")
    .single()
    
  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }
  
  // Get app URL from environment or use default
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 process.env.NEXT_PUBLIC_VERCEL_URL ? 
                   `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` :
                   'https://bloodconnect-app.replit.app'
  
  // Create urgency emoji
  const urgencyEmoji = {
    critical: '🚨',
    high: '⚡',
    medium: '⏰',
    low: '📢'
  }[request.urgency] || '🩸'
  
  // Create shareable message
  const shareData = {
    title: `${urgencyEmoji} Urgent: ${request.blood_type}${request.rh} Blood Needed`,
    message: `🩸 EMERGENCY BLOOD REQUEST 🩸\n\n` +
             `Blood Type: ${request.blood_type}${request.rh}\n` +
             `Urgency: ${request.urgency.toUpperCase()}\n` +
             `Units Needed: ${request.units_needed}\n` +
             `Hospital: ${request.hospital || 'Emergency location'}\n` +
             `Patient: ${request.patient_name || 'Emergency patient'}\n\n` +
             `Every second counts! Help save a life by donating blood.\n\n` +
             `🔗 Click to help: ${appUrl}/emergency-requests/${id}\n\n` +
             `Download BloodConnect: ${appUrl}\n` +
             `#BloodDonation #SaveLives #EmergencyBlood`,
    url: `${appUrl}/emergency-requests/${id}`,
    requestId: id,
    shortUrl: `${appUrl}/r/${id}` // Short URL for sharing
  }
  
  return NextResponse.json(shareData)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { platform } = await req.json()

  // Track the share action
  const { error } = await supabase
    .from("request_shares")
    .insert({
      request_id: params.id,
      shared_by: user.id,
      platform: platform || 'unknown'
    })

  if (error) {
    console.error('Failed to track share:', error)
    // Don't fail the request if tracking fails
  }

  return NextResponse.json({ message: "Share tracked successfully" })
}