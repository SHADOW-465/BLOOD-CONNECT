import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Fetch all active emergency requests
export async function GET() {
  try {
    const requests = await DatabaseService.getEmergencyRequests({
      status: 'OPEN',
      limit: 50
    })

    return NextResponse.json(requests)
  } catch (error: any) {
    console.error('Error fetching requests:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: "There was an error fetching requests.", 
        details: error.message 
      }),
      { status: 500 }
    )
  }
}

// Create a new emergency request
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['bloodType', 'rh', 'urgency', 'locationLat', 'locationLng']
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

    // Create the request using Prisma
    const requestData = await DatabaseService.createEmergencyRequest({
      requesterId: user.id,
      bloodType: body.bloodType,
      rh: body.rh,
      urgency: body.urgency,
      unitsNeeded: parseInt(body.unitsNeeded) || 1,
      locationLat: parseFloat(body.locationLat),
      locationLng: parseFloat(body.locationLng),
      patientName: body.patientName || null,
      patientAge: body.patientAge ? parseInt(body.patientAge) : null,
      hospital: body.hospital || null,
      contact: body.contact || null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })

    // Find nearby donors and create matches
    if (body.locationLat && body.locationLng) {
      const nearbyDonors = await DatabaseService.findNearbyDonors(
        parseFloat(body.locationLat),
        parseFloat(body.locationLng),
        10 // 10km radius
      )

      // Filter donors by blood type compatibility
      const compatibleDonors = nearbyDonors.filter(donor => {
        if (!donor.bloodType || !donor.rh) return false
        
        // Basic blood type compatibility logic
        const requestBloodType = body.bloodType + body.rh
        const donorBloodType = donor.bloodType + donor.rh
        
        // Universal donor (O-) can donate to anyone
        if (donorBloodType === 'O-') return true
        
        // Same blood type
        if (requestBloodType === donorBloodType) return true
        
        // O+ can donate to A+, B+, AB+
        if (donorBloodType === 'O+' && ['A+', 'B+', 'AB+'].includes(requestBloodType)) return true
        
        // A- can donate to A+, A-, AB+, AB-
        if (donorBloodType === 'A-' && ['A+', 'A-', 'AB+', 'AB-'].includes(requestBloodType)) return true
        
        // B- can donate to B+, B-, AB+, AB-
        if (donorBloodType === 'B-' && ['B+', 'B-', 'AB+', 'AB-'].includes(requestBloodType)) return true
        
        return false
      })

      // Create matches for compatible donors
      for (const donor of compatibleDonors.slice(0, 10)) { // Limit to 10 matches
        if (donor.id !== user.id) { // Don't match with the requester
          await DatabaseService.createRequestMatch({
            requestId: requestData.id,
            donorId: donor.id,
            distanceKm: 0, // TODO: Calculate actual distance
            score: 0.8 // TODO: Calculate compatibility score
          })
        }
      }
    }

    return NextResponse.json({ 
      message: "Request created successfully", 
      data: requestData,
      id: requestData.id 
    })
  } catch (error: any) {
    console.error('Request creation error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: "There was an error creating the request.", 
        details: error.message,
        code: error.code 
      }),
      { status: 500 }
    )
  }
}
