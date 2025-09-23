import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Database } from "@/lib/supabase/types"

export async function GET() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*)
    `
    )
    .eq("id", user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // The result from the query will have user_profiles nested.
  // We can flatten it for easier use on the client.
  const { user_profiles, ...userData } = data
  const profile = { ...userData, ...user_profiles }

  return NextResponse.json(profile)
}

export async function PUT(req: Request) {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json()

  // Separate the fields for the users and user_profiles tables
  const {
    name,
    phone_number,
    availability_status,
    date_of_birth,
    blood_type,
    rh_factor,
    weight_kg,
    location,
    last_donation_date,
    medical_conditions,
    emergency_contact,
    profile_picture_url,
  } = body

  const userUpdate: Partial<Database["public"]["Tables"]["users"]["Update"]> = {}
  if (name) userUpdate.name = name
  if (phone_number) userUpdate.phone_number = phone_number
  if (availability_status) userUpdate.availability_status = availability_status

  const userProfileUpdate: Partial<Database["public"]["Tables"]["user_profiles"]["Update"]> = { user_id: user.id }
  if (date_of_birth) userProfileUpdate.date_of_birth = date_of_birth
  if (blood_type) userProfileUpdate.blood_type = blood_type
  if (rh_factor) userProfileUpdate.rh_factor = rh_factor
  if (weight_kg) userProfileUpdate.weight_kg = weight_kg
  if (location) userProfileUpdate.location = location
  if (last_donation_date) userProfileUpdate.last_donation_date = last_donation_date
  if (medical_conditions) userProfileUpdate.medical_conditions = medical_conditions
  if (emergency_contact) userProfileUpdate.emergency_contact = emergency_contact
  if (profile_picture_url) userProfileUpdate.profile_picture_url = profile_picture_url

  // Update the users table if there are any fields to update
  if (Object.keys(userUpdate).length > 0) {
    const { error: userError } = await supabase.from("users").update(userUpdate).eq("id", user.id)
    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  // Upsert the user_profiles table
  const { error: profileError } = await supabase.from("user_profiles").upsert(userProfileUpdate)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  // Fetch the updated profile to return
  const { data: updatedProfile, error: fetchError } = await supabase
    .from("users")
    .select(
      `
      *,
      user_profiles(*)
    `
    )
    .eq("id", user.id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 })

  const { user_profiles: updatedUserProfiles, ...updatedUserData } = updatedProfile
  const profile = { ...updatedUserData, ...updatedUserProfiles }

  return NextResponse.json(profile)
}
