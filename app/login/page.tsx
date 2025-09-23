"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2, LogIn, MoveRight, User, Eye, EyeOff, Chrome } from "lucide-react"
import { motion } from "framer-motion"

const AvatarPlaceholder: React.FC = () => {
  return (
    <div className="w-20 h-20 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-8 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]">
      <User
        className="w-8 h-8 text-gray-400"
        style={{
          color: "#374151",
        }}
      />
    </div>
  )
}

interface InputFieldProps {
  type: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  showPasswordToggle?: boolean
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, value, onChange, showPasswordToggle = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type
  return (
    <div className="relative mb-6">
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono ${isFocused ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#ff149380]" : "shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"}`}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  )
}

interface LoginButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  isLoading: boolean
  label: string
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, isLoading, label }) => {
  return (
    <motion.button
      type="submit"
      onClick={onClick}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={`w-full py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 text-lg mb-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono font-normal ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        color: "#ff1493",
      }}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
    </motion.button>
  )
}

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInEmail(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.replace("/dashboard")
    } catch (e: any) {
      setError(e?.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  async function signUpEmail() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/blood-onboarding/eligibility`,
        },
      })
      if (error) throw error
      router.replace("/blood-onboarding/eligibility")
    } catch (e: any) {
      setError(e?.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      if (error) throw error
    } catch (e: any) {
      setError(e?.message || "Google sign in failed")
      setLoading(false)
    }
  }

  const FooterLinks: React.FC = () => {
    return (
      <div className="flex justify-between items-center text-sm">
        <button className="text-gray-500 hover:text-[#ff1493] hover:underline transition-all duration-200 font-mono">
          Forgot password?
        </button>
        <button
          onClick={signUpEmail}
          className="text-gray-500 hover:text-[#ff1493] hover:underline transition-all duration-200 font-mono"
          style={{
            marginLeft: "5px",
          }}
        >
          or Sign up
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-3xl text-center font-mono font-black text-gray-500 mt-20 mb-6">Sign In</h1>
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="w-full max-w-md mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff] mt-4"
        >
          <div className="flex flex-col items-center">
            <AvatarPlaceholder />

            <form className="w-full">
              <InputField type="email" placeholder="Email" value={email} onChange={setEmail} />

              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                showPasswordToggle={true}
              />

              {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

              <LoginButton onClick={signInEmail} isLoading={loading} label="Login" />
            </form>

            {/* Divider */}
            <div className="w-full my-4 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#e6ebf5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]" />
              <span className="text-xs text-gray-500 font-mono">or</span>
              <div className="flex-1 h-[1px] bg-[#e6ebf5] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]" />
            </div>

            {/* Continue with Google */}
            <motion.button
              type="button"
              onClick={signInWithGoogle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className={`w-full py-3 bg-[#f0f3fa] rounded-2xl text-gray-700 text-sm mb-4 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono font-normal ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Continue with Google"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Chrome className="w-4 h-4 text-gray-600" />
                <span>Continue with Google</span>
              </span>
            </motion.button>

            <FooterLinks />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
