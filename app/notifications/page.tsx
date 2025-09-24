"use client"

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { NCard, NList, NListItem, NBadge } from '@/components/nui';
import { Bell, Mail } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

type Notification = {
    id: string;
    user_id: string;
    type: 'emergency_request' | 'appointment_reminder' | 'donation_reminder' | 'system_update';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
};

export default function NotificationsPage() {
    const supabase = getSupabaseBrowserClient();
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                await fetchNotifications(session.user.id);
            } else {
                setLoading(false);
            }
        };
        init();
    }, [supabase, fetchNotifications]);

    const handleNotificationClick = async (notification: Notification) => {
        if (notification.read) return;

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notification.id);

        if (error) {
            console.error('Error marking notification as read:', error);
        } else {
            // Optimistically update the UI
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#e74c3c]">Notifications</h1>
                    {unreadCount > 0 && <NBadge variant="error">{unreadCount} Unread</NBadge>}
                </div>

                <NCard>
                    {loading ? <p>Loading notifications...</p> : (
                        <NList>
                            {notifications.length > 0 ? notifications.map(notification => (
                                <NListItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`transition-all ${!notification.read ? 'bg-red-50' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full ${!notification.read ? 'bg-red-100' : 'bg-gray-100'}`}>
                                            <Bell className={`w-5 h-5 ${!notification.read ? 'text-red-500' : 'text-gray-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className={`font-semibold ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>{notification.title}</p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>{notification.message}</p>
                                        </div>
                                        <div className="mt-1">
                                            {!notification.read && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                                        </div>
                                    </div>
                                </NListItem>
                            )) : (
                                <div className="text-center py-8">
                                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-semibold">All Caught Up</h3>
                                    <p className="text-sm text-gray-500">You have no new notifications.</p>
                                </div>
                            )}
                        </NList>
                    )}
                </NCard>
            </div>
        </div>
    );
}
