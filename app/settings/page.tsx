"use client"

import { NCard, NButton } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { User, LogOut, Sun, Moon, Bell } from "lucide-react"

export default function SettingsPage() {
    const supabase = getSupabaseBrowserClient()
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold text-[#e74c3c] mb-6">Settings</h1>

                <div className="space-y-6">
                    <NCard>
                        <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Account</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <NButton onClick={() => router.push('/profile')}>
                                <User className="w-5 h-5" />
                                Edit Profile
                            </NButton>
                            <NButton onClick={handleLogout} className="!bg-red-500 hover:!bg-red-600 !text-white">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </NButton>
                        </div>
                    </NCard>

                    <NCard>
                        <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Appearance</h2>
                        <div className="flex items-center justify-between">
                            <p className="text-gray-700 dark:text-gray-300">Switch between light and dark mode.</p>
                            <NButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                <span className="capitalize">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                            </NButton>
                        </div>
                    </NCard>

                    <NCard>
                        <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Notifications</h2>
                         <div className="flex items-center justify-between">
                            <p className="text-gray-700 dark:text-gray-300">View your recent notifications.</p>
                            <NButton onClick={() => router.push('/notifications')}>
                                <Bell className="w-5 h-5" />
                                View Notifications
                            </NButton>
                        </div>
                    </NCard>
                </div>
            </div>
        </div>
    )
}
