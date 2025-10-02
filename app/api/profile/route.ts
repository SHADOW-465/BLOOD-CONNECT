import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    // Fetch profile details - selecting only columns that exist in the schema
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, phone, last_donation_date, location_lat, location_lng")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError
    }

    // Fetch donation stats
    const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("id", { count: 'exact' })
        .eq("donor_id", user.id)

    if(donationsError) {
        throw donationsError
    }

    const responsePayload = {
        ...profile,
        email: user.email,
        stats: {
            donations: donations?.length || 0,
            livesSaved: (donations?.length || 0) * 3
        }
    }

    return NextResponse.json(responsePayload)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "There was an error fetching the profile.", details: error.message }),
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
        }

        const formData = await request.formData()
        const name = formData.get("name") as string
        const phone = formData.get("phone") as string
        // Note: Location and Avatar logic removed to align with the current DB schema.
        // This would be re-introduced after a schema migration.

        const updates: { name: string; phone: string; updated_at: string; } = {
            name,
            phone,
            updated_at: new Date().toISOString(),
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)

        if (profileError) {
            throw profileError
        }

        return NextResponse.json({ message: "Profile updated successfully" })

    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({ error: "There was an error updating the profile.", details: error.message }),
            { status: 500 },
        )
    }
}