"use client"

import { NButton, NCard, NField } from "@/components/nui"
import { useState } from "react"

export default function SchedulePage() {
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [locationName, setLocationName] = useState("Nearest Blood Bank")

  async function schedule() {
    await fetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({ scheduled_at: `${date}T${time}:00`, location: locationName }),
    })
    alert("Appointment requested")
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <NCard className="w-full max-w-xl">
        <h2 className="text-xl font-semibold text-[#e74c3c]">Donation Scheduling</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <NField label="Date" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} />
          <NField label="Time" type="time" value={time} onChange={(e) => setTime(e.currentTarget.value)} />
          <NField
            className="md:col-span-2"
            label="Location"
            value={locationName}
            onChange={(e) => setLocationName(e.currentTarget.value)}
          />
        </div>
        <div className="mt-8 flex justify-end">
          <NButton onClick={schedule}>Confirm</NButton>
        </div>
      </NCard>
    </div>
  )
}
