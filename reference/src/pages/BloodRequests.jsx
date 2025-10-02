import React, { useState, useEffect } from 'react'
import { Plus, AlertCircle, Clock, CheckCircle, User, MapPin, Calendar, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'

const BloodRequests = () => {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('my-requests')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    units: 1,
    urgency: 'moderate',
    location: '',
    hospital: '',
    patientName: '',
    contactPhone: '',
    notes: '',
    requiredBy: ''
  })

  // Load requests from Supabase
  useEffect(() => {
    loadRequests()
  }, [activeTab, user])

  const loadRequests = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      let data, error
      
      switch (activeTab) {
        case 'my-requests':
          ({ data, error } = await db.bloodRequests.getByUser(user.id))
          break
        case 'urgent':
          ({ data, error } = await db.bloodRequests.getUrgent())
          break
        default:
          ({ data, error } = await db.bloodRequests.getAll())
      }
      
      if (error) {
        console.error('Error loading requests:', error)
      } else {
        // Add isOwner property to each request
        const requestsWithOwner = data?.map(request => ({
          ...request,
          isOwner: request.requester_id === user.id
        })) || []
        setRequests(requestsWithOwner)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800',
    urgent: 'bg-orange-100 text-orange-800',
    moderate: 'bg-yellow-100 text-yellow-800'
  }

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    fulfilled: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800'
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to create a request')
      return
    }
    
    try {
      const requestData = {
        requester_id: user.id,
        blood_type: newRequest.bloodType,
        units_required: newRequest.units,
        urgency: newRequest.urgency,
        patient_name: newRequest.patientName,
        contact_phone: newRequest.contactPhone,
        hospital_name: newRequest.hospital,
        location: newRequest.location,
        notes: newRequest.notes,
        required_by: newRequest.requiredBy
      }
      
      const { data, error } = await db.bloodRequests.create(requestData)
      
      if (error) {
        console.error('Error creating request:', error)
        alert('Failed to create request. Please try again.')
      } else {
        setShowCreateModal(false)
        setNewRequest({
          bloodType: '',
          units: 1,
          urgency: 'moderate',
          location: '',
          hospital: '',
          patientName: '',
          contactPhone: '',
          notes: '',
          requiredBy: ''
        })
        // Reload requests
        loadRequests()
      }
    } catch (error) {
      console.error('Error creating request:', error)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const isUrgent = (requiredBy) => {
    const now = new Date()
    const required = new Date(requiredBy)
    const hoursUntil = (required - now) / (1000 * 60 * 60)
    return hoursUntil <= 24
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
            <p className="text-gray-600 mt-2">Manage and respond to blood donation requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Request
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('all-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setActiveTab('urgent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'urgent'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Urgent
              </button>
            </nav>
          </div>
        </div>

        {/* Request Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'my-requests' 
                  ? "You haven't created any blood requests yet." 
                  : "No blood requests match your current filters."}
              </p>
              {activeTab === 'my-requests' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Request
                </button>
              )}
            </div>
          ) : (
            requests.map((request) => (
            <div key={request.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {request.blood_type}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[request.urgency]}`}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {isUrgent(request.required_by) && (
                        <span className="flex items-center text-red-600 text-xs font-medium">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Time Critical
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.units_required} unit{request.units_required > 1 ? 's' : ''} of {request.blood_type} needed
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {request.responses} response{request.responses !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">{request.patient_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{request.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{request.contact_phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">Required by: {formatDateTime(request.required_by)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">Posted: {formatDateTime(request.created_at)}</span>
                  </div>
                </div>
              </div>

              {request.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{request.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {!request.isOwner && request.status === 'active' && (
                    <button className="btn-primary">
                      Respond to Request
                    </button>
                  )}
                  {request.isOwner && (
                    <button className="btn-outline">
                      View Responses
                    </button>
                  )}
                  <button className="btn-outline">
                    Share Request
                  </button>
                </div>
                {request.status === 'fulfilled' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Request Fulfilled</span>
                  </div>
                )}
              </div>
            </div>
            ))
          )}
        </div>

        {/* Create Request Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmitRequest} className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Blood Request</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type *
                    </label>
                    <select
                      value={newRequest.bloodType}
                      onChange={(e) => setNewRequest({ ...newRequest, bloodType: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select blood type</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units Required *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRequest.units}
                      onChange={(e) => setNewRequest({ ...newRequest, units: parseInt(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency *
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="moderate">Moderate</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required By *
                    </label>
                    <input
                      type="datetime-local"
                      value={newRequest.requiredBy}
                      onChange={(e) => setNewRequest({ ...newRequest, requiredBy: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={newRequest.contactPhone}
                      onChange={(e) => setNewRequest({ ...newRequest, contactPhone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital/Location *
                    </label>
                    <input
                      type="text"
                      value={newRequest.location}
                      onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                      className="input-field"
                      placeholder="Hospital name and address"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Any additional information about the request..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BloodRequests