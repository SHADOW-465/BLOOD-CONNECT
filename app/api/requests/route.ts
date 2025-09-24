import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isCompatible, kmDistance, findBestMatches, type DonorProfile } from "@/lib/compatibility"

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
  const { 
    blood_type, 
    rh, 
    urgency, 
    location_lat, 
    location_lng, 
    units_needed = 1, 
    radius_km = 10,
    patient_name,
    patient_age,
    hospital,
    contact
  } = body

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
      patient_name,
      patient_age: patient_age ? parseInt(patient_age) : null,
      hospital,
      contact,
      status: "open",
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Enhanced smart matching algorithm
  if (inserted.location_lat && inserted.location_lng) {
    // Get donor profiles with donation history
    const { data: candidates } = await supabase
      .from("profiles")
      .select(`
        id,
        blood_type,
        rh,
        availability_status,
        location_lat,
        location_lng,
        last_donation_date
      `)
      .eq("availability_status", "available")
      .not("blood_type", "is", null)
      .not("rh", "is", null)

    if (candidates) {
      // Get donation counts for each donor
      const donorIds = candidates.map(c => c.id)
      const { data: donationCounts } = await supabase
        .from("donations")
        .select("donor_id")
        .in("donor_id", donorIds)

      // Calculate donation counts per donor
      const donationCountMap = new Map<string, number>()
      donationCounts?.forEach(donation => {
        const count = donationCountMap.get(donation.donor_id) || 0
        donationCountMap.set(donation.donor_id, count + 1)
      })

      // Get response rates from request_matches
      const { data: responseHistory } = await supabase
        .from("request_matches")
        .select("donor_id, status")
        .in("donor_id", donorIds)

      // Calculate response rates
      const responseRateMap = new Map<string, number>()
      const responseCountMap = new Map<string, { total: number; accepted: number }>()
      
      responseHistory?.forEach(match => {
        const current = responseCountMap.get(match.donor_id) || { total: 0, accepted: 0 }
        current.total++
        if (match.status === 'accepted') current.accepted++
        responseCountMap.set(match.donor_id, current)
      })

      responseCountMap.forEach((counts, donorId) => {
        responseRateMap.set(donorId, counts.accepted / counts.total)
      })

      // Enhance donor profiles with calculated data
      const enhancedCandidates: DonorProfile[] = candidates.map(candidate => ({
        id: candidate.id,
        blood_type: candidate.blood_type as any,
        rh: candidate.rh as any,
        availability_status: candidate.availability_status as any,
        location_lat: candidate.location_lat,
        location_lng: candidate.location_lng,
        last_donation_date: candidate.last_donation_date,
        donation_count: donationCountMap.get(candidate.id) || 0,
        response_rate: responseRateMap.get(candidate.id) || 0.5
      }))

      // Use smart matching algorithm
      const matches = findBestMatches(
        {
          blood_type: inserted.blood_type as any,
          rh: inserted.rh as any,
          urgency: inserted.urgency as any,
          location_lat: inserted.location_lat,
          location_lng: inserted.location_lng,
          radius_km: inserted.radius_km
        },
        enhancedCandidates,
        10 // Max 10 matches
      )

      if (matches.length) {
        await supabase.from("request_matches").insert(
          matches.map((match) => ({
            request_id: inserted.id,
            donor_id: match.donor_id,
            distance_km: match.distance_km,
            score: match.score,
            status: "notified",
          })),
        )
      }
    }
  }

  return NextResponse.json(inserted, { status: 201 })
}
