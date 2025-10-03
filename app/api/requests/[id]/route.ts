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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { id } = params

  try {
    const { data: request, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return new NextResponse(JSON.stringify({ error: "Request not found" }), { status: 404 })
      }
      throw error
    }

    return NextResponse.json(request)
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: "Error fetching request details", details: error.message }),
      { status: 500 },
    )
  }
}