import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { id } = params

  try {
    const { data: request, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    if (!request) {
      return new NextResponse(JSON.stringify({ error: "Request not found" }), { status: 404 })
    }

    return NextResponse.json(request)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching request details", details: error.message }),
      { status: 500 },
    )
  }
}