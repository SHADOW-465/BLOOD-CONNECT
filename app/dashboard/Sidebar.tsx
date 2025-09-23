"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, User, Settings, LogOut } from "lucide-react"

const Sidebar = () => {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border flex items-center">
        <img src="/placeholder-logo.svg" alt="Logo" className="h-8 w-8 mr-2" />
        <h1 className="text-2xl font-bold text-sidebar-primary">BloodLink</h1>
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
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center p-2 rounded-lg w-full text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
