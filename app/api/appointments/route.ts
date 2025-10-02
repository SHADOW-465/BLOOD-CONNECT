import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("donor_id", user.id)
      .order("scheduled_at")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching appointments", details: error.message }),
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json()
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        donor_id: user.id,
        scheduled_at: body.scheduled_at,
        location: body.location,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error creating appointment", details: error.message }),
      { status: 500 },
    )
  }
}