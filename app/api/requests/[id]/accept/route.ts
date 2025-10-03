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

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const requestId = params.id

    const { error } = await supabase.rpc('accept_request', {
      request_id_input: requestId,
      donor_id_input: user.id
    })

    if (error) {
        if (error.code === 'P0001') {
             return new NextResponse(JSON.stringify({ error: error.message }), { status: 409 })
        }
        throw error
    }

    return NextResponse.json({ message: "Request accepted successfully" })
  } catch (error: any) {
    console.error("Error in accept_request RPC:", error)
    return new NextResponse(
      JSON.stringify({ error: "There was an error accepting the request.", details: error.message }),
      { status: 500 },
    )
  }
}