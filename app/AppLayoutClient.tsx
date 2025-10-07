"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { AppProvider, useApp } from "./AppContext"
import BottomTabBar from "@/components/BottomTabBar"
import { NModal, NButton, NField } from "@/components/nui"
import { toast } from "sonner"

type BloodType = "A" | "B" | "AB" | "O"
type Rh = "+" | "-"
type Urgency = "low" | "medium" | "high" | "critical"

const RequestModal = () => {
    const { isSosModalOpen, setIsSosModalOpen, loc, loadNearby } = useApp()
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
          // Transform the form data to match API expectations
          const requestData = {
            blood_type: sosForm.bloodType,
            rh: sosForm.rh,
            urgency: sosForm.urgency,
            units_needed: 1, // Default to 1 unit
            location_lat: loc.lat,
            location_lng: loc.lng,
            patient_name: sosForm.patientName,
            patient_age: parseInt(sosForm.patientAge) || 0,
            hospital: sosForm.hospital,
            contact: sosForm.contact,
          }
          
          const res = await fetch("/api/requests-v2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Request failed")
          }
          
          toast.success("Emergency request sent to nearby donors.")
          await loadNearby()
        } catch (e: any) {
          toast.error(e.message || "Failed to send emergency request.")
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


const AppLayoutClientContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { setIsSosModalOpen } = useApp()

  // Don't show the tab bar on the login page
  const showTabBar = pathname !== "/login"

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {showTabBar && <BottomTabBar onPostRequestClick={() => setIsSosModalOpen(true)} />}
      <RequestModal />
    </div>
  )
}


export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayoutClientContent>{children}</AppLayoutClientContent>
    </AppProvider>
  )
}