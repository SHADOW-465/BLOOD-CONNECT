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

    // Call the database function to handle the acceptance atomically
    const { error } = await supabase.rpc('accept_request', {
      request_id_input: requestId,
      donor_id_input: user.id
    })

    if (error) {
        // Check for specific error codes if the function provides them
        // For example, if the function raises an exception for "already accepted"
        if (error.code === 'P0001') { // P0001 is the generic code for a raised exception
             return new NextResponse(JSON.stringify({ error: error.message }), { status: 409 })
        }
        throw error
    }

    return NextResponse.json({ message: "Request accepted successfully" })
  } catch (error: any) {
    console.error("Error in accept_request RPC:", error)
    return new NextResponse(
      JSON.stringify({ error: "There was an error accepting the request.", details: error.message }),
      { status: 500 },
    )
  }
}