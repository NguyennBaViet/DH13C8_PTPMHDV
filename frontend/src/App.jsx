import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import HotelSearch from './pages/HotelSearch'
import HotelDetail from './pages/HotelDetail'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import MyBookings from './pages/MyBookings'
import UserProfile from './pages/UserProfile'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/hotels" element={<HotelSearch />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="/booking/:roomId" element={<Booking />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
