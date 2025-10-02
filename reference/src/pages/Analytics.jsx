import React, { useState } from 'react'
import { TrendingUp, Users, Heart, Calendar, Award, MapPin, BarChart3, PieChart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Analytics = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('6months')

  const stats = [
    {
      title: 'Total Donations',
      value: user?.totalDonations || 5,
      change: '+2 from last period',
      icon: Heart,
      color: 'text-primary-600 bg-primary-100'
    },
    {
      title: 'Lives Saved',
      value: (user?.totalDonations || 5) * 3,
      change: '+6 from last period',
      icon: Users,
      color: 'text-success-600 bg-success-100'
    },
    {
      title: 'Total Volume (L)',
      value: ((user?.totalDonations || 5) * 0.45).toFixed(1),
      change: '+0.9L from last period',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Donation Streak',
      value: '3 months',
      change: 'Current streak',
      icon: Award,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ]

  const donationHistory = [
    { month: 'Aug 2023', donations: 1, volume: 0.45 },
    { month: 'Oct 2023', donations: 1, volume: 0.45 },
    { month: 'Dec 2023', donations: 1, volume: 0.45 },
    { month: 'Feb 2024', donations: 2, volume: 0.9 },
  ]

  const impactData = [
    { category: 'Emergency Surgeries', helped: 8, percentage: 40 },
    { category: 'Cancer Patients', helped: 4, percentage: 20 },
    { category: 'Accident Victims', helped: 6, percentage: 30 },
    { category: 'Blood Disorders', helped: 2, percentage: 10 }
  ]

  const locationData = [
    { location: 'Metro General Hospital', donations: 2, distance: '2.1 km' },
    { location: 'City Community Center', donations: 2, distance: '4.3 km' },
    { location: 'Regional Medical Center', donations: 1, distance: '6.8 km' }
  ]

  const achievements = [
    { title: 'First Time Donor', date: '2023-08-15', icon: '🎉' },
    { title: 'Regular Donor', date: '2023-12-10', icon: '⭐' },
    { title: 'Life Saver', date: '2024-02-01', icon: '💝' },
    { title: 'Community Hero', date: '2024-02-14', icon: '🏆' }
  ]

  const nextEligibleDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your donation impact and statistics</p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field"
            >
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donation Timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Donation Timeline</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {donationHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.month}</p>
                      <p className="text-sm text-gray-600">{item.volume}L donated</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.donations}</p>
                    <p className="text-sm text-gray-600">donation{item.donations > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Breakdown */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Impact Breakdown</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {impactData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.helped} people</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donation Locations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Donation Locations</h3>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{location.location}</p>
                    <p className="text-sm text-gray-600">{location.distance} away</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">{location.donations}</p>
                    <p className="text-sm text-gray-600">visits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Donation Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Next Donation</h3>
            <div className="text-center">
              <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10" />
              </div>
              <p className="text-sm text-gray-600 mb-2">You're eligible to donate again on:</p>
              <p className="text-xl font-bold text-gray-900 mb-4">
                {nextEligibleDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <button className="btn-primary">
                Schedule Next Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="card p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Health Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Eligibility</span>
                <span className="text-green-600 font-medium">Eligible</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Screening</span>
                <span className="text-gray-900">Feb 1, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Screening</span>
                <span className="text-gray-900">Aug 1, 2024</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Donation Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average per Year</span>
                <span className="text-gray-900">3.2 donations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recovery Time</span>
                <span className="text-gray-900">56 days avg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="text-green-600 font-medium">100%</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Community Impact</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Local Rank</span>
                <span className="text-primary-600 font-medium">#47 in NYC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referrals</span>
                <span className="text-gray-900">3 donors</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impact Score</span>
                <span className="text-yellow-600 font-medium">⭐ 4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics