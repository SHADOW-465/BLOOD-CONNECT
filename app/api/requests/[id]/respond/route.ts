import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { status } = body // 'accepted', 'declined', 'en_route', 'arrived'

  if (!['accepted', 'declined', 'en_route', 'arrived'].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Update the match status
  const { data: match, error: matchError } = await supabase
    .from("request_matches")
    .update({ 
      status,
      response_time_seconds: status === 'accepted' || status === 'declined' 
        ? Math.floor((Date.now() - new Date().getTime()) / 1000) 
        : null
    })
    .eq("request_id", params.id)
    .eq("donor_id", user.id)
    .select()
    .single()

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 400 })
  }

  // If donor accepted, update request status to matched
  if (status === 'accepted') {
    await supabase
      .from("emergency_requests")
      .update({ status: 'matched' })
      .eq("id", params.id)
  }

  // If donor arrived, update request status to fulfilled
  if (status === 'arrived') {
    await supabase
      .from("emergency_requests")
      .update({ status: 'fulfilled' })
      .eq("id", params.id)
  }

  return NextResponse.json({ success: true, match })
}