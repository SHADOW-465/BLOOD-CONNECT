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

    // Fetch profile details
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone, location, avatar_url, last_donation_date")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError
    }

    // Fetch donation stats
    const { data: donations, error: donationsError } = await supabase
        .from("donations")
        .select("id")
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
        const location = formData.get("location") as string
        const avatarFile = formData.get("avatar") as File | null

        let avatar_url: string | undefined = undefined;

        if (avatarFile && avatarFile.size > 0) {
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, avatarFile, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                throw new Error(`Avatar upload failed: ${uploadError.message}`)
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
            avatar_url = publicUrl
        }

        const updates: { name: string; phone: string; location: string; updated_at: string; avatar_url?: string } = {
            name,
            phone,
            location,
            updated_at: new Date().toISOString(),
        }

        if (avatar_url) {
            updates.avatar_url = avatar_url
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)

        if (profileError) {
            throw profileError
        }

        return NextResponse.json({ message: "Profile updated successfully", avatar_url })

    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({ error: "There was an error updating the profile.", details: error.message }),
            { status: 500 },
        )
    }
}