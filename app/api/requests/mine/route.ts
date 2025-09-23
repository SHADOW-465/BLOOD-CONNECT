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
    .from("blood_requests")
    .select(
      `
      *,
      request_responses:request_responses(
        id,
        donor_id,
        users:donor_id(
          name,
          user_profiles(
            blood_type,
            rh_factor,
            profile_picture_url
          )
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
