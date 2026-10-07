import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Search, Loader, LogIn, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'
import bookingService from '../../services/bookingService'

export default function AdminBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const loadAllBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingService.getAllBookings(0, 100)
      if (res.success) {
        setBookings(res.data || [])
      } else {
        console.error('Error fetching admin bookings:', res.error)
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllBookings()
    }
  }, [user])

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-primary-50">
        <AdminHeader />
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-xl text-red-600 font-semibold mb-4">Truy cập bị từ chối</p>
          <p className="text-primary-600">Bạn không có quyền truy cập trang quản trị này.</p>
        </div>
      </div>
    )
  }

  const handleCheckIn = async (id) => {
    if (!window.confirm('Xác nhận khách nhận phòng (Check-in)?')) return
    setActionLoadingId(id)
    try {
      const res = await bookingService.checkInBooking(id)
      if (res.success) {
        alert('Check-in thành công!')
        await loadAllBookings()
      } else {
        alert(res.error || 'Check-in thất bại')
      }
    } catch (err) {
      alert('Lỗi khi thực hiện check-in')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCheckOut = async (id) => {
    if (!window.confirm('Xác nhận khách trả phòng (Check-out)?')) return
    setActionLoadingId(id)
    try {
      const res = await bookingService.checkOutBooking(id)
      if (res.success) {
        alert('Check-out thành công!')
        await loadAllBookings()
      } else {
        alert(res.error || 'Check-out thất bại')
      }
    } catch (err) {
      alert('Lỗi khi thực hiện check-out')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (id) => {
    const reason = window.prompt('Nhập lý do hủy đơn (hoặc để trống):')
    if (reason === null) return
    setActionLoadingId(id)
    try {
      const res = await bookingService.cancelBooking(id, reason || 'Quản trị viên hủy đơn')
      if (res.success) {
        alert('Đã hủy đơn đặt phòng!')
        await loadAllBookings()
      } else {
        alert(res.error || 'Hủy đơn thất bại')
      }
    } catch (err) {
      alert('Lỗi khi hủy đơn đặt phòng')
    } finally {
      setActionLoadingId(null)
    }
  }

  const filtered = bookings.filter((b) => {
    const term = searchTerm.toLowerCase()
    const code = (b.bookingCode || '').toLowerCase()
    const guest = (b.contactName || '').toLowerCase()
    const phone = (b.contactPhone || '').toLowerCase()
    const hotel = (b.hotelName || '').toLowerCase()
    const status = (b.status || '').toLowerCase()
    return code.includes(term) || guest.includes(term) || phone.includes(term) || hotel.includes(term) || status.includes(term)
  })

  const getStatusColor = (status) => {
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Đã Xác Nhận'
      case 'PENDING': return 'Chờ Xác Nhận'
      case 'CHECKED_IN': return 'Đang Ở'
      case 'COMPLETED': return 'Đã Hoàn Thành'
      case 'CANCELLED': return 'Đã Hủy'
      case 'REFUNDED': return 'Đã Hoàn Tiền'
      case 'EXPIRED': return 'Hết Hạn'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-900">Quản Lý Đơn Đặt Phòng</h1>
            <p className="text-primary-600 mt-1">Danh sách toàn bộ các đơn đặt phòng trong hệ thống</p>
          </div>
          <button
            onClick={loadAllBookings}
            disabled={loading}
            className="mt-4 sm:mt-0 btn-secondary flex items-center space-x-2 text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Làm Mới</span>
          </button>
        </div>

        <div className="card-luxury">
          <div className="p-6 border-b flex items-center space-x-3">
            <Search size={20} className="text-primary-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, khách hàng, số điện thoại, khách sạn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-primary-900 placeholder-primary-400"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-luxury-gold mb-3" />
              <p className="text-primary-600">Đang tải danh sách đơn đặt phòng...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-primary-500">
              Không tìm thấy đơn đặt phòng nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 border-b text-xs uppercase tracking-wider text-primary-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Mã Đơn</th>
                    <th className="px-6 py-4 text-left font-semibold">Khách Hàng</th>
                    <th className="px-6 py-4 text-left font-semibold">Khách Sạn</th>
                    <th className="px-6 py-4 text-left font-semibold">Phòng</th>
                    <th className="px-6 py-4 text-left font-semibold">Ngày Nhận</th>
                    <th className="px-6 py-4 text-left font-semibold">Ngày Trả</th>
                    <th className="px-6 py-4 text-left font-semibold">Tổng Tiền</th>
                    <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                    <th className="px-6 py-4 text-center font-semibold">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 text-sm">
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-primary-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-primary-900">
                        #{booking.bookingCode || booking.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-primary-900">{booking.contactName || 'Khách'}</div>
                        <div className="text-xs text-primary-500">{booking.contactPhone}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-primary-800">
                        {booking.hotelName || `KS #${booking.hotelId}`}
                      </td>
                      <td className="px-6 py-4 text-primary-700">
                        {booking.roomTypeName || `Phòng #${booking.roomTypeId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary-600">
                        {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary-600">
                        {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-luxury-gold whitespace-nowrap">
                        {Number(booking.totalPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            title="Xem chi tiết"
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition"
                          >
                            <Eye size={18} />
                          </button>

                          {booking.status === 'CONFIRMED' && (
                            <button
                              title="Check-in"
                              disabled={actionLoadingId === booking.id}
                              onClick={() => handleCheckIn(booking.id)}
                              className="p-1.5 hover:bg-green-100 text-green-600 rounded transition"
                            >
                              <LogIn size={18} />
                            </button>
                          )}

                          {booking.status === 'CHECKED_IN' && (
                            <button
                              title="Check-out"
                              disabled={actionLoadingId === booking.id}
                              onClick={() => handleCheckOut(booking.id)}
                              className="p-1.5 hover:bg-purple-100 text-purple-600 rounded transition"
                            >
                              <LogOut size={18} />
                            </button>
                          )}

                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button
                              title="Hủy đơn"
                              disabled={actionLoadingId === booking.id}
                              onClick={() => handleCancel(booking.id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Chi Tiết Đơn Đặt */}
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
                    <span className="font-semibold">{selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div>
                    <span className="text-primary-500 block text-xs">Ngày trả phòng</span>
                    <span className="font-semibold">{selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-primary-500 block text-xs">Khách / Phòng</span>
                    <span className="font-semibold">{selectedBooking.guests} khách / {selectedBooking.rooms} phòng</span>
                  </div>
                  <div>
                    <span className="text-primary-500 block text-xs">Trạng thái</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <span className="text-primary-500 block text-xs">Thông tin khách liên hệ</span>
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
