import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, Users } from 'lucide-react'

export default function Booking() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  const roomPrice = 2500000
  const nights = 3
  const totalPrice = roomPrice * nights

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/payment/${roomId}`)
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Đặt Phòng</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="card-luxury p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Ngày Nhận Phòng</label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Ngày Trả Phòng</label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Số Khách</label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="1">1 Khách</option>
                  <option value="2">2 Khách</option>
                  <option value="3">3 Khách</option>
                  <option value="4">4+ Khách</option>
                </select>
              </div>

              <div>
                <label className="form-label">Họ Và Tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Yêu Cầu Đặc Biệt</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nhập các yêu cầu đặc biệt (tùy chọn)"
                  rows="4"
                />
              </div>

              <button type="submit" className="btn-primary w-full text-lg">
                Tiếp Tục Thanh Toán
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-primary-900 mb-2">Mois Luxury Suite</h3>
                <p className="text-sm text-primary-600">Phòng Đôi</p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-primary-600">Nhận phòng</span>
                  <span className="font-semibold">20/12/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Trả phòng</span>
                  <span className="font-semibold">23/12/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Số đêm</span>
                  <span className="font-semibold">{nights} đêm</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-primary-600">{(roomPrice / 1000000).toFixed(1)}M × {nights} đêm</span>
                  <span className="font-semibold">{(roomPrice * nights / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Thuế</span>
                  <span className="font-semibold">Miễn phí</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">Tổng Cộng</span>
                  <span className="text-2xl font-bold text-luxury-gold">
                    {(totalPrice / 1000000).toFixed(1)}M
                  </span>
                </div>
                <p className="text-xs text-primary-600 text-center">
                  Hoàn tiền 100% nếu hủy trong 24 giờ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
