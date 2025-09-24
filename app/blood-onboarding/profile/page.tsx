"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Droplet, LocateFixed, ArrowLeft, ArrowRight } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { NButton } from "@/components/ui/NButton"

type BloodType = "A" | "B" | "AB" | "O"
type Rh = "+" | "-"

export default function BloodProfilePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [bloodType, setBloodType] = useState<BloodType | "">("")
  const [rh, setRh] = useState<Rh | "">("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState("idle")

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
        setBloodType(profile.blood_type || "")
        setRh(profile.rh_factor || "")
        setLatitude(profile.latitude)
        setLongitude(profile.longitude)
      }
      setLoaded(true)
    }
    getUser()
  }, [router, supabase])

  const canContinue = bloodType && rh

  const handleSetLocation = () => {
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationStatus("success")
      },
      (error) => {
        console.error("Geolocation error:", error)
        setLocationStatus("error")
        alert("Could not get your location. Please check your browser permissions.")
      },
    )
  }

  const saveAndNext = async () => {
    if (!user) return

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      blood_type: bloodType,
      rh_factor: rh,
      latitude: latitude,
      longitude: longitude,
    })

    if (profileError) {
      console.error("Error updating profile", profileError)
      alert("Error saving profile.")
      return
    }

    router.push("/blood-onboarding/availability")
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const bloodTypes: BloodType[] = ["A", "B", "AB", "O"]

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
            <Droplet className="w-8 h-8 text-[#ff1493]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 font-mono">Your Blood Profile</h1>
          <p className="text-gray-500 font-mono mt-1">Set up blood group, Rh factor and location</p>
        </div>

        {/* Blood group */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 font-mono text-center">Blood Group</h2>
          <div className="grid grid-cols-4 gap-3">
            {bloodTypes.map((t, i) => {
              const selected = bloodType === t
              return (
                <NButton
                  key={t}
                  variant={selected ? "default" : "secondary"}
                  onClick={() => setBloodType(t)}
                >
                  {t}
                </NButton>
              )
            })}
          </div>
        </div>

        {/* Rh */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 font-mono text-center">Rh Factor</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["+", "-"] as Rh[]).map((sign, i) => {
              const selected = rh === sign
              return (
                <NButton
                  key={sign}
                  variant={selected ? "default" : "secondary"}
                  onClick={() => setRh(sign)}
                >
                  {sign}
                </NButton>
              )
            })}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 font-mono text-center">Your Location</h2>
          <div className="p-4 bg-[#e6eaf1] rounded-2xl text-center">
            {latitude && longitude ? (
              <div>
                <p className="font-mono text-sm text-green-700">Location set!</p>
                <p className="font-mono text-xs text-gray-500">
                  Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <p className="font-mono text-sm text-gray-500">Your location is not set.</p>
            )}
            <NButton onClick={handleSetLocation} variant="secondary" className="mt-3">
              <LocateFixed className="w-4 h-4 mr-2" />
              {locationStatus === "loading" ? "Getting..." : "Use My Current Location"}
            </NButton>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <NButton onClick={() => router.push("/blood-onboarding/eligibility")} variant="secondary">
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
