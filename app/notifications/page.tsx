"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { NCard } from "@/components/nui"
import { formatDistanceToNow } from "date-fns"

type Notification = {
  id: string
  title: string
  message: string
  created_at: string
  is_read: boolean
}

export default function NotificationsPage() {
  const supabase = getSupabaseBrowserClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Error fetching notifications:", error)
      } else {
        setNotifications(data)
      }
      setLoading(false)
    }

    fetchNotifications()
  }, [supabase])

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    if (error) {
      console.error("Error marking notification as read:", error)
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>You have no notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NCard key={notification.id} className={`p-4 ${notification.is_read ? "bg-gray-100" : "bg-white"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{notification.title}</h2>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </NCard>
          ))}
        </div>
      )}
    </div>
  )
}
