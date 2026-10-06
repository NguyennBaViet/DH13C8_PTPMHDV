import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AlertCircle } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    if (result.success) {
      navigate('/hotels')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-luxury p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary-900 mb-8">
          <span className="text-luxury-gold">Mois</span> Đăng Nhập
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Tên Đăng Nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="form-label">Mật Khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Đang Xử Lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-primary-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-luxury-gold font-semibold hover:text-luxury-darkGold">
              Đăng Ký Ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
