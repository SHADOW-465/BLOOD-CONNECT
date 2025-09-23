import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient()
  const { id: requestId } = params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Update the request_matches status
    const { error: matchError } = await supabase
      .from("request_matches")
      .update({ status: "accepted" })
      .eq("request_id", requestId)
      .eq("donor_id", user.id)

    if (matchError) throw new Error(`Failed to update request match: ${matchError.message}`)

    // 2. Update the emergency_requests status
    const { data: requestData, error: requestError } = await supabase
      .from("emergency_requests")
      .update({ status: "matched" })
      .eq("id", requestId)
      .select()
      .single()

    if (requestError) throw new Error(`Failed to update emergency request: ${requestError.message}`)

    // 3. Fetch donor's profile
    const { data: donorProfile, error: donorError } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", user.id)
      .single()

    if (donorError || !donorProfile) throw new Error("Failed to fetch donor profile.")

    // 4. Create a notification for the requester
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: requestData.requester_id,
      title: "Your blood request has been accepted!",
      message: `${donorProfile.name} has accepted your request. You can contact them at: ${donorProfile.phone}.`,
    })

    if (notificationError) throw new Error(`Failed to create notification: ${notificationError.message}`)

    return NextResponse.json({ message: "Request accepted successfully." }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
