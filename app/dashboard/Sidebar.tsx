"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, User, Settings, LogOut, X, ChevronsLeft, ChevronsRight } from "lucide-react"

interface SidebarProps {
  isMobileOpen: boolean
  setMobileOpen: (isOpen: boolean) => void
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

const NavLink = ({ item, isExpanded, onClick }: { item: typeof navItems[0], isExpanded: boolean, onClick?: () => void }) => {
  const pathname = usePathname()
  const isActive = pathname === item.href
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center h-12 px-4 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white ${isActive ? "bg-gray-700 text-white" : ""}`}
    >
      <item.icon className="w-6 h-6 shrink-0" />
      <span className={`ml-4 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
        {item.label}
      </span>
    </Link>
  )
}

const SidebarContent = ({ isExpanded, onLinkClick }: { isExpanded: boolean, onLinkClick?: () => void }) => {
  return (
    <div className="flex flex-col h-full p-2">
        <nav className="flex-1 space-y-2 mt-16">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} isExpanded={isExpanded} onClick={onLinkClick} />
            ))}
        </nav>
        <div className="p-2">
            <button
              className="flex items-center h-12 px-4 rounded-lg w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="w-6 h-6 shrink-0" />
              <span className={`ml-4 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100" : "opacity-0"}`}>Logout</span>
            </button>
        </div>
    </div>
  )
}

const Sidebar = ({ isMobileOpen, setMobileOpen }: SidebarProps) => {
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = isPinned || isHovered

  const pathname = usePathname()
  useEffect(() => {
    if (isMobileOpen) {
      setMobileOpen(false)
    }
  }, [pathname, isMobileOpen, setMobileOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}></div>}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 flex items-center justify-end">
            <button onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-6 h-6" />
            </button>
        </div>
        <SidebarContent isExpanded={true} onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full bg-gray-800 text-white transition-all duration-300 ease-in-out relative ${isExpanded ? "w-64" : "w-20"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => setIsPinned(!isPinned)}
          className="absolute top-4 -right-3 z-10 p-1 bg-gray-700 text-white rounded-full shadow-md hover:bg-red-500 transition-colors"
        >
          {isPinned ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
        </button>
        <SidebarContent isExpanded={isExpanded} />
      </aside>
    </>
  )
}

export default Sidebar