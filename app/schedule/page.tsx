"use client"

import { useEffect, useState } from "react"
import { NButton, NCard, NModal, NField, NBadge, NAlert, NList, NListItem, NProgress } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Calendar, MapPin, Clock, Cloud, Users, Bell, CheckCircle } from "lucide-react"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { format, addDays, isAfter, isBefore } from "date-fns"

type Hospital = {
  id: string
  name: string
  location_lat: number
  location_lng: number
  contact_phone: string
  current_wait_time?: number
  queue_length?: number
}

type WeatherAlert = {
  id: string
  alert_type: string
  severity: string
  message: string
  start_time: string
  end_time: string
}

type ScheduledDonation = {
  id: string
  scheduled_date: string
  location: string
  status: string
  reminder_sent: boolean
  notes: string | null
}

export default function SchedulePage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([])
  const [scheduledDonations, setScheduledDonations] = useState<ScheduledDonation[]>([])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    hospital_id: "",
    notes: ""
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        await loadData(session.user.id)
      }
    }
    getUserData()
  }, [supabase])

  const loadData = async (userId: string) => {
    await Promise.all([
      loadHospitals(),
      loadWeatherAlerts(),
      loadScheduledDonations(userId)
    ])
  }

  const loadHospitals = async () => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("name")

    if (data) {
      // Simulate current wait times and queue lengths
      const hospitalsWithData = data.map(hospital => ({
        ...hospital,
        current_wait_time: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
        queue_length: Math.floor(Math.random() * 10) + 1 // 1-10 people
      }))
      setHospitals(hospitalsWithData)
    }
  }

  const loadWeatherAlerts = async () => {
    const { data, error } = await supabase
      .from("weather_alerts")
      .select("*")
      .gte("end_time", new Date().toISOString())
      .order("severity", { ascending: false })

    if (data) {
      setWeatherAlerts(data)
    }
  }

  const loadScheduledDonations = async (userId: string) => {
    const { data, error } = await supabase
      .from("donation_calendar")
      .select("*")
      .eq("donor_id", userId)
      .order("scheduled_date", { ascending: true })

    if (data) {
      setScheduledDonations(data)
    }
  }

  const generateAvailableSlots = (date: Date) => {
    const slots = []
    const startHour = 8
    const endHour = 17
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    
    setAvailableSlots(slots)
  }

  const handleScheduleDonation = async () => {
    if (!user || !scheduleForm.date || !scheduleForm.time || !scheduleForm.hospital_id) return
    
    setLoading(true)
    try {
      const selectedHospital = hospitals.find(h => h.id === scheduleForm.hospital_id)
      const scheduledDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}`)
      
      const { error } = await supabase
        .from("donation_calendar")
        .insert({
          donor_id: user.id,
          scheduled_date: scheduleForm.date,
          location: selectedHospital?.name,
          notes: scheduleForm.notes,
          status: 'scheduled'
        })

      if (!error) {
        await loadScheduledDonations(user.id)
        setIsScheduleModalOpen(false)
        setScheduleForm({
          date: "",
          time: "",
          hospital_id: "",
          notes: ""
        })
        
        // Send notification
        await supabase
          .from("notifications")
          .insert({
            user_id: user.id,
            type: "appointment_reminder",
            title: "Donation Scheduled",
            message: `Your blood donation is scheduled for ${format(scheduledDateTime, "MMM dd, yyyy 'at' h:mm a")} at ${selectedHospital?.name}`,
            data: {
              appointment_id: scheduledDateTime.toISOString(),
              hospital_name: selectedHospital?.name
            }
          })
      }
    } catch (error) {
      console.error("Error scheduling donation:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info'
      case 'confirmed': return 'success'
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    const maxDate = addDays(today, 90) // 3 months ahead
    
    return isAfter(date, today) && isBefore(date, maxDate)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#e74c3c] mb-2">Schedule Donation</h1>
          <p className="text-gray-600">Book your next blood donation appointment</p>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Weather Alerts
            </h2>
            <div className="space-y-3">
              {weatherAlerts.map((alert) => (
                <NAlert key={alert.id} type={getSeverityColor(alert.severity)}>
                  <div className="flex items-start gap-3">
                    <Cloud className="w-5 h-5 mt-0.5" />
                    <div>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm opacity-75">
                        {format(new Date(alert.start_time), "MMM dd")} - {format(new Date(alert.end_time), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </NAlert>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Hospitals */}
          <div className="lg:col-span-2">
            <NCard className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Available Locations
              </h2>
              <div className="grid gap-4">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{hospital.name}</h3>
                        <p className="text-sm text-gray-600">{hospital.contact_phone}</p>
                      </div>
                      <NButton
                        onClick={() => {
                          setScheduleForm({ ...scheduleForm, hospital_id: hospital.id })
                          setIsScheduleModalOpen(true)
                        }}
                        size="sm"
                      >
                        Schedule
                      </NButton>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {hospital.current_wait_time} min wait
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {hospital.queue_length} in queue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NCard>
          </div>

          {/* Upcoming Appointments */}
          <div className="lg:col-span-1">
            <NCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Appointments
              </h2>
              {scheduledDonations.length > 0 ? (
                <NList>
                  {scheduledDonations.map((donation) => (
                    <NListItem key={donation.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">
                            {format(new Date(donation.scheduled_date), "MMM dd, yyyy")}
                          </div>
                          {donation.location && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {donation.location}
                            </div>
                          )}
                          {donation.notes && (
                            <div className="text-sm text-gray-500 mt-1">{donation.notes}</div>
                          )}
                        </div>
                        <NBadge variant={getStatusColor(donation.status)}>
                          {donation.status}
                        </NBadge>
                      </div>
                    </NListItem>
                  ))}
                </NList>
              ) : (
                <NAlert type="info">
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No scheduled donations</p>
                    <p className="text-sm text-gray-500">Schedule your next donation</p>
                  </div>
                </NAlert>
              )}
            </NCard>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <NModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}>
        <h2 className="text-xl font-semibold text-[#e74c3c] mb-4">Schedule Donation</h2>
        
        <div className="space-y-4">
          <NField
            label="Date"
            type="date"
            value={scheduleForm.date}
            onChange={(e) => {
              setScheduleForm({ ...scheduleForm, date: e.target.value })
              generateAvailableSlots(new Date(e.target.value))
            }}
            min={format(new Date(), "yyyy-MM-dd")}
            max={format(addDays(new Date(), 90), "yyyy-MM-dd")}
          />

          <NField
            label="Time"
            as="select"
            value={scheduleForm.time}
            onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
          >
            <option value="">Select time</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {format(new Date(`2000-01-01T${slot}`), "h:mm a")}
              </option>
            ))}
          </NField>

          <NField
            label="Notes (Optional)"
            as="textarea"
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
            placeholder="Any special requirements or notes..."
          />

          {scheduleForm.date && (
            <NAlert type="info">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">
                  You'll receive reminders 24 hours and 2 hours before your appointment.
                </span>
              </div>
            </NAlert>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <NButton 
            onClick={() => setIsScheduleModalOpen(false)}
            className="bg-gray-200 text-gray-700"
          >
            Cancel
          </NButton>
          <NButton 
            onClick={handleScheduleDonation}
            disabled={loading || !scheduleForm.date || !scheduleForm.time || !scheduleForm.hospital_id}
          >
            {loading ? "Scheduling..." : "Schedule Donation"}
          </NButton>
        </div>
      </NModal>
    </div>
  )
}