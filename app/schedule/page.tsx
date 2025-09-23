"use client"

import { NButton, NCard } from "@/components/nui"
import { useEffect, useMemo, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { generateAvailableSlots } from "@/lib/time"
import { format, parseISO } from "date-fns"
import { ArrowLeft } from "lucide-react"

type Hospital = {
  id: string
  name: string
  operating_hours: any
  appointment_duration_minutes: number
}

export default function SchedulePage() {
  const supabase = getSupabaseBrowserClient()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [appointments, setAppointments] = useState<{ scheduled_at: string }[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getHospitals() {
      setLoading(true)
      const { data, error } = await supabase.from("hospitals").select("*")
      if (data) setHospitals(data)
      if (error) console.error("Error fetching hospitals:", error)
      setLoading(false)
    }
    getHospitals()
  }, [supabase])

  async function handleSelectHospital(hospital: Hospital) {
    setSelectedHospital(hospital)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data, error } = await supabase
      .from("appointments")
      .select("scheduled_at")
      .eq("location", hospital.name) // Assuming location is stored by name. Better to use ID.
      .gte("scheduled_at", new Date().toISOString())
      .lte("scheduled_at", thirtyDaysFromNow.toISOString())

    if (data) setAppointments(data)
    if (error) console.error("Error fetching appointments:", error)
  }

  const availableSlots = useMemo(() => {
    if (!selectedHospital) return []
    const bookedDates = appointments.map((a) => parseISO(a.scheduled_at))
    return generateAvailableSlots(
      selectedHospital.operating_hours,
      selectedHospital.appointment_duration_minutes,
      bookedDates,
    )
  }, [selectedHospital, appointments])

  const groupedSlots = useMemo(() => {
    return availableSlots.reduce(
      (acc, slot) => {
        const day = format(slot, "yyyy-MM-dd")
        if (!acc[day]) {
          acc[day] = []
        }
        acc[day].push(slot)
        return acc
      },
      {} as Record<string, Date[]>,
    )
  }, [availableSlots])

  async function handleConfirm() {
    if (!selectedSlot || !selectedHospital) return
    setLoading(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduled_at: selectedSlot.toISOString(),
          location: selectedHospital.name,
          hospital_id: selectedHospital.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to book appointment.")
      }

      alert(`Appointment confirmed for ${format(selectedSlot, "PPP p")}!`)
      // Redirect to dashboard after booking
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Booking error:", error)
      alert(`Booking failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p>Loading donation centers...</p>
      </div>
    )
  }

  if (selectedHospital) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <NCard className="w-full max-w-3xl">
          <button onClick={() => setSelectedHospital(null)} className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to centers
          </button>
          <h2 className="text-xl font-semibold text-[#e74c3c]">Select a Time Slot</h2>
          <p className="text-sm text-gray-600">At {selectedHospital.name}</p>
          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedSlots).length > 0 ? (
              Object.entries(groupedSlots).map(([day, slots]) => (
                <div key={day}>
                  <h3 className="font-semibold text-gray-800">{format(parseISO(day), "EEEE, MMMM d")}</h3>
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.toISOString()}
                        onClick={() => setSelectedSlot(slot)}
                        className={cn(
                          "p-2 rounded-lg text-sm transition-colors",
                          selectedSlot?.getTime() === slot.getTime()
                            ? "bg-[#e74c3c] text-white shadow-[inset_2px_2px_4px_#c43e2e,inset_-2px_-2px_4px_#ff5a4a]"
                            : "bg-gray-200 hover:bg-gray-300",
                        )}
                      >
                        {format(slot, "p")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No available slots in the next 7 days for this location.</p>
            )}
          </div>
          <div className="mt-8 flex justify-end">
            <NButton onClick={handleConfirm} disabled={!selectedSlot || loading}>
              {loading ? "Confirming..." : "Confirm Appointment"}
            </NButton>
          </div>
        </NCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <NCard className="w-full max-w-xl">
        <h2 className="text-xl font-semibold text-[#e74c3c]">Select a Donation Center</h2>
        <ul className="mt-6 space-y-3">
          {hospitals.map((hospital) => (
            <li key={hospital.id}>
              <button
                onClick={() => handleSelectHospital(hospital)}
                className="w-full text-left p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {hospital.name}
              </button>
            </li>
          ))}
        </ul>
      </NCard>
    </div>
  )
}

// Minimal cn helper for this component
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
