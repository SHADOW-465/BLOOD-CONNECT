import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = createServerClient(url!, anon!, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) => res.cookies.set({ name, value, ...options }),
      remove: (name, options) => res.cookies.set({ name, value: "", ...options }),
    },
  })
  // Touch session to refresh cookies if needed
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ["/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)).*)"],
}
