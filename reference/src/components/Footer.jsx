import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">BloodConnect Pro</span>
            </div>
            <p className="text-gray-300 mb-4">
              Connecting lives through blood donation. Our platform makes it easy to find donors, 
              request blood, and save lives in your community.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-gray-300 hover:text-primary-500 transition-colors">Find Donors</Link></li>
              <li><Link to="/blood-banks" className="text-gray-300 hover:text-primary-500 transition-colors">Blood Banks</Link></li>
              <li><Link to="/education" className="text-gray-300 hover:text-primary-500 transition-colors">Education</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-primary-500 transition-colors">Register as Donor</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Blood Matching</span></li>
              <li><span className="text-gray-300">Emergency Requests</span></li>
              <li><span className="text-gray-300">Appointment Scheduling</span></li>
              <li><span className="text-gray-300">Health Screening</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">support@bloodconnectpro.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">123 Medical Center Dr, Health City, HC 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 BloodConnect Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-300 hover:text-primary-500 text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-primary-500 text-sm transition-colors">Terms of Service</Link>
              <Link to="/contact" className="text-gray-300 hover:text-primary-500 text-sm transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer