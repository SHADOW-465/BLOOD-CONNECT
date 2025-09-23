import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}


export async function PATCH(req: Request) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profileData = await req.json()

  // We only allow updating a subset of fields for security.
  const { name, phone, blood_type, rh, location_lat, location_lng, radius_km } = profileData

  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (blood_type !== undefined) updateData.blood_type = blood_type
  if (rh !== undefined) updateData.rh = rh
  if (location_lat !== undefined) updateData.location_lat = location_lat
  if (location_lng !== undefined) updateData.location_lng = location_lng
  if (radius_km !== undefined) updateData.radius_km = radius_km

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
