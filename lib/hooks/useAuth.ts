"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error.message)
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
      setIsLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase.auth])

  return { user, isLoading }
}