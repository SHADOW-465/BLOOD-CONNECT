import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { latitude, longitude } = await req.json()

    if (latitude === undefined || longitude === undefined) {
      return new NextResponse(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        location_lat: latitude,
        location_lng: longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error updating location", details: error.message }),
      { status: 500 },
    )
  }
}