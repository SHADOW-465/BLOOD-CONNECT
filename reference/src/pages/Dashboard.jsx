import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, Calendar, Users, MapPin, Bell, TrendingUp, 
  Activity, Clock, Award, AlertCircle, Plus, Search
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user, profile } = useAuth()

  const stats = [
    { icon: Heart, label: 'Total Donations', value: profile?.total_donations || 0, color: 'text-primary-600 bg-primary-100' },
    { icon: Users, label: 'Lives Saved', value: (profile?.total_donations || 0) * 3, color: 'text-success-600 bg-success-100' },
    { icon: Calendar, label: 'Next Eligible', value: '45 days', color: 'text-secondary-600 bg-secondary-100' },
    { icon: Award, label: 'Donor Level', value: profile?.total_donations >= 10 ? 'Platinum' : profile?.total_donations >= 5 ? 'Gold' : profile?.total_donations >= 1 ? 'Silver' : 'Bronze', color: 'text-warning-600 bg-warning-100' }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'donation',
      title: 'Blood donation completed',
      description: 'Successfully donated at City General Hospital',
      date: '2 days ago',
      icon: Heart,
      color: 'text-primary-600'
    },
    {
      id: 2,
      type: 'request',
      title: 'Emergency blood request',
      description: 'O+ blood needed urgently at Metro Hospital',
      date: '1 week ago',
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      id: 3,
      type: 'appointment',
      title: 'Appointment scheduled',
      description: 'Next donation appointment booked',
      date: '2 weeks ago',
      icon: Calendar,
      color: 'text-secondary-600'
    }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      title: 'Blood Donation',
      location: 'City General Hospital',
      date: '2024-02-15',
      time: '10:00 AM',
      type: 'donation'
    },
    {
      id: 2,
      title: 'Health Screening',
      location: 'BloodConnect Center',
      date: '2024-02-20',
      time: '2:00 PM',
      type: 'screening'
    }
  ]

  const urgentRequests = [
    {
      id: 1,
      bloodType: 'O-',
      location: 'Metro General Hospital',
      distance: '2.5 km',
      urgency: 'Critical',
      timePosted: '30 min ago'
    },
    {
      id: 2,
      bloodType: 'A+',
      location: 'Children\'s Hospital',
      distance: '5.1 km',
      urgency: 'Urgent',
      timePosted: '2 hours ago'
    },
    {
      id: 3,
      bloodType: 'B+',
      location: 'Regional Medical Center',
      distance: '8.3 km',
      urgency: 'Moderate',
      timePosted: '4 hours ago'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.name || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your blood type: <span className="font-semibold text-primary-600">{profile?.blood_type || 'Not specified'}</span> • 
            Location: <span className="font-medium">{profile?.location || 'Not specified'}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/requests"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <Plus className="h-8 w-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Create Request</span>
                </Link>
                <Link
                  to="/search"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <Search className="h-8 w-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Find Donors</span>
                </Link>
                <Link
                  to="/appointments"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                </Link>
                <Link
                  to="/blood-banks"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <MapPin className="h-8 w-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Blood Banks</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link to="/activity" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Progress */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progress to next milestone</span>
                    <span className="text-gray-600">5/10 donations</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full w-1/2"></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">5 more donations to reach Platinum level</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">15</div>
                    <div className="text-sm text-gray-600">Lives Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-600">45</div>
                    <div className="text-sm text-gray-600">Days to Next Donation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-gray-900">{appointment.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.type === 'donation' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {appointment.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{appointment.location}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {appointment.date} at {appointment.time}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/appointments"
                className="block w-full mt-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg py-3 text-center text-sm text-gray-600 transition-colors"
              >
                Schedule New Appointment
              </Link>
            </div>

            {/* Urgent Blood Requests */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  <span className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    Urgent Requests
                  </span>
                </h2>
                <Link to="/requests" className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {urgentRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {request.bloodType}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.location}</p>
                          <p className="text-xs text-gray-600">{request.distance} away</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.urgency === 'Critical' ? 'bg-red-100 text-red-600' :
                        request.urgency === 'Urgent' ? 'bg-warning-100 text-warning-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {request.urgency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{request.timePosted}</span>
                      <button className="text-xs text-primary-600 hover:text-primary-500 font-medium">
                        Respond
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Status */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eligibility Status</span>
                  <span className="text-sm font-medium text-success-600">Eligible</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Health Check</span>
                  <span className="text-sm text-gray-900">Jan 15, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Check Due</span>
                  <span className="text-sm text-gray-900">Jul 15, 2024</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 py-2 rounded-lg text-sm font-medium transition-colors">
                Schedule Health Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard