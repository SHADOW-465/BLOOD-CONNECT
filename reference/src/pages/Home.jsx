import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, Calendar, Shield, Users, MapPin, Clock, Award } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Search,
      title: 'Find Compatible Donors',
      description: 'Advanced matching system to find blood donors compatible with your needs'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments with donors and blood banks seamlessly'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Medical-grade privacy protection and verification processes'
    },
    {
      icon: MapPin,
      title: 'Location-Based',
      description: 'Find nearby donors and blood banks in your area'
    },
    {
      icon: Clock,
      title: '24/7 Emergency',
      description: 'Round-the-clock support for emergency blood requests'
    },
    {
      icon: Award,
      title: 'Verified Network',
      description: 'All donors are medically verified and regularly screened'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Donors' },
    { number: '5,000+', label: 'Lives Saved' },
    { number: '200+', label: 'Partner Hospitals' },
    { number: '50+', label: 'Cities Covered' }
  ]

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Save Lives Through
                <span className="text-primary-200"> Blood Donation</span>
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Connect with verified blood donors in your area. Find compatible matches instantly and help save lives in your community.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-center"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/search"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200 text-center"
                >
                  Find Blood Now
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Heart className="w-32 h-32 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-success-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BloodConnect Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides the most comprehensive and secure way to connect blood donors with those in need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 hover:shadow-lg transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Blood Types Welcome
            </h2>
            <p className="text-xl text-gray-600">
              Every blood type is precious and needed. Join our community of life-savers today.
            </p>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto">
            {bloodTypes.map((type) => (
              <div key={type} className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-2">
                  {type}
                </div>
                <p className="text-sm text-gray-600">Type {type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of donors who have already made a difference. Your donation can save up to 3 lives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Register as Donor
            </Link>
            <Link
              to="/search"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Find Blood Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home