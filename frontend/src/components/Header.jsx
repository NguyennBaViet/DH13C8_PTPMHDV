import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Menu, X, User, LogOut, Home } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <header className="bg-primary-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-3xl font-display font-bold">
            <span className="text-luxury-gold">Mois</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-luxury-gold transition">Trang Chủ</Link>
          <Link to="/hotels" className="hover:text-luxury-gold transition">Khách Sạn</Link>
          
          {user ? (
            <>
              <Link to="/my-bookings" className="hover:text-luxury-gold transition">Đặt Phòng</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-luxury-gold transition font-semibold text-luxury-gold">⚙️ Admin</Link>
              )}
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-luxury-gold transition">
                  <User size={20} />
                  <span>{user.username}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white text-primary-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-primary-100 rounded-t-lg"
                  >
                    Tài Khoản
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-primary-100 rounded-b-lg flex items-center space-x-2"
                  >
                    <LogOut size={18} />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-luxury-gold transition">Đăng Nhập</Link>
              <Link to="/register" className="bg-luxury-gold text-primary-900 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">
                Đăng Ký
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-primary-800 px-4 py-4 space-y-3">
          <Link
            to="/"
            className="block hover:text-luxury-gold transition"
            onClick={() => setMobileOpen(false)}
          >
            Trang Chủ
          </Link>
          <Link
            to="/hotels"
            className="block hover:text-luxury-gold transition"
            onClick={() => setMobileOpen(false)}
          >
            Khách Sạn
          </Link>

          {user ? (
            <>
              <Link
                to="/my-bookings"
                className="block hover:text-luxury-gold transition"
                onClick={() => setMobileOpen(false)}
              >
                Đặt Phòng
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="block hover:text-luxury-gold transition font-semibold text-luxury-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  ⚙️ Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="block hover:text-luxury-gold transition"
                onClick={() => setMobileOpen(false)}
              >
                Tài Khoản
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block hover:text-luxury-gold transition"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block hover:text-luxury-gold transition"
                onClick={() => setMobileOpen(false)}
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="block bg-luxury-gold text-primary-900 px-4 py-2 rounded-lg font-semibold text-center hover:bg-opacity-90 transition"
                onClick={() => setMobileOpen(false)}
              >
                Đăng Ký
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
