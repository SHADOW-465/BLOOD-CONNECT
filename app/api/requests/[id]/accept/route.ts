import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const requestId = params.id

    // Check if the user has already accepted this request
    const { data: existingMatch, error: matchError } = await supabase
        .from("request_matches")
        .select("id")
        .eq("request_id", requestId)
        .eq("donor_id", user.id)
        .single()

    if(matchError && matchError.code !== 'PGRST116') throw matchError;
    if(existingMatch) {
        return new NextResponse(JSON.stringify({ error: "You have already accepted this request." }), { status: 409 })
    }

    // Create a new match record
    const { data, error } = await supabase
      .from("request_matches")
      .insert({
        request_id: requestId,
        donor_id: user.id,
        status: "accepted",
      })
      .select()

    if (error) throw error

    // Optionally, you could also update the status of the main request here
    // if the logic requires it (e.g., if only one donor can accept)

    return NextResponse.json({ message: "Request accepted successfully", data: data[0] })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error accepting the request.", details: error.message }),
      { status: 500 },
    )
  }
}