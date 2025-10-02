import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase
      .from("donation_calendar")
      .select("*")
      .eq("donor_id", user.id)
      .order("scheduled_date", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching donation calendar", details: error.message }),
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
    const { scheduled_date, location, notes } = body

    const { data, error } = await supabase
      .from("donation_calendar")
      .insert({
        donor_id: user.id,
        scheduled_date,
        location,
        notes,
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error creating calendar entry", details: error.message }),
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json()
    const { appointment_id, status, notes } = body

    const { data, error } = await supabase
      .from("donation_calendar")
      .update({
        status,
        notes: notes || null,
      })
      .eq("id", appointment_id)
      .eq("donor_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error updating calendar entry", details: error.message }),
      { status: 500 },
    )
  }
}