import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { differenceInDays } from "date-fns"

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase.from("appointments").select("*").eq("donor_id", user.id).order("scheduled_at")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { scheduled_at, location, hospital_id } = body

  if (!scheduled_at || !location || !hospital_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Validation 1: Check user eligibility
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("last_donation_date")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Could not find user profile." }, { status: 500 })
  }

  if (profile.last_donation_date) {
    const daysSinceLastDonation = differenceInDays(new Date(), new Date(profile.last_donation_date))
    if (daysSinceLastDonation < 56) {
      return NextResponse.json(
        { error: `You can only donate every 56 days. You last donated ${daysSinceLastDonation} days ago.` },
        { status: 400 },
      )
    }
  }

  // Validation 2: Check for double booking
  const { data: existingAppointment, error: existingAppointmentError } = await supabase
    .from("appointments")
    .select("id")
    .eq("hospital_id", hospital_id)
    .eq("scheduled_at", scheduled_at)
    .single()

  if (existingAppointment) {
    return NextResponse.json({ error: "This time slot is no longer available." }, { status: 409 })
  }

  // All checks passed, insert the new appointment
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      donor_id: user.id,
      scheduled_at: scheduled_at,
      location: location, // Keep location name for display purposes
      hospital_id: hospital_id, // Store hospital_id for joins
      status: "confirmed", // Auto-confirm for now
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
