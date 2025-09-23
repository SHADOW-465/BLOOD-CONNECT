import { cookies, headers } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | null = null

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) return serverClient
  const cookieStore = cookies()
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    console.warn("[v0] Missing SUPABASE_URL or SUPABASE_ANON_KEY")
  }

  serverClient = createServerClient(url!, anon!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {}
      },
    },
    headers: {
      // Forward auth headers for SSR correctness
      "x-forwarded-for": headers().get("x-forwarded-for") || "",
      "user-agent": headers().get("user-agent") || "",
    },
  })
  return serverClient
}
