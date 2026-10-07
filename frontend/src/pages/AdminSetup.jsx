import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function AdminSetup() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Try to get users list
      const response = await api.get('/auth/admin/users')
      setUsers(response.data)
      setMessage('Đã tải danh sách người dùng')
    } catch (err) {
      setError('Lỗi: ' + (err.response?.data?.message || err.message) + '\n\nBạn cần là ADMIN để xem danh sách. Hoặc tạo tài khoản trước rồi quay lại đây.')
    }
    setLoading(false)
  }

  const makeAdmin = async (userId) => {
    if (!confirm('Bạn có chắc muốn chuyển người dùng này thành ADMIN?')) return
    
    try {
      const response = await api.patch(`/auth/admin/users/${userId}/role?role=ADMIN`)
      setMessage(`✅ ${response.data.message}`)
      loadUsers()
    } catch (err) {
      setError('❌ Lỗi: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-primary-600 hover:text-primary-900 mb-8 inline-block">← Quay lại trang chủ</Link>

        <div className="card-luxury p-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">⚙️ Admin Setup</h1>
          <p className="text-primary-600 mb-6">Trang này giúp bạn thiết lập tài khoản Admin đầu tiên</p>

          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-700"><strong>Bước 1:</strong> Bạn cần đăng nhập trước</p>
              <Link to="/register" className="btn-primary mt-4 inline-block">Tạo Tài Khoản</Link>
              <span className="mx-3">hoặc</span>
              <Link to="/login" className="btn-secondary mt-4 inline-block">Đăng Nhập</Link>
            </div>
          ) : user.role === 'ADMIN' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-green-700">✅ Bạn đã là <strong>ADMIN</strong></p>
              <Link to="/admin" className="btn-primary mt-4 inline-block">Truy Cập Admin Dashboard</Link>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-blue-700"><strong>Bước 2:</strong> Tải danh sách người dùng (nếu là admin, hoặc người đầu tiên)</p>
                <button onClick={loadUsers} disabled={loading} className="btn-primary mt-4">
                  {loading ? 'Đang Tải...' : 'Tải Danh Sách Người Dùng'}
                </button>
              </div>

              {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">{message}</div>}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6 whitespace-pre-wrap">{error}</div>}

              {users.length > 0 && (
                <div className="bg-primary-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Danh Sách Người Dùng</h3>
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="bg-white p-4 rounded border flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{u.username}</p>
                          <p className="text-sm text-primary-600">{u.email}</p>
                          <p className="text-sm">Vai trò: <span className="font-semibold">{u.role}</span></p>
                        </div>
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => makeAdmin(u.id)} className="btn-primary">Chuyển thành Admin</button>
                        )}
                        {u.role === 'ADMIN' && <span className="text-green-600 font-bold">✓ ADMIN</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card-luxury p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">📝 Hướng Dẫn</h2>
          <ol className="list-decimal list-inside space-y-3 text-primary-700">
            <li><strong>Tạo tài khoản người dùng</strong> thông qua trang /register nếu chưa có</li>
            <li><strong>Đăng nhập</strong> vào tài khoản vừa tạo</li>
            <li><strong>Vào trang này</strong> (/admin-setup)</li>
            <li><strong>Nhấn "Tải Danh Sách Người Dùng"</strong> để xem tất cả người dùng</li>
            <li><strong>Nhấn "Chuyển thành Admin"</strong> trên tài khoản của bạn</li>
            <li><strong>Truy cập Admin Dashboard</strong> tại /admin</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
