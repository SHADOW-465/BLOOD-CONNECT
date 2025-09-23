"use client"
import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white flex items-center justify-between p-4 border-b border-slate-200 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">BloodLink</h1>
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
