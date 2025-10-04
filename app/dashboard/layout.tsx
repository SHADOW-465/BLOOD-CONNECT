"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, User } from "lucide-react"
import { useSupabase } from "@/lib/supabase/provider"

const Header = () => {
  const { session } = useSupabase()
  const user = session?.user
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    if (user?.email) {
      setUserName(user.email.split('@')[0])
    }
  }, [user])

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div>
            <p className="text-medium-grey text-sm">Welcome back,</p>
            <h1 className="text-dark-grey text-xl font-bold capitalize">{userName}</h1>
          </div>
          <Link href="/notifications">
            <Bell className="w-6 h-6 text-dark-grey" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </>
  )
}