import React, { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Heart, Phone, Mail, Star } from 'lucide-react'

const DonorSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    bloodType: '',
    location: '',
    availability: 'all',
    distance: '10'
  })
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock donor data
  const mockDonors = [
    {
      id: 1,
      name: 'Sarah Johnson',
      bloodType: 'O+',
      location: 'New York, NY',
      distance: '2.3 km',
      rating: 4.8,
      donations: 12,
      lastDonation: '2024-01-15',
      availability: 'available',
      phone: '+1 (555) 123-4567',
      email: 'sarah.j@email.com',
      verified: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      bloodType: 'A+',
      location: 'Brooklyn, NY',
      distance: '5.1 km',
      rating: 4.9,
      donations: 8,
      lastDonation: '2024-02-01',
      availability: 'available',
      phone: '+1 (555) 987-6543',
      email: 'michael.c@email.com',
      verified: true
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      bloodType: 'B-',
      location: 'Queens, NY',
      distance: '7.8 km',
      rating: 4.7,
      donations: 15,
      lastDonation: '2023-12-10',
      availability: 'busy',
      phone: '+1 (555) 456-7890',
      email: 'emma.r@email.com',
      verified: true
    },
    {
      id: 4,
      name: 'David Wilson',
      bloodType: 'AB+',
      location: 'Manhattan, NY',
      distance: '3.5 km',
      rating: 4.6,
      donations: 6,
      lastDonation: '2024-01-28',
      availability: 'available',
      phone: '+1 (555) 321-0987',
      email: 'david.w@email.com',
      verified: false
    }
  ]

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setDonors(mockDonors.filter(donor => {
        if (searchFilters.bloodType && donor.bloodType !== searchFilters.bloodType) return false
        if (searchFilters.availability !== 'all' && donor.availability !== searchFilters.availability) return false
        return true
      }))
      setLoading(false)
    }, 1000)
  }, [searchFilters])

  const handleSearch = () => {
    setLoading(true)
    setTimeout(() => {
      setDonors(mockDonors.filter(donor => {
        if (searchFilters.bloodType && donor.bloodType !== searchFilters.bloodType) return false
        if (searchFilters.availability !== 'all' && donor.availability !== searchFilters.availability) return false
        return true
      }))
      setLoading(false)
    }, 1000)
  }

  const handleContact = (donor) => {
    alert(`Contacting ${donor.name}...`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Blood Donors</h1>
          <p className="text-gray-600 mt-2">Search for verified blood donors in your area</p>
        </div>

        {/* Search Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city or zip code"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={searchFilters.availability}
                onChange={(e) => setSearchFilters({ ...searchFilters, availability: e.target.value })}
                className="input-field"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (km)
              </label>
              <select
                value={searchFilters.distance}
                onChange={(e) => setSearchFilters({ ...searchFilters, distance: e.target.value })}
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
            <button
              onClick={handleSearch}
              className="btn-primary flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Donors
            </button>
            <p className="text-sm text-gray-600">
              {donors.length} donor{donors.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for donors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor) => (
              <div key={donor.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {donor.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{donor.rating}</span>
                        {donor.verified && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                      {donor.bloodType}
                    </div>
                    <div className={`mt-2 px-2 py-1 rounded-full text-xs ${
                      donor.availability === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {donor.availability}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {donor.location} • {donor.distance}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 mr-2" />
                    {donor.donations} donations
                  </div>
                  <div className="text-sm text-gray-600">
                    Last donation: {new Date(donor.lastDonation).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContact(donor)}
                    className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                  <button
                    onClick={() => handleContact(donor)}
                    className="flex-1 btn-outline text-sm py-2 flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {donors.length === 0 && !loading && (
          <div className="card p-8 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No donors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search filters to find more donors</p>
            <button
              onClick={() => setSearchFilters({ bloodType: '', location: '', availability: 'all', distance: '10' })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorSearch