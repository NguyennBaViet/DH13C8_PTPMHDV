import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Trash2, Eye } from 'lucide-react'

export default function MyBookings() {
  const [bookings, setBookings] = useState([
    {
      id: 'BK001',
      hotelName: 'Mois Luxury Suite',
      city: 'Hồ Chí Minh',
      checkIn: '2024-12-20',
      checkOut: '2024-12-23',
      guests: 2,
      roomType: 'Phòng Đôi',
      price: 7500000,
      status: 'Confirmed',
      bookingDate: '2024-11-15'
    },
    {
      id: 'BK002',
      hotelName: 'Mois Premium Plaza',
      city: 'Hà Nội',
      checkIn: '2024-12-28',
      checkOut: '2024-12-30',
      guests: 1,
      roomType: 'Phòng Đơn',
      price: 3000000,
      status: 'Pending',
      bookingDate: '2024-11-10'
    },
    {
      id: 'BK003',
      hotelName: 'Mois Ocean View',
      city: 'Đà Nẵng',
      checkIn: '2024-11-05',
      checkOut: '2024-11-07',
      guests: 3,
      roomType: 'Suite Hạng Sang',
      price: 10000000,
      status: 'Completed',
      bookingDate: '2024-10-20'
    }
  ])

  const handleCancel = (bookingId) => {
    if (confirm('Bạn có chắc muốn hủy đặt phòng này?')) {
      setBookings(bookings.filter(b => b.id !== bookingId))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'Completed':
        return 'bg-blue-100 text-blue-700'
      case 'Cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-primary-100 text-primary-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'Đã Xác Nhận'
      case 'Pending':
        return 'Chờ Xác Nhận'
      case 'Completed':
        return 'Đã Hoàn Thành'
      case 'Cancelled':
        return 'Đã Hủy'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Đơn Đặt Phòng Của Tôi</h1>

        {bookings.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <p className="text-lg text-primary-600 mb-6">Bạn chưa có đơn đặt phòng nào</p>
            <Link to="/hotels" className="btn-primary inline-block">
              Tìm Kiếm Khách Sạn
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-luxury overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                  {/* Hotel Info */}
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-primary-900 mb-2">{booking.hotelName}</h3>
                    <div className="flex items-center text-primary-600 mb-3">
                      <MapPin size={18} />
                      <span className="ml-2">{booking.city}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-primary-600">
                        <Calendar size={18} />
                        <span className="ml-2 text-sm">
                          {new Date(booking.checkIn).toLocaleDateString('vi-VN')} - {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center text-primary-600">
                        <Users size={18} />
                        <span className="ml-2 text-sm">{booking.guests} khách</span>
                      </div>
                    </div>
                    <p className="text-sm text-primary-600 mt-3">
                      <strong>Loại phòng:</strong> {booking.roomType}
                    </p>
                  </div>

                  {/* Status & Price */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <p className="text-sm text-primary-600 mb-2">Trạng Thái</p>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-primary-600">Ngày Đặt</p>
                      <p className="font-semibold">
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-600">Giá Trị</p>
                      <p className="text-2xl font-bold text-luxury-gold">
                        {(booking.price / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    <Link
                      to={`/hotels/1`}
                      className="btn-secondary flex items-center justify-center space-x-2 mb-3"
                    >
                      <Eye size={18} />
                      <span>Xem Chi Tiết</span>
                    </Link>
                    {booking.status === 'Pending' || booking.status === 'Confirmed' ? (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="btn-danger flex items-center justify-center space-x-2"
                      >
                        <Trash2 size={18} />
                        <span>Hủy Đơn</span>
                      </button>
                    ) : (
                      <button disabled className="btn-secondary opacity-50 cursor-not-allowed flex items-center justify-center space-x-2">
                        <Trash2 size={18} />
                        <span>Không Thể Hủy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
