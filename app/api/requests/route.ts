import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isCompatible, kmDistance } from "@/lib/compatibility"

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
    name,
    age,
    patient_status,
    hospital,
    contact_number,
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
      status: "open",
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      name,
      age,
      patient_status,
      hospital,
      contact_number,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // naive matching: pull available profiles and compute distance client-side later
  const { data: candidates } = await supabase
    .from("profiles")
    .select("id,blood_type,rh,availability_status,location_lat,location_lng")
    .eq("availability_status", "available")

  if (candidates && inserted.location_lat && inserted.location_lng) {
    const matches = candidates
      .filter(
        (d) => d.blood_type && d.rh && isCompatible(inserted.blood_type, inserted.rh, d.blood_type as any, d.rh as any),
      )
      .map((d) => {
        const dist =
          d.location_lat && d.location_lng
            ? kmDistance(inserted.location_lat, inserted.location_lng, d.location_lat, d.location_lng)
            : 1e9
        return { donor_id: d.id, distance_km: dist }
      })
      .filter((m) => m.distance_km <= radius_km)

    if (matches.length) {
      await supabase.from("request_matches").insert(
        matches.map((m) => ({
          request_id: inserted.id,
          donor_id: m.donor_id,
          distance_km: m.distance_km,
          status: "notified",
        })),
      )
    }
  }

  return NextResponse.json(inserted, { status: 201 })
}
