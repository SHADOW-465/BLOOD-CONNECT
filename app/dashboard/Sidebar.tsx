"use client"

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, User, Settings, LogOut, Droplet, ChevronsLeft } from "lucide-react"

const Sidebar = () => {
  const pathname = usePathname()
  const [isMinimized, setIsMinimized] = useState(false)

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/blood-onboarding/profile", icon: User, label: "Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div
      className={`flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${
        isMinimized ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center">
          <Droplet className="h-8 w-8 text-red-500" />
          {!isMinimized && <h1 className="text-2xl font-bold text-sidebar-primary ml-2">BloodLink</h1>}
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)} className="text-sidebar-foreground">
          <ChevronsLeft className={`w-6 h-6 transition-transform duration-300 ${isMinimized ? "rotate-180" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center p-2 rounded-lg transition-colors ${
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            } ${isMinimized ? "justify-center" : ""}`}
          >
            <item.icon className={`w-5 h-5 ${!isMinimized ? "mr-3" : ""}`} />
            {!isMinimized && item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button
          className={`flex items-center p-2 rounded-lg w-full text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isMinimized ? "justify-center" : ""
          }`}
        >
          <LogOut className={`w-5 h-5 ${!isMinimized ? "mr-3" : ""}`} />
          {!isMinimized && "Logout"}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
