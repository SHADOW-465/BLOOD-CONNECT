import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// This endpoint would typically be protected and only accessible by hospital staff.
// For now, it assumes the presence of a valid token in the request body.
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    // In a real app, you'd have a separate authentication flow for hospital staff.
    // We'll proceed assuming the request is authorized if it contains the correct token.
    const { donation_id, token } = await request.json()

    if (!donation_id || !token) {
        return new NextResponse(JSON.stringify({ error: "Missing donation_id or token" }), { status: 400 })
    }

    // 1. Fetch the donation to verify the token and get the donor ID
    const { data: donation, error: donationError } = await supabase
        .from("donations")
        .select("id, donor_id, verification_token, status") // Assuming a 'verification_token' column exists
        .eq("id", donation_id)
        .single()

    if (donationError || !donation) {
        return new NextResponse(JSON.stringify({ error: "Donation not found" }), { status: 404 })
    }

    // This is a simplified token check. In a real app, use a more secure method.
    if (donation.verification_token !== token) {
        return new NextResponse(JSON.stringify({ error: "Invalid verification token" }), { status: 403 })
    }

    if (donation.status === 'completed') {
        return new NextResponse(JSON.stringify({ error: "This donation has already been confirmed." }), { status: 409 })
    }

    // 2. Update the donation status to 'completed'
    const { error: updateDonationError } = await supabase
        .from("donations")
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq("id", donation_id)

    if (updateDonationError) throw updateDonationError

    // 3. Update the donor's last_donation_date in their profile
    const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ last_donation_date: new Date().toISOString() })
        .eq("id", donation.donor_id)

    if (updateProfileError) throw updateProfileError

    // The number of lives saved is a fixed value (3) per donation
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