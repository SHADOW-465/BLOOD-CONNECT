import React, { useState } from 'react'
import { Search, MapPin, Phone, Clock, AlertCircle, CheckCircle, Building2 } from 'lucide-react'

const BloodBanks = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    bloodType: '',
    radius: '10'
  })

  const mockBloodBanks = [
    {
      id: 1,
      name: 'Metro General Blood Bank',
      address: '123 Medical Center Dr, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'info@metrogeneralbb.org',
      hours: '24/7',
      distance: '2.1 km',
      verified: true,
      inventory: {
        'A+': 45, 'A-': 12, 'B+': 23, 'B-': 8,
        'AB+': 15, 'AB-': 5, 'O+': 67, 'O-': 18
      },
      services: ['Blood Collection', 'Platelet Donation', 'Plasma Donation', 'Emergency Supply'],
      rating: 4.8,
      lastUpdated: '2024-02-14T10:30:00'
    },
    {
      id: 2,
      name: 'City Community Blood Center',
      address: '456 Health St, Brooklyn, NY 11201',
      phone: '+1 (555) 987-6543',
      email: 'contact@citycommunitybc.org',
      hours: 'Mon-Sat: 8AM-6PM',
      distance: '4.3 km',
      verified: true,
      inventory: {
        'A+': 23, 'A-': 6, 'B+': 34, 'B-': 12,
        'AB+': 9, 'AB-': 3, 'O+': 41, 'O-': 14
      },
      services: ['Blood Collection', 'Community Drives', 'Mobile Units'],
      rating: 4.6,
      lastUpdated: '2024-02-14T08:15:00'
    },
    {
      id: 3,
      name: 'Regional Medical Blood Services',
      address: '789 Hospital Ave, Queens, NY 11101',
      phone: '+1 (555) 456-7890',
      email: 'services@regionalmedbs.com',
      hours: 'Mon-Fri: 7AM-7PM, Sat: 8AM-4PM',
      distance: '6.8 km',
      verified: false,
      inventory: {
        'A+': 18, 'A-': 4, 'B+': 15, 'B-': 7,
        'AB+': 6, 'AB-': 2, 'O+': 28, 'O-': 9
      },
      services: ['Blood Collection', 'Research Programs', 'Training'],
      rating: 4.4,
      lastUpdated: '2024-02-13T16:45:00'
    }
  ]

  const getStockLevel = (quantity) => {
    if (quantity >= 30) return { level: 'high', color: 'text-green-600 bg-green-100', text: 'Good Stock' }
    if (quantity >= 15) return { level: 'medium', color: 'text-yellow-600 bg-yellow-100', text: 'Low Stock' }
    return { level: 'low', color: 'text-red-600 bg-red-100', text: 'Critical' }
  }

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blood Banks</h1>
          <p className="text-gray-600 mt-2">Find blood banks and check blood availability in your area</p>
        </div>

        {/* Search Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city, zip code, or address"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                value={searchFilters.bloodType}
                onChange={(e) => setSearchFilters({ ...searchFilters, bloodType: e.target.value })}
                className="input-field"
              >
                <option value="">All Types</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (km)
              </label>
              <select
                value={searchFilters.radius}
                onChange={(e) => setSearchFilters({ ...searchFilters, radius: e.target.value })}
                className="input-field"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <button className="btn-primary flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Blood Banks
            </button>
            <p className="text-sm text-gray-600">
              {mockBloodBanks.length} blood bank{mockBloodBanks.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Blood Bank Cards */}
        <div className="space-y-6">
          {mockBloodBanks.map((bank) => (
            <div key={bank.id} className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <div className="h-16 w-16 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      {bank.name}
                      {bank.verified && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{bank.address}</span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">{bank.distance}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="text-sm">{bank.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{bank.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-500 mb-1">
                    <span className="text-lg font-semibold">{bank.rating}</span>
                    <span className="ml-1">⭐</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(bank.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Blood Inventory */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Blood Inventory</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {bloodTypes.map((type) => {
                    const quantity = bank.inventory[type]
                    const stock = getStockLevel(quantity)
                    return (
                      <div key={type} className="text-center">
                        <div className="bg-primary-600 text-white rounded-lg p-3 mb-2">
                          <div className="font-bold text-lg">{type}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{quantity} units</div>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${stock.color}`}>
                          {stock.text}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {bank.services.map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Critical Stock Alert */}
              {Object.entries(bank.inventory).some(([, quantity]) => quantity < 10) && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 text-sm font-medium">
                      Critical stock levels for some blood types. Consider donating if eligible.
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary">
                  Schedule Donation
                </button>
                <button className="btn-outline">
                  Get Directions
                </button>
                <button className="btn-outline">
                  Contact Bank
                </button>
                <button className="btn-outline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Blood Need</h3>
              <p className="text-red-800 mb-4">
                Several blood banks in your area are running low on O- and B- blood types. 
                Your donation could save lives today.
              </p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Find Emergency Donation Centers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BloodBanks