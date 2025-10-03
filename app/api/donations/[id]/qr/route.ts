import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import QRCode from 'qrcode'

export const dynamic = "force-dynamic"

function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { id } = params

  try {
    let { data: donation, error } = await supabase
      .from("donations")
      .select("*, donor_id, request_id, confirmation_token, token_expires_at")
      .eq("id", id)
      .single()

    if (error || !donation) {
      return new NextResponse(JSON.stringify({ error: "Donation not found" }), { status: 404 })
    }

    if (donation.confirmed_at) {
      return new NextResponse(JSON.stringify({ error: "Donation already confirmed" }), { status: 400 })
    }

    if (!donation.confirmation_token || !donation.token_expires_at) {
      const confirmationToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const { data: updatedDonation, error: updateError } = await supabase
        .from("donations")
        .update({
          confirmation_token: confirmationToken,
          token_expires_at: expiresAt.toISOString()
        })
        .eq("id", id)
        .select("*, donor_id, request_id, confirmation_token, token_expires_at")
        .single()

      if (updateError) throw updateError

      donation = updatedDonation
    }

    const qrData = {
      type: "blood_donation_confirmation",
      donation_id: donation.id,
      token: donation.confirmation_token,
      donor_id: donation.donor_id,
      expires_at: donation.token_expires_at
    }

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: { dark: '#e74c3c', light: '#ffffff' }
    })

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
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate QR code", details: error.message }),
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { donor_id, request_id, volume_ml = 450 } = await req.json()

    const confirmationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        id: params.id,
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

    if (error) throw error

    return NextResponse.json({ message: "Donation record created", donation })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to create donation record", details: error.message }),
      { status: 500 }
    )
  }
}