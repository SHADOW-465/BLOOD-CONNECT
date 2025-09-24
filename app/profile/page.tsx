"use client"

import { useEffect, useState } from "react"
import { NButton, NCard, NModal, NField, NBadge, NAlert, NList, NListItem, NToggle, NProgress, NStatCard } from "@/components/nui"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { User, MapPin, Phone, Calendar, Heart, FileText, Bell, Settings, Upload } from "lucide-react"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { format } from "date-fns"

type Profile = {
  id: string
  name: string
  phone: string
  blood_type: string
  rh: string
  last_donation_date: string | null
  location_lat: number | null
  location_lng: number | null
  radius_km: number
  availability_status: 'available' | 'unavailable'
  availability_reason: string | null
  medical_notes: string | null
  created_at: string
  updated_at: string
}

type MedicalRecord = {
  id: string
  record_type: string
  title: string
  description: string | null
  date_recorded: string
  doctor_name: string | null
  clinic_name: string | null
  file_url: string | null
}

type DonationCalendar = {
  id: string
  scheduled_date: string
  location: string | null
  status: string
  reminder_sent: boolean
  notes: string | null
}

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [calendar, setCalendar] = useState<DonationCalendar[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    blood_type: "A",
    rh: "+",
    radius_km: 10,
    availability_status: "available" as 'available' | 'unavailable',
    availability_reason: "",
    medical_notes: ""
  })
  const [medicalForm, setMedicalForm] = useState({
    record_type: "health_check",
    title: "",
    description: "",
    date_recorded: "",
    doctor_name: "",
    clinic_name: ""
  })

  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          setUser(session.user)
          await loadProfile(session.user.id)
          await loadMedicalRecords(session.user.id)
          await loadCalendar(session.user.id)
        }
      } catch (error) {
        console.error("Error getting user data:", error)
      } finally {
        setLoading(false)
      }
    }
    getUserData()
  }, [supabase])

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error && error.code !== 'PGRST116') {
        console.error("Error loading profile:", error)
        return
    }

    if (data) {
      setProfile(data)
      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
        blood_type: data.blood_type || "A",
        rh: data.rh || "+",
        radius_km: data.radius_km || 10,
        availability_status: data.availability_status || "available",
        availability_reason: data.availability_reason || "",
        medical_notes: data.medical_notes || ""
      })
    } else {
        await createProfile(userId)
    }
  }

  const createProfile = async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .insert({ id: userId, name: "New User" })

      if (error) {
        console.error("Error creating profile:", error)
      } else {
        await loadProfile(userId)
      }
  }

  const loadMedicalRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("donor_id", userId)
      .order("date_recorded", { ascending: false })

    if (data) {
      setMedicalRecords(data)
    }
  }

  const loadCalendar = async (userId: string) => {
    const { data, error } = await supabase
      .from("donation_calendar")
      .select("*")
      .eq("donor_id", userId)
      .order("scheduled_date", { ascending: true })

    if (data) {
      setCalendar(data)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editForm.name,
          phone: editForm.phone,
          blood_type: editForm.blood_type,
          rh: editForm.rh,
          radius_km: editForm.radius_km,
          availability_status: editForm.availability_status,
          availability_reason: editForm.availability_reason,
          medical_notes: editForm.medical_notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (!error) {
        await loadProfile(user.id)
        setIsEditModalOpen(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicalRecord = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("medical_history")
        .insert({
          donor_id: user.id,
          record_type: medicalForm.record_type,
          title: medicalForm.title,
          description: medicalForm.description,
          date_recorded: medicalForm.date_recorded,
          doctor_name: medicalForm.doctor_name,
          clinic_name: medicalForm.clinic_name
        })

      if (!error) {
        await loadMedicalRecords(user.id)
        setIsMedicalModalOpen(false)
        setMedicalForm({
          record_type: "health_check",
          title: "",
          description: "",
          date_recorded: "",
          doctor_name: "",
          clinic_name: ""
        })
      }
    } catch (error) {
      console.error("Error adding medical record:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'donation': return 'success'
      case 'health_check': return 'info'
      case 'vaccination': return 'warning'
      case 'medication': return 'error'
      case 'allergy': return 'error'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info'
      case 'confirmed': return 'success'
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e74c3c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
            <p className="text-lg text-gray-700">Unable to load profile.</p>
            <p className="text-sm text-gray-500">There might be an issue with your account or the network. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#e74c3c] mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your donor profile and medical information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <NCard className="p-6 mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#e74c3c] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-1">{profile.name || "Anonymous Donor"}</h2>
                <div className="text-2xl font-bold text-[#e74c3c] mb-2">
                  {profile.blood_type}{profile.rh}
                </div>
                <NBadge variant={profile.availability_status === 'available' ? 'success' : 'error'}>
                  {profile.availability_status}
                </NBadge>
              </div>
            </NCard>

            <NCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <NButton
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full"
                >
                  Edit Profile
                </NButton>
                <NButton
                  onClick={() => setIsMedicalModalOpen(true)}
                  className="w-full"
                >
                  Add Medical Record
                </NButton>
                <NButton
                  onClick={() => window.location.href = '/schedule'}
                  className="w-full"
                >
                  Schedule Donation
                </NButton>
              </div>
            </NCard>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <NCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-gray-900">{profile.name || "Not provided"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone || "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <div className="text-gray-900">{profile.blood_type}{profile.rh}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Radius</label>
                  <div className="text-gray-900">{profile.radius_km} km</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
                  <div className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {profile.last_donation_date
                      ? format(new Date(profile.last_donation_date), "MMM dd, yyyy")
                      : "Never"
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <div className="flex items-center gap-2">
                    <NBadge variant={profile.availability_status === 'available' ? 'success' : 'error'}>
                      {profile.availability_status}
                    </NBadge>
                    {profile.availability_reason && (
                      <span className="text-sm text-gray-500">({profile.availability_reason})</span>
                    )}
                  </div>
                </div>
              </div>
              {profile.medical_notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {profile.medical_notes}
                  </div>
                </div>
              )}
            </NCard>

            {/* Medical History */}
            <NCard className="p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Medical History
              </h3>
              {medicalRecords.length > 0 ? (
                <NList>
                  {medicalRecords.map((record) => (
                    <NListItem key={record.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{record.title}</h4>
                            <NBadge variant={getRecordTypeColor(record.record_type)}>
                              {record.record_type.replace('_', ' ')}
                            </NBadge>
                          </div>
                          {record.description && (
                            <p className="text-sm text-gray-600 mb-1">{record.description}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            {format(new Date(record.date_recorded), "MMM dd, yyyy")}
                            {record.doctor_name && ` • Dr. ${record.doctor_name}`}
                            {record.clinic_name && ` • ${record.clinic_name}`}
                          </div>
                        </div>
                      </div>
                    </NListItem>
                  ))}
                </NList>
              ) : (
                <NAlert type="info">
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No medical records yet</p>
                    <p className="text-sm text-gray-500">Add your first medical record to get started</p>
                  </div>
                </NAlert>
              )}
            </NCard>

            {/* Donation Calendar */}
            <NCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Donations
              </h3>
              {calendar.length > 0 ? (
                <NList>
                  {calendar.map((item) => (
                    <NListItem key={item.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {format(new Date(item.scheduled_date), "MMM dd, yyyy")}
                          </div>
                          {item.location && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.location}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </div>
                        <NBadge variant={getStatusColor(item.status)}>
                          {item.status}
                        </NBadge>
                      </div>
                    </NListItem>
                  ))}
                </NList>
              ) : (
                <NAlert type="info">
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No scheduled donations</p>
                    <p className="text-sm text-gray-500">Schedule your next donation to help save lives</p>
                  </div>
                </NAlert>
              )}
            </NCard>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <NModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl font-semibold text-[#e74c3c] mb-4">Edit Profile</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <NField
              label="Name"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <NField
              label="Phone"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NField
              label="Blood Type"
              as="select"
              value={editForm.blood_type}
              onChange={(e) => setEditForm({ ...editForm, blood_type: e.target.value })}
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </NField>
            <NField
              label="Rh Factor"
              as="select"
              value={editForm.rh}
              onChange={(e) => setEditForm({ ...editForm, rh: e.target.value })}
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </NField>
          </div>

          <NField
            label="Notification Radius (km)"
            type="number"
            value={editForm.radius_km}
            onChange={(e) => setEditForm({ ...editForm, radius_km: parseInt(e.target.value) || 10 })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
            <NToggle
              checked={editForm.availability_status === 'available'}
              onChange={(checked) => setEditForm({
                ...editForm,
                availability_status: checked ? 'available' : 'unavailable'
              })}
              label={editForm.availability_status === 'available' ? 'Available' : 'Unavailable'}
            />
          </div>

          {editForm.availability_status === 'unavailable' && (
            <NField
              label="Reason for unavailability"
              type="text"
              value={editForm.availability_reason}
              onChange={(e) => setEditForm({ ...editForm, availability_reason: e.target.value })}
              placeholder="e.g., Recent surgery, medication, travel"
            />
          )}

          <NField
            label="Medical Notes"
            as="textarea"
            value={editForm.medical_notes}
            onChange={(e) => setEditForm({ ...editForm, medical_notes: e.target.value })}
            placeholder="Any relevant medical information..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <NButton
            onClick={() => setIsEditModalOpen(false)}
            className="bg-gray-200 text-gray-700"
          >
            Cancel
          </NButton>
          <NButton
            onClick={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </NButton>
        </div>
      </NModal>

      {/* Add Medical Record Modal */}
      <NModal isOpen={isMedicalModalOpen} onClose={() => setIsMedicalModalOpen(false)}>
        <h2 className="text-xl font-semibold text-[#e74c3c] mb-4">Add Medical Record</h2>

        <div className="space-y-4">
          <NField
            label="Record Type"
            as="select"
            value={medicalForm.record_type}
            onChange={(e) => setMedicalForm({ ...medicalForm, record_type: e.target.value })}
          >
            <option value="health_check">Health Check</option>
            <option value="donation">Blood Donation</option>
            <option value="vaccination">Vaccination</option>
            <option value="medication">Medication</option>
            <option value="allergy">Allergy</option>
          </NField>

          <NField
            label="Title"
            type="text"
            value={medicalForm.title}
            onChange={(e) => setMedicalForm({ ...medicalForm, title: e.target.value })}
            placeholder="e.g., Annual Health Check"
          />

          <NField
            label="Date"
            type="date"
            value={medicalForm.date_recorded}
            onChange={(e) => setMedicalForm({ ...medicalForm, date_recorded: e.target.value })}
          />

          <NField
            label="Description"
            as="textarea"
            value={medicalForm.description}
            onChange={(e) => setMedicalForm({ ...medicalForm, description: e.target.value })}
            placeholder="Details about this medical record..."
          />

          <div className="grid grid-cols-2 gap-4">
            <NField
              label="Doctor Name"
              type="text"
              value={medicalForm.doctor_name}
              onChange={(e) => setMedicalForm({ ...medicalForm, doctor_name: e.target.value })}
              placeholder="Dr. Smith"
            />
            <NField
              label="Clinic/Hospital"
              type="text"
              value={medicalForm.clinic_name}
              onChange={(e) => setMedicalForm({ ...medicalForm, clinic_name: e.target.value })}
              placeholder="City Hospital"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <NButton
            onClick={() => setIsMedicalModalOpen(false)}
            className="bg-gray-200 text-gray-700"
          >
            Cancel
          </NButton>
          <NButton
            onClick={handleAddMedicalRecord}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Record"}
          </NButton>
        </div>
      </NModal>
    </div>
  )
}
