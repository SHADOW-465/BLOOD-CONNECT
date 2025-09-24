"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, HeartPulse } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { NButton } from "@/components/ui/NButton"
import { NInput } from "@/components/ui/NInput"

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
  const [dob, setDob] = useState<string>("")
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

      const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", session.user.id).single()

      if (profile) {
        setDob(profile.date_of_birth || "")
        setWeight(profile.weight_kg || "")
        setLastDonationDate(profile.last_donation_date || "")
        if (profile.medical_conditions) {
          setMedicalFlags(JSON.parse(profile.medical_conditions))
        }
      }
      setLoaded(true)
    }
    getUser()
  }, [router, supabase])

  const age = useMemo(() => {
    if (!dob) return undefined
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }, [dob])

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

    const { error } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      date_of_birth: dob,
      weight_kg: typeof weight === "number" ? weight : 0,
      last_donation_date: lastDonationDate || null,
      medical_conditions: JSON.stringify(medicalFlags),
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
            <NInput
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
            />
            <NInput
                label="Weight (kg)"
                type="number"
                inputMode="numeric"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
            />
        </div>

        <div className="mb-6">
          <NInput
            label="Last donation date (optional)"
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
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
              <NButton
                key={f.key}
                variant={checked ? "default" : "secondary"}
                onClick={() => setMedicalFlags((m) => ({ ...m, [f.key]: !checked }))}
              >
                {f.label}
              </NButton>
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
            <NButton onClick={goBack} variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </NButton>
            <NButton onClick={saveAndNext} disabled={!canContinue}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
            </NButton>
        </div>
      </motion.div>
    </div>
  )
}
