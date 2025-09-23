"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BellRing, Home, User, Settings, LogOut, Heart } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-slate-100/60 border-r">
      <div className="flex items-center justify-center h-20 border-b gap-2">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-xl font-bold">BloodLink</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-red-500 hover:bg-red-100/50 ${
              pathname === link.href ? "bg-red-100/50 text-red-500" : ""
            }`}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-red-500 hover:bg-red-100/50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </div>
  )
}
