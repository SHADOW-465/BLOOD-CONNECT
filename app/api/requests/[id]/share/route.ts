import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Generate a shareable message for a request
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const requestId = params.id
    const { data: requestDetails, error } = await supabase
      .from("emergency_requests")
      .select("blood_type, rh, patient_name, hospital")
      .eq("id", requestId)
      .single()

    if (error) throw error
    if (!requestDetails) {
        return new NextResponse(JSON.stringify({ error: "Request not found" }), { status: 404 })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/requests/${requestId}`
    const message = `Urgent blood needed! A patient named ${requestDetails.patient_name} requires ${requestDetails.blood_type}${requestDetails.rh} blood at ${requestDetails.hospital}. Your help can save a life. Please share or donate if you can.`

    const shareData = {
        title: `Blood Request: ${requestDetails.blood_type}${requestDetails.rh} Needed`,
        message,
        url: shareUrl,
    }

    return NextResponse.json(shareData)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error generating the share message.", details: error.message }),
      { status: 500 },
    )
  }
}

// Track a share action
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
        // Allow anonymous shares to be tracked, but associate with user if logged in
        console.log("Anonymous share action tracked for request:", params.id)
    }

    const body = await request.json()

    // Here you would insert into a 'shares' table or increment a counter
    // For now, we'll just log it to demonstrate the endpoint is working.
    console.log({
        message: "Share action tracked",
        requestId: params.id,
        userId: user?.id || 'anonymous',
        platform: body.platform, // e.g., 'native', 'clipboard'
        timestamp: new Date().toISOString()
    })

    // In a real implementation, you would have a table like 'request_shares'
    // and do an insert here.
    // await supabase.from('request_shares').insert({ request_id: params.id, shared_by_id: user?.id, platform: body.platform })

    return NextResponse.json({ message: "Share tracked successfully" })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error tracking the share action.", details: error.message }),
      { status: 500 },
    )
  }
}