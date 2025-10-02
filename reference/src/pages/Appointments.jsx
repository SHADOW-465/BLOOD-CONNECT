import React, { useState } from 'react'
import { Plus, Calendar, Clock, MapPin, User, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Appointments = () => {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [newAppointment, setNewAppointment] = useState({
    type: 'donation',
    date: '',
    time: '',
    location: '',
    bloodBank: '',
    notes: ''
  })

  const mockAppointments = [
    {
      id: 1,
      type: 'donation',
      title: 'Blood Donation',
      date: '2024-02-20',
      time: '10:00',
      location: 'Metro General Blood Bank',
      address: '123 Medical Center Dr, New York, NY',
      contact: '+1 (555) 123-4567',
      status: 'confirmed',
      notes: 'Regular donation appointment',
      bloodType: 'O+'
    },
    {
      id: 2,
      type: 'screening',
      title: 'Health Screening',
      date: '2024-02-25',
      time: '14:30',
      location: 'City Community Health Center',
      address: '456 Health St, Brooklyn, NY',
      contact: '+1 (555) 987-6543',
      status: 'pending',
      notes: 'Annual health check for donors',
      bloodType: 'O+'
    },
    {
      id: 3,
      type: 'donation',
      title: 'Platelet Donation',
      date: '2024-02-15',
      time: '09:00',
      location: 'Regional Medical Center',
      address: '789 Hospital Ave, Queens, NY',
      contact: '+1 (555) 456-7890',
      status: 'completed',
      notes: 'Emergency platelet donation',
      bloodType: 'O+'
    },
    {
      id: 4,
      type: 'donation',
      title: 'Blood Donation',
      date: '2024-02-10',
      time: '11:00',
      location: 'Metro General Blood Bank',
      address: '123 Medical Center Dr, New York, NY',
      contact: '+1 (555) 123-4567',
      status: 'cancelled',
      notes: 'Cancelled due to illness',
      bloodType: 'O+'
    }
  ]

  const bloodBanks = [
    'Metro General Blood Bank',
    'City Community Blood Center',
    'Regional Medical Blood Services',
    'Downtown Health Center',
    'University Medical Center'
  ]

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusIcons = {
    confirmed: CheckCircle,
    pending: AlertCircle,
    completed: CheckCircle,
    cancelled: XCircle
  }

  const handleSubmitAppointment = (e) => {
    e.preventDefault()
    console.log('Creating appointment:', newAppointment)
    setShowCreateModal(false)
    setNewAppointment({
      type: 'donation',
      date: '',
      time: '',
      location: '',
      bloodBank: '',
      notes: ''
    })
  }

  const filterAppointments = (appointments) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed')
      case 'past':
        return appointments.filter(apt => apt.date < today || apt.status === 'completed')
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled')
      default:
        return appointments
    }
  }

  const getAppointmentDateTime = (date, time) => {
    return new Date(`${date}T${time}:00`)
  }

  const formatDateTime = (date, time) => {
    const dateTime = getAppointmentDateTime(date, time)
    return {
      date: dateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: dateTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">Manage your donation and screening appointments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Appointment
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'past'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled
              </button>
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filterAppointments(mockAppointments).map((appointment) => {
            const StatusIcon = statusIcons[appointment.status]
            const formatted = formatDateTime(appointment.date, appointment.time)
            
            return (
              <div key={appointment.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      appointment.type === 'donation' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]} flex items-center`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {appointment.type === 'donation' && (
                          <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {appointment.bloodType}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatted.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatted.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{appointment.location}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{appointment.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{appointment.contact}</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === 'confirmed' && (
                      <>
                        <button className="btn-outline text-sm">Reschedule</button>
                        <button className="text-red-600 hover:text-red-700 text-sm">Cancel</button>
                      </>
                    )}
                    {appointment.status === 'pending' && (
                      <button className="btn-primary text-sm">Confirm</button>
                    )}
                    {appointment.status === 'completed' && (
                      <button className="btn-outline text-sm">Book Again</button>
                    )}
                    {appointment.status === 'cancelled' && (
                      <button className="btn-outline text-sm">Rebook</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filterAppointments(mockAppointments).length === 0 && (
          <div className="card p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} appointments
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming appointments." 
                : `You don't have any ${activeTab} appointments to show.`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Schedule Your First Appointment
            </button>
          </div>
        )}

        {/* Create Appointment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmitAppointment} className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Appointment</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type *
                    </label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="donation">Blood Donation</option>
                      <option value="screening">Health Screening</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Bank/Location *
                    </label>
                    <select
                      value={newAppointment.bloodBank}
                      onChange={(e) => setNewAppointment({ ...newAppointment, bloodBank: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select a blood bank</option>
                      {bloodBanks.map((bank, index) => (
                        <option key={index} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Any special requests or notes..."
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
                    Schedule Appointment
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

export default Appointments