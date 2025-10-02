import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const db = {
  // Profiles
  profiles: {
    get: (id) => supabase.from('profiles').select('*').eq('id', id).single(),
    getAll: () => supabase.from('profiles').select('*'),
    update: (id, data) => supabase.from('profiles').update(data).eq('id', id),
    create: (data) => supabase.from('profiles').insert(data),
    delete: (id) => supabase.from('profiles').delete().eq('id', id)
  },

  // Blood Requests
  bloodRequests: {
    get: (id) => supabase.from('blood_requests').select('*').eq('id', id).single(),
    getAll: () => supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
    getByUser: (userId) => supabase.from('blood_requests').select('*').eq('requester_id', userId).order('created_at', { ascending: false }),
    getByBloodType: (bloodType) => supabase.from('blood_requests').select('*').eq('blood_type', bloodType).order('created_at', { ascending: false }),
    getUrgent: () => supabase.from('blood_requests').select('*').in('urgency', ['urgent', 'critical']).order('created_at', { ascending: false }),
    create: (data) => supabase.from('blood_requests').insert(data),
    update: (id, data) => supabase.from('blood_requests').update(data).eq('id', id),
    delete: (id) => supabase.from('blood_requests').delete().eq('id', id)
  },

  // Request Responses
  requestResponses: {
    getByRequest: (requestId) => supabase.from('request_responses').select('*, profiles(*)').eq('request_id', requestId),
    getByDonor: (donorId) => supabase.from('request_responses').select('*, blood_requests(*)').eq('donor_id', donorId),
    create: (data) => supabase.from('request_responses').insert(data),
    update: (id, data) => supabase.from('request_responses').update(data).eq('id', id)
  },

  // Blood Banks
  bloodBanks: {
    get: (id) => supabase.from('blood_banks').select('*').eq('id', id).single(),
    getAll: () => supabase.from('blood_banks').select('*'),
    getVerified: () => supabase.from('blood_banks').select('*').eq('verified', true),
    create: (data) => supabase.from('blood_banks').insert(data),
    update: (id, data) => supabase.from('blood_banks').update(data).eq('id', id)
  },

  // Blood Inventory
  bloodInventory: {
    getByBank: (bankId) => supabase.from('blood_inventory').select('*').eq('blood_bank_id', bankId),
    getByBloodType: (bloodType) => supabase.from('blood_inventory').select('*, blood_banks(*)').eq('blood_type', bloodType),
    update: (bankId, bloodType, quantity) => 
      supabase.from('blood_inventory').update({ quantity }).eq('blood_bank_id', bankId).eq('blood_type', bloodType),
    getAll: () => supabase.from('blood_inventory').select('*, blood_banks(*)')
  },

  // Appointments
  appointments: {
    get: (id) => supabase.from('appointments').select('*, blood_banks(*)').eq('id', id).single(),
    getByUser: (userId) => supabase.from('appointments').select('*, blood_banks(*)').eq('user_id', userId).order('scheduled_date', { ascending: true }),
    getUpcoming: (userId) => supabase.from('appointments').select('*, blood_banks(*)').eq('user_id', userId).gte('scheduled_date', new Date().toISOString().split('T')[0]).order('scheduled_date', { ascending: true }),
    create: (data) => supabase.from('appointments').insert(data),
    update: (id, data) => supabase.from('appointments').update(data).eq('id', id),
    delete: (id) => supabase.from('appointments').delete().eq('id', id)
  },

  // Donations
  donations: {
    get: (id) => supabase.from('donations').select('*, blood_banks(*)').eq('id', id).single(),
    getByUser: (userId) => supabase.from('donations').select('*, blood_banks(*)').eq('donor_id', userId).order('donation_date', { ascending: false }),
    create: (data) => supabase.from('donations').insert(data),
    update: (id, data) => supabase.from('donations').update(data).eq('id', id)
  },

  // Donor Availability
  donorAvailability: {
    get: (donorId) => supabase.from('donor_availability').select('*').eq('donor_id', donorId).single(),
    getAll: () => supabase.from('donor_availability').select('*, profiles(*)'),
    getAvailable: () => supabase.from('donor_availability').select('*, profiles(*)').eq('status', 'available'),
    update: (donorId, data) => supabase.from('donor_availability').upsert({ donor_id: donorId, ...data })
  },

  // Messages
  messages: {
    getByUser: (userId) => supabase.from('messages').select('*, sender:sender_id(*), recipient:recipient_id(*)').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order('created_at', { ascending: false }),
    getConversation: (userId1, userId2) => supabase.from('messages').select('*, sender:sender_id(*), recipient:recipient_id(*)').or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`).order('created_at', { ascending: true }),
    create: (data) => supabase.from('messages').insert(data),
    markAsRead: (id) => supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id)
  },

  // Achievements
  achievements: {
    getAll: () => supabase.from('achievements').select('*'),
    getUserAchievements: (userId) => supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId)
  },

  // Notifications
  notifications: {
    getByUser: (userId) => supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    create: (data) => supabase.from('notifications').insert(data),
    markAsRead: (id) => supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id),
    markAllAsRead: (userId) => supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null)
  }
}

// Auth helper functions
export const auth = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  updatePassword: async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  }
}

// Real-time subscriptions
export const subscribe = {
  bloodRequests: (callback) => {
    return supabase
      .channel('blood_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, callback)
      .subscribe()
  },

  messages: (userId, callback) => {
    return supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  notifications: (userId, callback) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

export default supabase
