import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DonorSearch from './pages/DonorSearch'
import BloodRequests from './pages/BloodRequests'
import Profile from './pages/Profile'
import BloodBanks from './pages/BloodBanks'
import Appointments from './pages/Appointments'
import Messages from './pages/Messages'
import Analytics from './pages/Analytics'
import Education from './pages/Education'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
          <Route path="/search" element={<DonorSearch />} />
          <Route path="/requests" element={user ? <BloodRequests /> : <Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Login />} />
          <Route path="/blood-banks" element={<BloodBanks />} />
          <Route path="/appointments" element={user ? <Appointments /> : <Login />} />
          <Route path="/messages" element={user ? <Messages /> : <Login />} />
          <Route path="/analytics" element={user ? <Analytics /> : <Login />} />
          <Route path="/education" element={<Education />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App