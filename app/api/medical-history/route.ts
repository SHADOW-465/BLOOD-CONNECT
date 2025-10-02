import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("donor_id", user.id)
      .order("date_recorded", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching medical history", details: error.message }),
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json()
    const { record_type, title, description, date_recorded, doctor_name, clinic_name, file_url } = body

    const { data, error } = await supabase
      .from("medical_history")
      .insert({
        donor_id: user.id,
        record_type,
        title,
        description,
        date_recorded,
        doctor_name,
        clinic_name,
        file_url,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error creating medical record", details: error.message }),
      { status: 500 },
    )
  }
}