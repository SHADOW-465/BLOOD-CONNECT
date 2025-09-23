import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { isCompatible, kmDistance } from "@/lib/compatibility"
import { Database } from "@/lib/supabase/types"

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient()
  const url = new URL(req.url)
  const radius = Number(url.searchParams.get("radius_km") || 50)

  const { data: requests, error } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("status", "active")
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

  const body: Partial<Database["public"]["Tables"]["blood_requests"]["Insert"]> = await req.json()

  const {
    blood_type,
    rh_factor,
    urgency,
    latitude,
    longitude,
    units_needed = 1,
    patient_name,
    hospital_name,
    contact_phone,
    notes,
    required_by,
  } = body

  if (!blood_type || !rh_factor || !urgency || !latitude || !longitude || !patient_name || !hospital_name || !contact_phone || !required_by) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data: inserted, error } = await supabase
    .from("blood_requests")
    .insert({
      requester_id: user.id,
      blood_type,
      rh_factor,
      urgency,
      latitude,
      longitude,
      units_needed,
      patient_name,
      hospital_name,
      contact_phone,
      notes,
      required_by,
      status: "active",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Find matching donors
  const { data: candidates } = await supabase.from("users").select(`
      id,
      availability_status,
      user_profiles (
        blood_type,
        rh_factor,
        latitude,
        longitude
      )
    `).eq("availability_status", "available")

  if (candidates && inserted.latitude && inserted.longitude) {
    const matches = candidates
      .filter((c) => {
        const profile = Array.isArray(c.user_profiles) ? c.user_profiles[0] : c.user_profiles
        return profile && profile.blood_type && profile.rh_factor && isCompatible(inserted.blood_type, inserted.rh_factor, profile.blood_type as any, profile.rh_factor as any)
      })
      .map((c) => {
        const profile = Array.isArray(c.user_profiles) ? c.user_profiles[0] : c.user_profiles
        const dist =
          profile && profile.latitude && profile.longitude
            ? kmDistance(inserted.latitude, inserted.longitude, profile.latitude, profile.longitude)
            : 1e9
        return { donor_id: c.id, distance_km: dist }
      })
      .filter((m) => m.distance_km <= (body.radius_km || 10)) // Use radius from request body or default to 10km

    if (matches.length) {
      await supabase.from("request_responses").insert(
        matches.map((m) => ({
          request_id: inserted.id,
          donor_id: m.donor_id,
          response_status: "pending",
        })),
      )
    }
  }

  return NextResponse.json(inserted, { status: 201 })
}
