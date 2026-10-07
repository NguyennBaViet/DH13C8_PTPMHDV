import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Lock, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'Nam',
    avatar: '👤'
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setEditMode(false)
    // API call would go here
    alert('Hồ sơ đã được cập nhật thành công!')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }
    alert('Mật khẩu đã được thay đổi thành công!')
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Tài Khoản Của Tôi</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{profileData.avatar}</div>
                <h2 className="text-xl font-bold text-primary-900">{profileData.fullName}</h2>
                <p className="text-primary-600 text-sm">{profileData.email}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('profile')
                    setEditMode(false)
                  }}
                  className={`w-full text-left py-3 px-4 rounded-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-luxury-gold bg-opacity-20 text-luxury-gold font-semibold'
                      : 'text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  <User className="inline mr-2" size={18} />
                  Hồ Sơ
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left py-3 px-4 rounded-lg transition ${
                    activeTab === 'password'
                      ? 'bg-luxury-gold bg-opacity-20 text-luxury-gold font-semibold'
                      : 'text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  <Lock className="inline mr-2" size={18} />
                  Đổi Mật Khẩu
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="inline mr-2" size={18} />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="card-luxury p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Thông Tin Hồ Sơ</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="btn-secondary"
                  >
                    {editMode ? 'Hủy' : 'Chỉnh Sửa'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Họ Và Tên</label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Số Điện Thoại</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Ngày Sinh</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleProfileChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Địa Chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Giới Tính</label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleProfileChange}
                        className="form-input"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary">
                      Lưu Thay Đổi
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4">
                        <User className="text-luxury-gold" size={24} />
                        <div>
                          <p className="text-primary-600 text-sm">Họ Và Tên</p>
                          <p className="font-semibold text-primary-900">{profileData.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Mail className="text-luxury-gold" size={24} />
                        <div>
                          <p className="text-primary-600 text-sm">Email</p>
                          <p className="font-semibold text-primary-900">{profileData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4">
                        <Phone className="text-luxury-gold" size={24} />
                        <div>
                          <p className="text-primary-600 text-sm">Số Điện Thoại</p>
                          <p className="font-semibold text-primary-900">{profileData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <MapPin className="text-luxury-gold" size={24} />
                        <div>
                          <p className="text-primary-600 text-sm">Địa Chỉ</p>
                          <p className="font-semibold text-primary-900">{profileData.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="card-luxury p-8">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Thay Đổi Mật Khẩu</h2>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div>
                    <label className="form-label">Mật Khẩu Cũ</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Mật Khẩu Mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Xác Nhận Mật Khẩu Mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary">
                    Thay Đổi Mật Khẩu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
