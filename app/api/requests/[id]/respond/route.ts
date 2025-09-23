import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Database } from "@/lib/supabase/types"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json()
  const status = body.status as Database["public"]["Enums"]["response_status"]

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("request_responses")
    .update({ response_status: status })
    .eq("request_id", params.id)
    .eq("donor_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
