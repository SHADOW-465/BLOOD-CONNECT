import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { availability_status, availability_reason } = await req.json()

  if (!["available", "unavailable"].includes(availability_status)) {
    return NextResponse.json({ error: "Invalid availability status" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      availability_status,
      availability_reason: availability_status === "available" ? null : availability_reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
