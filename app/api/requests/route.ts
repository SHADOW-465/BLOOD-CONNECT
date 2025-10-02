import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Fetch all active emergency requests
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select(`
        id,
        blood_type,
        rh,
        urgency,
        location_lat,
        location_lng,
        status,
        created_at,
        patient_name,
        patient_age,
        hospital,
        contact
      `)
      .eq("status", "pending") // Only fetch active requests
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error fetching requests.", details: error.message }),
      { status: 500 },
    )
  }
}

// Create a new emergency request
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("emergency_requests")
      .insert({
        requester_id: user.id,
        blood_type: body.blood_type,
        rh: body.rh,
        urgency: body.urgency,
        units_needed: body.units_needed,
        location_lat: body.location_lat,
        location_lng: body.location_lng,
        patient_name: body.patient_name,
        patient_age: body.patient_age,
        hospital: body.hospital,
        contact: body.contact,
        status: 'pending',
      })
      .select()

    if (error) throw error

    return NextResponse.json({ message: "Request created successfully", data: data[0] })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error creating the request.", details: error.message }),
      { status: 500 },
    )
  }
}