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
    // 1. Update the request_responses status
    const { error: responseError } = await supabase
      .from("request_responses")
      .update({ response_status: "accepted" })
      .eq("request_id", requestId)
      .eq("donor_id", user.id)

    if (responseError) throw new Error(`Failed to update request response: ${responseError.message}`)

    // 2. Update the blood_requests status to fulfilled
    const { data: requestData, error: requestError } = await supabase
      .from("blood_requests")
      .update({ status: "fulfilled" })
      .eq("id", requestId)
      .select()
      .single()

    if (requestError) throw new Error(`Failed to update blood request: ${requestError.message}`)

    // 3. Fetch donor's profile
    const { data: donorProfile, error: donorError } = await supabase
      .from("users")
      .select("name, user_profiles(phone_number)")
      .eq("id", user.id)
      .single()

    if (donorError || !donorProfile) throw new Error("Failed to fetch donor profile.")

    // 4. Create a notification for the requester
    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: requestData.requester_id,
      title: "Your blood request has been accepted!",
      message: `${donorProfile.name} has accepted your request. You can contact them at: ${donorProfile.user_profiles.phone_number}.`,
    })

    if (notificationError) throw new Error(`Failed to create notification: ${notificationError.message}`)

    return NextResponse.json({ message: "Request accepted successfully." }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
