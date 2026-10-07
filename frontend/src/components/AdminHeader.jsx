import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Building2, DoorOpen, BookOpen, LogOut, User, Star } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AdminHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const navItems = [
    { label: 'Bảng Điều Khiển', path: '/admin', icon: null },
    { label: 'Khách Sạn', path: '/admin/hotels', icon: <Building2 size={18} /> },
    { label: 'Phòng', path: '/admin/rooms', icon: <DoorOpen size={18} /> },
    { label: 'Đơn Đặt', path: '/admin/bookings', icon: <BookOpen size={18} /> },
    { label: 'Đánh Giá', path: '/admin/reviews', icon: <Star size={18} /> }
  ]

  return (
    <header className="bg-primary-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Desktop Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="bg-luxury-gold text-primary-900 w-10 h-10 rounded flex items-center justify-center font-bold">⚙️</div>
            <span className="text-xl font-bold hidden sm:inline">Mois Admin</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-luxury-gold text-primary-900 font-semibold'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <User size={18} />
              <span>{user?.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-lg text-primary-100 hover:bg-primary-800 transition"
            >
              <LogOut size={18} />
              <span>Đăng Xuất</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white hover:bg-primary-800 p-2 rounded"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="md:hidden mt-4 space-y-2 pb-4 border-t border-primary-700 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-luxury-gold text-primary-900 font-semibold'
                    : 'text-primary-100 hover:bg-primary-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout()
                setMobileOpen(false)
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-primary-100 hover:bg-primary-800 rounded-lg transition"
            >
              <LogOut size={18} />
              <span>Đăng Xuất</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
