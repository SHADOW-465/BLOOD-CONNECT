import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const matchId = params.id
  const { status } = await req.json()

  if (status !== "accepted") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // First, verify that the user is the donor for this match
  const { data: match, error: fetchError } = await supabase
    .from("request_matches")
    .select("donor_id")
    .eq("id", matchId)
    .single()

  if (fetchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  if (match.donor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Now, update the status
  const { data: updatedMatch, error: updateError } = await supabase
    .from("request_matches")
    .update({ status })
    .eq("id", matchId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updatedMatch)
}
