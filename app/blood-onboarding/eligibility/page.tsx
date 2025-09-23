"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, HeartPulse } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

type MedicalFlags = {
  recentIllness: boolean
  onMedication: boolean
  pregnantOrNursing: boolean
  chronicCondition: boolean
}

export default function EligibilityPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  // core fields
  const [age, setAge] = useState<number | "">("")
  const [weight, setWeight] = useState<number | "">("")
  const [lastDonationDate, setLastDonationDate] = useState<string>("")
  const [medicalFlags, setMedicalFlags] = useState<MedicalFlags>({
    recentIllness: false,
    onMedication: false,
    pregnantOrNursing: false,
    chronicCondition: false,
  })

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

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      if (profile) {
        setAge(profile.age || "")
        setWeight(profile.weight || "")
        setLastDonationDate(profile.last_donation_date || "")
        if (profile.medical_flags) {
          setMedicalFlags(profile.medical_flags)
        }
      }
      setLoaded(true)
    }
    getUser()
  }, [router, supabase])

  const daysSinceDonation = useMemo(() => {
    if (!lastDonationDate) return undefined
    const diff = Date.now() - new Date(lastDonationDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }, [lastDonationDate])

  const nextEligibleDate = useMemo(() => {
    if (!lastDonationDate) return undefined
    const next = new Date(lastDonationDate)
    // 56 days deferral (whole blood)
    next.setDate(next.getDate() + 56)
    return next.toISOString()
  }, [lastDonationDate])

  const isEligible = useMemo(() => {
    const ageOk = typeof age === "number" && age >= 18 && age <= 65
    const weightOk = typeof weight === "number" && weight >= 50
    const donationOk = daysSinceDonation === undefined || daysSinceDonation >= 56
    const medicalOk = !medicalFlags.recentIllness && !medicalFlags.pregnantOrNursing && !medicalFlags.chronicCondition
    return ageOk && weightOk && donationOk && medicalOk
  }, [age, weight, daysSinceDonation, medicalFlags])

  const canContinue = useMemo(() => {
    return typeof age === "number" && typeof weight === "number"
  }, [age, weight])

  const saveAndNext = async () => {
    if (!user) return

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      age: typeof age === "number" ? age : 0,
      weight: typeof weight === "number" ? weight : 0,
      last_donation_date: lastDonationDate || null,
      medical_notes: JSON.stringify(medicalFlags), // Using medical_notes to store flags as JSON
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating profile", error)
      return
    }

    router.push("/blood-onboarding/profile")
  }

  const goBack = () => router.push("/dashboard")

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
            <HeartPulse className="w-8 h-8 text-[#ff1493]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 font-mono">Quick Eligibility</h1>
          <p className="text-gray-500 font-mono mt-1">Answer a few questions to check if you're eligible to donate</p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Age (years)"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-500 font-mono mb-2">Last donation date (optional)</label>
          <input
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
            className="w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
          />
          {!!lastDonationDate && (
            <p className="text-xs text-gray-500 font-mono mt-2">
              Days since last donation: {typeof daysSinceDonation === "number" ? daysSinceDonation : "-"}
            </p>
          )}
        </div>

        {/* Medical flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {[
            { key: "recentIllness", label: "Recent illness/fever" },
            { key: "onMedication", label: "Currently on medication" },
            { key: "pregnantOrNursing", label: "Pregnant or nursing" },
            { key: "chronicCondition", label: "Chronic condition" },
          ].map((f) => {
            const checked = (medicalFlags as any)[f.key] as boolean
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setMedicalFlags((m) => ({ ...m, [f.key]: !checked }))}
                className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-left transition-all duration-200 font-mono ${
                  checked
                    ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                    : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-600"
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Eligibility status */}
        <div className="mb-8">
          <div
            className={`px-4 py-3 rounded-2xl text-sm font-mono text-center ${
              isEligible
                ? "text-[#ff1493] bg-[#f0f3fa] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]"
                : "text-gray-500 bg-[#f0f3fa] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]"
            }`}
          >
            {isEligible ? "You look eligible to donate!" : "You may not be eligible right now."}
            {nextEligibleDate && !isEligible && (
              <span className="block mt-1">Next possible date: {new Date(nextEligibleDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={goBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          <motion.button
            onClick={saveAndNext}
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className={`px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono ${
              canContinue ? "text-[#ff1493]" : "text-gray-400 opacity-50 cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
