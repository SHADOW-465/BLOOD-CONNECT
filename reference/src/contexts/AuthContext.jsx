import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, auth, db } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profileData, error } = await db.profiles.get(authUser.id)
      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      
      setUser(authUser)
      setProfile(profileData)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      
      if (data.user) {
        await loadUserProfile(data.user)
      }
      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, userData) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signUp(email, password, userData)
      if (error) throw error
      
      // Create profile
      if (data.user) {
        const { error: profileError } = await db.profiles.create({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          blood_type: userData.bloodType,
          date_of_birth: userData.dateOfBirth,
          location: userData.location,
          weight: userData.weight,
          role: userData.role,
          medical_conditions: userData.medicalConditions,
          emergency_contact: userData.emergencyContact,
          last_donation_date: userData.lastDonation
        })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        } else {
          await loadUserProfile(data.user)
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Registration error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (updatedData) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const { error } = await db.profiles.update(user.id, updatedData)
      if (error) throw error
      
      // Reload profile
      await loadUserProfile(user)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await auth.resetPassword(email)
      return { data, error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    }
  }

  const updatePassword = async (password) => {
    try {
      const { data, error } = await auth.updatePassword(password)
      return { data, error }
    } catch (error) {
      console.error('Update password error:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    updatePassword,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}