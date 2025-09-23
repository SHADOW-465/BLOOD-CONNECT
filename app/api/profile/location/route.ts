import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(req: Request) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { latitude, longitude } = await req.json()

  if (latitude === undefined || longitude === undefined) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      latitude: latitude,
      longitude: longitude,
    })
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
