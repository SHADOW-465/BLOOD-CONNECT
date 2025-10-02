import React, { useState } from 'react'
import { Edit3, Save, X, Camera, MapPin, Phone, Mail, Calendar, Heart, Award, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    blood_type: profile?.blood_type || '',
    weight: profile?.weight || '',
    medical_conditions: profile?.medical_conditions || '',
    emergency_contact: profile?.emergency_contact || ''
  })

  const handleSave = async () => {
    try {
      await updateProfile(editData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      blood_type: profile?.blood_type || '',
      weight: profile?.weight || '',
      medical_conditions: profile?.medical_conditions || '',
      emergency_contact: profile?.emergency_contact || ''
    })
    setIsEditing(false)
  }

  const donationHistory = [
    { id: 1, date: '2024-01-15', location: 'City General Hospital', status: 'completed', units: 1 },
    { id: 2, date: '2023-10-20', location: 'BloodConnect Center', status: 'completed', units: 1 },
    { id: 3, date: '2023-07-05', location: 'Metro Medical', status: 'completed', units: 1 },
    { id: 4, date: '2023-03-18', location: 'Regional Hospital', status: 'completed', units: 1 },
    { id: 5, date: '2022-12-10', location: 'Community Center', status: 'completed', units: 1 }
  ]

  const achievements = [
    { id: 1, title: 'First Donation', description: 'Completed your first blood donation', date: '2022-12-10', icon: Heart },
    { id: 2, title: 'Regular Donor', description: 'Donated 5 times', date: '2023-07-05', icon: Award },
    { id: 3, title: 'Life Saver', description: 'Helped save 15 lives', date: '2024-01-15', icon: Heart },
    { id: 4, title: 'Verified Donor', description: 'Profile verified by BloodConnect', date: '2023-01-01', icon: Award }
  ]

  const nextEligibleDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 text-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-8 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-gray-600">{profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)} • {profile?.blood_type}</p>
              
              {profile?.verified ? (
                <div className="mt-3 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Verified Donor
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Verification Pending
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{profile?.total_donations || 0}</div>
                  <div className="text-sm text-gray-600">Donations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">{(profile?.total_donations || 0) * 3}</div>
                  <div className="text-sm text-gray-600">Lives Saved</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Next Eligible Donation</h3>
                <p className="text-blue-700 text-sm">{nextEligibleDate}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center text-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center text-sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-outline flex items-center text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <span>{profile?.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  {isEditing ? (
                    <select
                      value={editData.blood_type}
                      onChange={(e) => setEditData({ ...editData, blood_type: e.target.value })}
                      className="input-field"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-gray-900">{profile?.blood_type}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{profile?.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{profile?.phone}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{profile?.location}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.weight}
                      onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="text-gray-900">{profile?.weight || 'Not specified'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.emergency_contact}
                      onChange={(e) => setEditData({ ...editData, emergency_contact: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="text-gray-900">{profile?.emergency_contact || 'Not specified'}</div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  {isEditing ? (
                    <textarea
                      value={editData.medical_conditions}
                      onChange={(e) => setEditData({ ...editData, medical_conditions: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  ) : (
                    <div className="text-gray-900">{profile?.medical_conditions || 'None specified'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Donation History */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
              <div className="space-y-4">
                {donationHistory.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{donation.location}</div>
                        <div className="text-sm text-gray-600">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(donation.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{donation.units} unit</div>
                      <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {donation.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="h-10 w-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                      <achievement.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile