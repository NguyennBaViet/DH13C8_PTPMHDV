import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Trash2, Eye, Loader, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import bookingService from '../services/bookingService'

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [message, setMessage] = useState('')

  const loadBookings = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await bookingService.getMyBookings()
      if (res.success) {
        setBookings(res.data || [])
      } else {
        console.error('Failed to load bookings:', res.error)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [user])

  const handleCancel = async (bookingId) => {
    const reason = window.prompt('Vui lòng nhập lý do hủy đặt phòng (hoặc để trống):')
    if (reason === null) return // User cancelled prompt

    setCancellingId(bookingId)
    try {
      const res = await bookingService.cancelBooking(bookingId, reason || 'Khách yêu cầu hủy')
      if (res.success) {
        setMessage('Hủy đơn đặt phòng thành công!')
        setTimeout(() => setMessage(''), 4000)
        await loadBookings()
      } else {
        alert(res.error || 'Không thể hủy đơn đặt phòng')
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi hủy đặt phòng')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300'
      case 'CHECKED_IN':
        return 'bg-purple-100 text-purple-700 border border-purple-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-700 border border-gray-300'
      default:
        return 'bg-primary-100 text-primary-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã Xác Nhận'
      case 'PENDING':
        return 'Chờ Thanh Toán'
      case 'CHECKED_IN':
        return 'Đang Lưu Trú'
      case 'COMPLETED':
        return 'Đã Hoàn Thành'
      case 'CANCELLED':
        return 'Đã Hủy'
      case 'REFUNDED':
        return 'Đã Hoàn Tiền'
      case 'EXPIRED':
        return 'Hết Hạn'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-900">Đơn Đặt Phòng Của Tôi</h1>
            <p className="text-primary-600 mt-1">Quản lý và theo dõi lịch sử đặt phòng của bạn</p>
          </div>
          <button
            onClick={loadBookings}
            className="mt-4 sm:mt-0 text-sm font-semibold text-luxury-gold hover:underline flex items-center"
          >
            Làm mới danh sách
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!user ? (
          <div className="card-luxury p-12 text-center">
            <p className="text-lg text-primary-600 mb-6">Vui lòng đăng nhập để xem đơn đặt phòng của bạn</p>
            <Link to="/login" className="btn-primary inline-block">
              Đăng Nhập
            </Link>
          </div>
        ) : loading ? (
          <div className="card-luxury p-12 text-center flex flex-col items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-4" />
            <p className="text-primary-600">Đang tải danh sách đơn đặt phòng...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <div className="text-5xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-primary-900 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
            <p className="text-primary-600 mb-6">Hãy khám phá các khách sạn sang trọng và đặt phòng ngay hôm nay.</p>
            <Link to="/hotels" className="btn-primary inline-block">
              Tìm Kiếm Khách Sạn
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="card-luxury overflow-hidden hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                  {/* Hotel & Room Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                        #{booking.bookingCode || `BK-${booking.id}`}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary-900 mb-1">{booking.hotelName || 'Khách Sạn Luxury'}</h3>
                    <p className="text-sm font-semibold text-luxury-gold mb-3">
                      {booking.roomTypeName || 'Phòng tiêu chuẩn'}
                    </p>

                    <div className="space-y-2 text-sm text-primary-600">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-primary-500" />
                        <span>
                          {new Date(booking.checkIn).toLocaleDateString('vi-VN')} → {new Date(booking.checkOut).toLocaleDateString('vi-VN')} ({booking.nights || 1} đêm)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-primary-500" />
                        <span>{booking.guests || 1} khách ({booking.rooms || 1} phòng)</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Price */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-primary-500 mb-1 font-semibold">Trạng Thái</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="my-2">
                      <p className="text-xs text-primary-500">Ngày đặt</p>
                      <p className="text-sm font-medium text-primary-700">
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'Mới đặt'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-primary-500">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-luxury-gold">
                        {Number(booking.totalPrice || 0).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex flex-col justify-between border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="btn-secondary w-full flex items-center justify-center space-x-2 mb-3 text-sm py-2"
                    >
                      <Eye size={16} />
                      <span>Chi Tiết</span>
                    </button>

                    {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="btn-danger w-full flex items-center justify-center space-x-2 text-sm py-2"
                      >
                        {cancellingId === booking.id ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>Hủy Đơn</span>
                      </button>
                    ) : (
                      <div className="text-xs text-center text-primary-400 py-2">
                        Không thể hủy
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Chi Tiết Đơn */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-900">Chi Tiết Đơn Đặt Phòng</h3>
                  <p className="text-xs font-mono text-primary-500">Mã đơn: #{selectedBooking.bookingCode}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 hover:bg-primary-100 rounded-full text-primary-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="font-bold text-primary-900">{selectedBooking.hotelName}</p>
                  <p className="text-primary-600">{selectedBooking.roomTypeName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-primary-500 block text-xs">Ngày nhận phòng</span>
                    <span className="font-semibold">{new Date(selectedBooking.checkIn).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-primary-500 block text-xs">Ngày trả phòng</span>
                    <span className="font-semibold">{new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-primary-500 block text-xs">Số khách / Số phòng</span>
                    <span className="font-semibold">{selectedBooking.guests} khách / {selectedBooking.rooms} phòng</span>
                  </div>
                  <div>
                    <span className="text-primary-500 block text-xs">Trạng thái</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(selectedBooking.status)}`}>
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <span className="text-primary-500 block text-xs">Thông tin người liên hệ</span>
                  <p className="font-medium">{selectedBooking.contactName} - {selectedBooking.contactPhone}</p>
                  <p className="text-primary-600 text-xs">{selectedBooking.contactEmail}</p>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="border-t pt-3">
                    <span className="text-primary-500 block text-xs">Yêu cầu đặc biệt</span>
                    <p className="italic text-primary-700">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {selectedBooking.cancelReason && (
                  <div className="border-t pt-3 bg-red-50 p-2 rounded">
                    <span className="text-red-500 block text-xs">Lý do hủy</span>
                    <p className="text-red-700">{selectedBooking.cancelReason}</p>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-base text-primary-900">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-luxury-gold">
                    {Number(selectedBooking.totalPrice || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="btn-secondary px-6"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
