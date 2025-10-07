import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )
}

// Fetch all active emergency requests
export async function GET() {
  const supabase = createSupabaseServerClient()
  try {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select(`
        id,
        requester_id,
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
      .eq("status", "open")
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
  const supabase = createSupabaseServerClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['blood_type', 'rh', 'urgency', 'location_lat', 'location_lng']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: `Required fields: ${missingFields.join(', ')}` 
        }), 
        { status: 400 }
      )
    }

    // Set expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Prepare the data for insertion
    const requestData = {
      requester_id: user.id,
      blood_type: body.blood_type,
      rh: body.rh,
      urgency: body.urgency,
      units_needed: parseInt(body.units_needed) || 1,
      location_lat: parseFloat(body.location_lat),
      location_lng: parseFloat(body.location_lng),
      patient_name: body.patient_name || null,
      patient_age: body.patient_age ? parseInt(body.patient_age) : null,
      hospital: body.hospital || null,
      contact: body.contact || null,
      status: 'open',
      expires_at: expiresAt,
    }

    console.log('Inserting request data:', requestData)

    const { data, error } = await supabase
      .from("emergency_requests")
      .insert(requestData)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ 
      message: "Request created successfully", 
      data,
      id: data.id 
    })
  } catch (error: any) {
    console.error('Request creation error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: "There was an error creating the request.", 
        details: error.message,
        code: error.code 
      }),
      { status: 500 },
    )
  }
}