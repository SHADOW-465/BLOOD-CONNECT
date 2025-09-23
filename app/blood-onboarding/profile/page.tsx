"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Droplet, LocateFixed, ArrowLeft, ArrowRight } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

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
  const [radiusKm, setRadiusKm] = useState<5 | 10 | 25 | 50>(10)

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
        setBloodType(profile.blood_type || "")
        setRh(profile.rh || "")
        setRadiusKm(profile.radius_km || 10)
        setLatitude(profile.location_lat)
        setLongitude(profile.location_lng)
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

    // First, save the non-location data as before
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      blood_type: bloodType,
      rh: rh,
      radius_km: radiusKm,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error updating profile", profileError)
      alert("Error saving profile.")
      return
    }

    // Then, if location is set, update it via the API
    if (latitude && longitude) {
      await fetch("/api/profile/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      })
    }

    router.push("/dashboard")
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const bloodTypes: BloodType[] = ["A", "B", "AB", "O"]
  const radii: Array<5 | 10 | 25 | 50> = [5, 10, 25, 50]

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
                <motion.button
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setBloodType(t)}
                  className={`px-4 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono transition-all duration-200 ${
                    selected
                      ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                      : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
                  }`}
                >
                  {t}
                </motion.button>
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
                <motion.button
                  key={sign}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setRh(sign)}
                  className={`px-4 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono transition-all duration-200 ${
                    selected
                      ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                      : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
                  }`}
                >
                  {sign}
                </motion.button>
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
            <motion.button
              onClick={handleSetLocation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 px-4 py-2 bg-[#f0f3fa] rounded-xl font-semibold shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-700 mx-auto"
            >
              <LocateFixed className="w-4 h-4" />
              {locationStatus === "loading" ? "Getting..." : "Use My Current Location"}
            </motion.button>
          </div>
        </div>

        {/* radius */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 font-mono text-center">Notification Radius</h2>
          <div className="grid grid-cols-4 gap-3">
            {radii.map((r, i) => {
              const selected = radiusKm === r
              return (
                <motion.button
                  key={r}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setRadiusKm(r)}
                  className={`flex-1 px-4 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono transition-all duration-200 ${
                    selected
                      ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-1 ring-[#ff149380] text-[#ff1493]"
                      : "shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] text-gray-700"
                  }`}
                >
                  {r} km
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => router.push("/blood-onboarding/eligibility")}
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
