"use client"
import { Home, User, Plus, Heart, Bell } from "lucide-react"
import Link from "next/link"

const BottomTabBar = ({ onPostRequestClick }: { onPostRequestClick: () => void }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-4 z-20">
      <Link href="/dashboard" className="flex flex-col items-center text-medium-grey hover:text-primary-red">
        <Home className="w-6 h-6 mb-1" />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/schedule" className="flex flex-col items-center text-medium-grey hover:text-primary-red">
        <Heart className="w-6 h-6 mb-1" />
        <span className="text-xs">Donations</span>
      </Link>

      <button
        onClick={onPostRequestClick}
        className="w-16 h-16 bg-primary-red text-white rounded-full flex items-center justify-center -mt-8 shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
        aria-label="Post Emergency Request"
      >
        <Plus className="w-8 h-8" />
      </button>

      <Link href="/notifications" className="flex flex-col items-center text-medium-grey hover:text-primary-red">
        <Bell className="w-6 h-6 mb-1" />
        <span className="text-xs">Activity</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center text-medium-grey hover:text-primary-red">
        <User className="w-6 h-6 mb-1" />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  )
}

export default BottomTabBar