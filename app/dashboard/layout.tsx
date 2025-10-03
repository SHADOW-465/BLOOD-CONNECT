"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, User } from "lucide-react"
import { DashboardProvider, useDashboard } from "./DashboardContext"
import BottomTabBar from "@/components/BottomTabBar"
import { useSupabase } from "@/lib/supabase/provider"
import { NModal, NButton, NField } from "@/components/nui"
import { toast } from "sonner"

type BloodType = "A" | "B" | "AB" | "O"
type Rh = "+" | "-"
type Urgency = "low" | "medium" | "high" | "critical"

const Header = () => {
  const { session } = useSupabase()
  const user = session?.user
  const [userName, setUserName] = useState("User")

  useEffect(() => {
    // A real app would fetch the user's profile to get their name
    if (user?.email) {
      setUserName(user.email.split('@')[0])
    }
  }, [user])

  return (
    <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-10">
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

const RequestModal = () => {
    const { isSosModalOpen, setIsSosModalOpen, loc, loadNearby } = useDashboard()
    const [submitting, setSubmitting] = useState(false)
    const [sosForm, setSosForm] = useState({
        bloodType: "A" as BloodType,
        rh: "+" as Rh,
        urgency: "high" as Urgency,
        patientName: "",
        patientAge: "",
        hospital: "",
        contact: "",
    })

    async function handleSendRequest() {
        if (!loc) {
            toast.error("Location not available. Please enable location services.")
            return
        }
        setSubmitting(true)
        try {
          const res = await fetch("/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...sosForm, location_lat: loc.lat, location_lng: loc.lng }),
          })
          if (!res.ok) throw new Error("Request failed")
          toast.success("Emergency request sent to nearby donors.")
          await loadNearby()
        } catch (e) {
          toast.error("Failed to send emergency request.")
        } finally {
          setSubmitting(false)
          setIsSosModalOpen(false)
        }
    }

    return (
        <NModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)}>
            <h2 className="text-xl font-semibold text-primary-red">New Emergency Request</h2>
            <p className="text-sm text-gray-500 mb-6">Your location will be used to find nearby donors.</p>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <NField label="Blood Type" as="select" value={sosForm.bloodType} onChange={(e) => setSosForm({ ...sosForm, bloodType: e.target.value as BloodType })}>
                        <option>A</option> <option>B</option> <option>AB</option> <option>O</option>
                    </NField>
                    <NField label="Rh Factor" as="select" value={sosForm.rh} onChange={(e) => setSosForm({ ...sosForm, rh: e.target.value as Rh })}>
                        <option>+</option> <option>-</option>
                    </NField>
                </div>
                <NField label="Urgency" as="select" value={sosForm.urgency} onChange={(e) => setSosForm({ ...sosForm, urgency: e.target.value as Urgency })}>
                    <option value="low">Low</option> <option value="medium">Medium</option> <option value="high">High</option> <option value="critical">Critical</option>
                </NField>
                 <div className="grid grid-cols-2 gap-4">
                    <NField label="Patient Name" type="text" value={sosForm.patientName} onChange={(e) => setSosForm({ ...sosForm, patientName: e.target.value })} placeholder="Patient Name" />
                    <NField label="Patient Age" type="number" value={sosForm.patientAge} onChange={(e) => setSosForm({ ...sosForm, patientAge: e.target.value })} placeholder="Patient Age" />
                </div>
                <NField label="Hospital" type="text" value={sosForm.hospital} onChange={(e) => setSosForm({ ...sosForm, hospital: e.target.value })} placeholder="Hospital Name" />
                <NField label="Contact" type="tel" value={sosForm.contact} onChange={(e) => setSosForm({ ...sosForm, contact: e.target.value })} placeholder="Contact Number" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <NButton onClick={() => setIsSosModalOpen(false)} className="bg-gray-200 text-gray-700">Cancel</NButton>
                <NButton onClick={handleSendRequest} disabled={submitting}>
                    {submitting ? "Sending..." : "Send Request"}
                </NButton>
            </div>
        </NModal>
    )
}

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { setIsSosModalOpen } = useDashboard()
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
      <BottomTabBar onPostRequestClick={() => setIsSosModalOpen(true)} />
      <RequestModal />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}