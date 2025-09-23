import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { findMatchingDonors } from "@/lib/matching"

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient()
  const url = new URL(req.url)
  const radius = Number(url.searchParams.get("radius_km") || 50)

  const { data: requests, error } = await supabase
    .from("emergency_requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(requests)
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json()
  const { blood_type, rh, urgency, location_lat, location_lng, units_needed = 1, radius_km = 10 } = body

  const { data: inserted, error } = await supabase
    .from("emergency_requests")
    .insert({
      requester_id: user.id,
      blood_type,
      rh,
      urgency,
      location_lat,
      location_lng,
      units_needed,
      radius_km,
      status: "open",
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // New: Use the Smart Matching Service
  console.log("Calling Smart Matching Service for request:", inserted.id)
  const matchedDonors = await findMatchingDonors(inserted)

  if (matchedDonors && matchedDonors.length > 0) {
    console.log(`Found ${matchedDonors.length} matched donors. Creating match records.`)
    const matchRecords = matchedDonors.map((match) => ({
      request_id: inserted.id,
      donor_id: match.donor.id,
      distance_km: match.distance,
      score: match.score,
      status: "notified",
    }))

    const { error: matchError } = await supabase.from("request_matches").insert(matchRecords)

    if (matchError) {
      console.error("Error creating request_matches:", matchError)
      // Don't block the response for this, but log it.
    }
  } else {
    console.log("No donors found by the Smart Matching Service.")
  }

  return NextResponse.json(inserted, { status: 201 })
}
