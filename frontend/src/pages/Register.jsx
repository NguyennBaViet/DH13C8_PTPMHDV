import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    setLoading(true)
    const result = await register(formData)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-luxury p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Đăng Ký Thành Công!</h2>
          <p className="text-primary-600">Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-luxury p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary-900 mb-8">
          <span className="text-luxury-gold">Mois</span> Đăng Ký
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Tên Đăng Nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="form-label">Tên Đầy Đủ</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập tên đầy đủ"
              required
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập email"
              required
            />
          </div>

          <div>
            <label className="form-label">Mật Khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div>
            <label className="form-label">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Đang Xử Lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-primary-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-luxury-gold font-semibold hover:text-luxury-darkGold">
              Đăng Nhập Ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
