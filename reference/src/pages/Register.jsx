import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, MapPin, Droplets, Calendar, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodType: '',
    dateOfBirth: '',
    location: '',
    role: 'donor',
    weight: '',
    lastDonation: '',
    medicalConditions: '',
    emergencyContact: ''
  })
  const [errors, setErrors] = useState({})
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.location) newErrors.location = 'Location is required'
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bloodType: formData.bloodType,
          role: formData.role,
          location: formData.location,
          dateOfBirth: formData.dateOfBirth,
          weight: formData.weight,
          lastDonation: formData.lastDonation,
          medicalConditions: formData.medicalConditions,
          emergencyContact: formData.emergencyContact
        }
        
        const { data, error } = await register(formData.email, formData.password, userData)
        
        if (error) {
          setErrors({ general: error.message })
        } else {
          navigate('/dashboard')
        }
      } catch (error) {
        setErrors({ general: 'An unexpected error occurred. Please try again.' })
      }
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join BloodConnect Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Create a password"
                    />
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="City, State"
                    />
                  </div>
                  {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                    Blood Type *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Droplets className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.bloodType ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select blood type</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodType && <p className="mt-2 text-sm text-red-600">{errors.bloodType}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Enter weight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="lastDonation" className="block text-sm font-medium text-gray-700">
                    Last Donation Date (if applicable)
                  </label>
                  <input
                    id="lastDonation"
                    name="lastDonation"
                    type="date"
                    value={formData.lastDonation}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="text"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Name and phone number"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700">
                  Medical Conditions (optional)
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  rows={3}
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="List any relevant medical conditions or medications"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="donor"
                    checked={formData.role === 'donor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg ${formData.role === 'donor' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                      <h4 className="font-medium">Donor</h4>
                      <p className="text-sm text-gray-600">I want to donate blood</p>
                    </div>
                  </div>
                </label>

                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="recipient"
                    checked={formData.role === 'recipient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg ${formData.role === 'recipient' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                      <h4 className="font-medium">Recipient</h4>
                      <p className="text-sm text-gray-600">I need blood</p>
                    </div>
                  </div>
                </label>

                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="both"
                    checked={formData.role === 'both'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`flex-1 p-4 border-2 rounded-lg ${formData.role === 'both' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                    <div className="text-center">
                      <Droplets className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                      <h4 className="font-medium">Both</h4>
                      <p className="text-sm text-gray-600">Donor & Recipient</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register