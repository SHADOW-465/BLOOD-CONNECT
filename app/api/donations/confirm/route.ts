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

// This endpoint would typically be protected and only accessible by hospital staff.
export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  try {
    const { donation_id, token } = await request.json()

    if (!donation_id || !token) {
        return new NextResponse(JSON.stringify({ error: "Missing donation_id or token" }), { status: 400 })
    }

    const { data: donation, error: donationError } = await supabase
        .from("donations")
        .select("id, donor_id, confirmation_token, status")
        .eq("id", donation_id)
        .single()

    if (donationError || !donation) {
        return new NextResponse(JSON.stringify({ error: "Donation not found" }), { status: 404 })
    }

    if (donation.confirmation_token !== token) {
        return new NextResponse(JSON.stringify({ error: "Invalid confirmation token" }), { status: 403 })
    }

    if (donation.status === 'verified') {
        return new NextResponse(JSON.stringify({ error: "This donation has already been verified." }), { status: 409 })
    }

    const { error: updateDonationError } = await supabase
        .from("donations")
        .update({ status: 'verified', confirmed_at: new Date().toISOString() })
        .eq("id", donation_id)

    if (updateDonationError) throw updateDonationError

    const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ last_donation_date: new Date().toISOString() })
        .eq("id", donation.donor_id)

    if (updateProfileError) throw updateProfileError

    const lives_saved = 3;

    return NextResponse.json({
        message: "Donation confirmed successfully!",
        lives_saved
    })

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error confirming the donation.", details: error.message }),
      { status: 500 },
    )
  }
}