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

// Generate a shareable message for a request
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient()
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
  const supabase = createSupabaseServerClient()
  try {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()

    const { error } = await supabase.from('request_shares').insert({
      request_id: params.id,
      shared_by: user?.id, // Can be null for anonymous shares
      platform: body.platform
    })

    if (error) throw error

    return NextResponse.json({ message: "Share tracked successfully" })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error tracking the share action.", details: error.message }),
      { status: 500 },
    )
  }
}