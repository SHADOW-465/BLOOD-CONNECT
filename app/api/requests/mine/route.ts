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

  const { data: requests, error } = await supabase
    .from("emergency_requests")
    .select(
      `
      *,
      donations:donations(
        id,
        donor_id,
        profiles:donor_id(
          name,
          blood_type,
          rh,
          avatar_url
        )
      )
    `
    )
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(requests)
}
