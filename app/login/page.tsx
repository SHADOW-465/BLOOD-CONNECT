"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2, User, Eye, EyeOff, Chrome } from "lucide-react"
import { motion } from "framer-motion"
import { NButton } from "@/components/ui/NButton"
import { NCard, NCardContent, NCardHeader, NCardTitle } from "@/components/ui/NCard"
import { NInput } from "@/components/ui/NInput"

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
      router.refresh()
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
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
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
        <button className="text-gray-500 hover:text-primary hover:underline transition-all duration-200 font-mono">
          Forgot password?
        </button>
        <button
          onClick={signUpEmail}
          className="text-gray-500 hover:text-primary hover:underline transition-all duration-200 font-mono"
        >
          or Sign up
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <NCard>
          <NCardHeader className="items-center">
            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-4 shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <NCardTitle>Sign In</NCardTitle>
          </NCardHeader>
          <NCardContent>
            <form className="w-full">
              <div className="relative mb-6">
                <NInput
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative mb-6">
                <NInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

              <NButton onClick={signInEmail} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
              </NButton>
            </form>

            <div className="w-full my-4 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-border" />
              <span className="text-xs text-muted-foreground font-mono">or</span>
              <div className="flex-1 h-[1px] bg-border" />
            </div>

            <NButton
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full"
              variant="secondary"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </NButton>

            <div className="mt-6">
              <FooterLinks />
            </div>
          </NCardContent>
        </NCard>
      </motion.div>
    </div>
  )
}
