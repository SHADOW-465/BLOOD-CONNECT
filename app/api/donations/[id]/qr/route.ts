import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import QRCode from 'qrcode'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { id } = params

  // Get or update donation details with confirmation token
  let { data: donation, error } = await supabase
    .from("donations")
    .select("*, donor_id, request_id, confirmation_token, token_expires_at")
    .eq("id", id)
    .single()

  if (error || !donation) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 })
  }

  if (donation.confirmed_at) {
    return NextResponse.json({ error: "Donation already confirmed" }, { status: 400 })
  }

  // If no confirmation token exists, generate one
  if (!donation.confirmation_token || !donation.token_expires_at) {
    const confirmationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    
    const { data: updatedDonation, error: updateError } = await supabase
      .from("donations")
      .update({ 
        confirmation_token: confirmationToken,
        token_expires_at: expiresAt.toISOString()
      })
      .eq("id", id)
      .select("*, donor_id, request_id, confirmation_token, token_expires_at")
      .single()

    if (updateError) {
      console.error('Error updating donation token:', updateError)
      return NextResponse.json({ error: 'Failed to generate confirmation token' }, { status: 500 })
    }
    
    donation = updatedDonation
  }

  // Generate QR code data
  const qrData = {
    type: "blood_donation_confirmation",
    donation_id: donation.id,
    token: donation.confirmation_token,
    donor_id: donation.donor_id,
    expires_at: donation.token_expires_at
  }

  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#e74c3c',  // Brand red
        light: '#ffffff'
      }
    })

    // Update donation with QR code URL
    await supabase
      .from("donations")
      .update({ qr_code_url: qrCodeDataURL })
      .eq("id", id)

    return NextResponse.json({
      qr_code: qrCodeDataURL,
      donation_id: id,
      expires_at: donation.token_expires_at,
      patient_info: donation.request_id ? "Emergency request donation" : "Scheduled donation"
    })
  } catch (qrError) {
    console.error('QR code generation error:', qrError)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { 
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { donor_id, request_id, volume_ml = 450 } = await req.json()

  // Generate confirmation token and expiry
  const confirmationToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

  // Create a new donation record for QR generation
  const { data: donation, error } = await supabase
    .from("donations")
    .insert({
      id: params.id, // Use the provided ID
      donor_id,
      request_id,
      volume_ml,
      status: 'recorded',
      donated_at: new Date().toISOString(),
      confirmation_token: confirmationToken,
      token_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create donation record" }, { status: 500 })
  }

  return NextResponse.json({ message: "Donation record created", donation })
}