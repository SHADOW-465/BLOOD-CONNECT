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

    const { data: requests, error } = await supabase
      .from("emergency_requests")
      .select(
        `
        *,
        request_matches (
          id,
          donor_id,
          profiles (
            name,
            avatar_url,
            blood_type,
            rh
          )
        )
      `,
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(requests)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching your requests", details: error.message }),
      { status: 500 },
    )
  }
}