"use client"
import { useState } from "react"
import { Menu, Bell, Droplet } from "lucide-react"
import Sidebar from "./Sidebar"
import Link from "next/link"

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={onMenuClick} className="md:hidden mr-4 text-gray-500 hover:text-gray-700">
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold text-gray-800">UYIR THULI</span>
            </Link>
          </div>
          <div className="flex items-center">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
