import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requestId = params.id;

  // 1. Check if the user is the requester
  const { data: request, error: requestError } = await supabase
    .from("emergency_requests")
    .select("requester_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.requester_id === user.id) {
    return NextResponse.json({ error: "You cannot accept your own request" }, { status: 400 });
  }

  // 2. Check if the user has already responded to this request
  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("request_matches")
    .select("id")
    .eq("request_id", requestId)
    .eq("donor_id", user.id)
    .maybeSingle();

  if (existingMatchError) {
    return NextResponse.json({ error: "Database error checking for existing match" }, { status: 500 });
  }

  if (existingMatch) {
    return NextResponse.json({ error: "You have already responded to this request" }, { status: 409 }); // 409 Conflict
  }

  // 3. Create the new match
  const { data: newMatch, error: matchError } = await supabase
    .from("request_matches")
    .insert({
      request_id: requestId,
      donor_id: user.id,
      status: 'accepted',
    })
    .select()
    .single();

  if (matchError) {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }

  // 4. Fetch donor profile for notification
  const { data: donorProfile, error: profileError } = await supabase
    .from("profiles")
    .select("name, blood_type, rh")
    .eq("id", user.id)
    .single();

  if (profileError || !donorProfile) {
    // This should ideally not happen if the user has a profile, but good to handle
    return NextResponse.json({ error: "Could not find donor profile" }, { status: 404 });
  }

  // 5. Send notification
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: request.requester_id,
      type: "emergency_request",
      title: "Donor Accepted!",
      message: `${donorProfile.name} (${donorProfile.blood_type}${donorProfile.rh}) has accepted your request.`,
      data: {
        request_id: requestId,
        donor_id: user.id
      }
    });

  if (notificationError) {
    // Log the error but don't fail the whole request, as the main action (accepting) succeeded
    console.error("Failed to send notification:", notificationError);
  }

  // 6. Update request status
   await supabase
      .from("emergency_requests")
      .update({ status: 'matched' })
      .eq("id", requestId)

  return NextResponse.json({ success: true, match: newMatch });
}
