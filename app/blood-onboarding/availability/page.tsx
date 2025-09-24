"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Hand, ShieldCheck, ArrowLeft, ArrowRight, CalendarClock } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export default function AvailabilityPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [available, setAvailable] = useState(true)
  const [consentShareContact, setConsentShareContact] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [nextEligibleDate, setNextEligibleDate] = useState<string | undefined>(undefined)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      setUser(session.user)

      const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()
      const { data: profileData } = await supabase.from("user_profiles").select("*").eq("user_id", session.user.id).single()

      if (userData) {
        setAvailable(userData.availability_status === "available")
      }

      if (profileData) {
        const notes = JSON.parse(profileData.medical_conditions || "{}")
        setConsentShareContact(notes.consentShareContact ?? true)
        setNotifications(notes.notifications ?? true)
        if (profileData.last_donation_date) {
          const next = new Date(profileData.last_donation_date)
          next.setDate(next.getDate() + 56)
          setNextEligibleDate(next.toISOString())
        }
      }
      setLoaded(true)
    }
    getUser()
  }, [router, supabase])

  const saveAndFinish = async () => {
    if (!user) return

    const { data: profile } = await supabase.from("user_profiles").select("medical_conditions").eq("user_id", user.id).single()
    const notes = JSON.parse(profile?.medical_conditions || "{}")
    notes.consentShareContact = consentShareContact
    notes.notifications = notifications

    const { error: userError } = await supabase.from("users").update({
      availability_status: available ? "available" : "unavailable",
    }).eq("id", user.id)

    const { error: profileError } = await supabase.from("user_profiles").update({
      medical_conditions: JSON.stringify(notes),
    }).eq("user_id", user.id)

    if (userError || profileError) {
      console.error("Error updating profile", userError || profileError)
      return
    }
    router.push("/dashboard")
  }

  const statusText = useMemo(() => (available ? "Available to donate" : "Temporarily unavailable"), [available])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-4 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]">
            <Hand className="w-8 h-8 text-[#ff1493]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 font-mono">Availability & Consent</h1>
          <p className="text-gray-500 font-mono mt-1">Control your visibility for emergency matching</p>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <div
            className={`px-4 py-3 rounded-2xl text-sm font-mono text-center ${
              available
                ? "text-[#ff1493] bg-[#f0f3fa] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]"
                : "text-gray-500 bg-[#f0f3fa] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]"
            }`}
          >
            {statusText}
          </div>
          <div className="mt-3 flex gap-2">
            {["Available", "Unavailable"].map((label, i) => {
              const selected = (available && label === "Available") || (!available && label === "Unavailable")
              return (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setAvailable(label === "Available")}
                  className={`flex-1 px-4 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono transition-all duration-200 ${
                    selected
                      ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                      : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
                  }`}
                >
                  {label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Consents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => setConsentShareContact((v) => !v)}
            className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-left transition-all duration-200 font-mono flex items-center gap-2 ${
              consentShareContact
                ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Share my contact during emergencies
          </button>

          <button
            type="button"
            onClick={() => setNotifications((v) => !v)}
            className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-left transition-all duration-200 font-mono flex items-center gap-2 ${
              notifications
                ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
            }`}
          >
            <Bell className="w-4 h-4" /> Enable notifications
          </button>
        </div>

        {/* Next eligible */}
        {nextEligibleDate && (
          <div className="mb-8 px-4 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono text-gray-600 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Next eligible date based on your last donation: {new Date(nextEligibleDate).toLocaleDateString()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => router.push("/blood-onboarding/profile")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          <motion.button
            onClick={saveAndFinish}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-[#ff1493]"
          >
            Finish <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
