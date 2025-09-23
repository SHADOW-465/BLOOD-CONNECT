import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { id } = params

  const { data: request, error } = await supabase
    .from("emergency_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(request)
}
