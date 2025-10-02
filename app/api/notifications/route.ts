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
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching notifications", details: error.message }),
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
    const { type, title, message, data: notificationData } = body

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type,
        title,
        message,
        data: notificationData,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error creating notification", details: error.message }),
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
    const { notification_id, read } = body

    const { data, error } = await supabase
      .from("notifications")
      .update({ read })
      .eq("id", notification_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error updating notification", details: error.message }),
      { status: 500 },
    )
  }
}