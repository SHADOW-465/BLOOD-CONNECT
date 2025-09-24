import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { donation_id, token } = await req.json()

    if (!donation_id || !token) {
      return NextResponse.json({ error: "Missing donation_id or token" }, { status: 400 })
    }

    // Verify donation exists and token matches
    const { data: donation, error } = await supabase
      .from("donations")
      .select("*, token_expires_at")
      .eq("id", donation_id)
      .eq("confirmation_token", token)
      .eq("donor_id", user.id) // Ensure user is the actual donor
      .single()

    if (error || !donation) {
      return NextResponse.json({ error: "Invalid donation or token" }, { status: 400 })
    }

    // Check if already confirmed
    if (donation.confirmed_at) {
      return NextResponse.json({ error: "Donation already confirmed" }, { status: 400 })
    }

    // Check if token expired
    if (donation.token_expires_at && new Date() > new Date(donation.token_expires_at)) {
      return NextResponse.json({ error: "QR code has expired" }, { status: 400 })
    }

    // Update donation as confirmed
    const { data: confirmed, error: updateError } = await supabase
      .from("donations")
      .update({
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
        status: 'verified'
      })
      .eq("id", donation_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to confirm donation" }, { status: 500 })
    }

    // Update profile last donation date
    await supabase
      .from("profiles")
      .update({ last_donation_date: donation.donated_at })
      .eq("id", user.id)

    // Create notification for successful confirmation
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "donation_confirmed",
        title: "Donation Confirmed! 🎉",
        message: "Your blood donation has been verified. Thank you for saving lives!",
        data: { donation_id: donation_id }
      })

    // Calculate estimated lives saved based on volume
    const livesSaved = donation.volume_ml ? Math.floor(donation.volume_ml / 150) : 3

    return NextResponse.json({
      message: "Donation confirmed successfully!",
      donation: confirmed,
      lives_saved: livesSaved
    })
  } catch (error) {
    console.error('Donation confirmation error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}