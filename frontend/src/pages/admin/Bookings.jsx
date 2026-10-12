import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Loader,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Clock
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'
import bookingService from '../../services/bookingService'

export default function AdminBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Modals for cancel approval / rejection
  const [approveConfirmBooking, setApproveConfirmBooking] = useState(null)
  const [rejectModalBooking, setRejectModalBooking] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)

  const loadAllBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingService.getAllBookings(0, 200)
      if (res.success) {
        setBookings(res.data || [])
      } else {
        console.error('Error fetching bookings:', res.error)
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
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

  const handleConfirm = async (id) => {
    if (!window.confirm('Xác nhận phê duyệt đơn đặt phòng này?')) return
    setActionLoadingId(id)
    try {
      const res = await bookingService.confirmBooking(id)
      if (res.success) {
        alert('Xác nhận đơn đặt phòng thành công!')
        await loadAllBookings()
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: 'CONFIRMED' } : null))
        }
      } else {
        alert(res.error || 'Xác nhận đơn thất bại')
      }
    } catch (err) {
      alert('Lỗi khi thực hiện xác nhận đơn')
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

  const handleApproveCancel = async (booking) => {
    if (!booking) return
    setSubmittingAction(true)
    try {
      const res = await bookingService.approveCancellation(booking.id)
      if (res.success) {
        alert('Đã phê duyệt hủy đơn và hoàn tiền thành công!')
        setApproveConfirmBooking(null)
        if (selectedBooking && selectedBooking.id === booking.id) {
          setSelectedBooking(null)
        }
        await loadAllBookings()
      } else {
        alert(res.error || 'Phê duyệt hủy thất bại')
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi phê duyệt hủy đơn')
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleRejectCancel = async () => {
    if (!rejectModalBooking) return
    const finalReason = rejectReason.trim() || 'Không đáp ứng điều kiện hủy phòng theo chính sách'
    setSubmittingAction(true)
    try {
      const res = await bookingService.rejectCancellation(rejectModalBooking.id, finalReason)
      if (res.success) {
        alert('Đã từ chối yêu cầu hủy đơn! Đơn giữ nguyên trạng thái Đã Xác Nhận.')
        setRejectModalBooking(null)
        setRejectReason('')
        if (selectedBooking && selectedBooking.id === rejectModalBooking.id) {
          setSelectedBooking(null)
        }
        await loadAllBookings()
      } else {
        alert(res.error || 'Từ chối hủy thất bại')
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi từ chối yêu cầu hủy')
    } finally {
      setSubmittingAction(false)
    }
  }

  const cancelRequestedCount = bookings.filter((b) => b.status === 'CANCEL_REQUESTED').length
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length

  const filtered = bookings.filter((b) => {
    if (activeTab === 'CANCEL_REQUESTED' && b.status !== 'CANCEL_REQUESTED') return false
    if (activeTab === 'PENDING' && b.status !== 'PENDING') return false
    if (activeTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false
    if (activeTab === 'CHECKED_IN' && b.status !== 'CHECKED_IN') return false
    if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false
    if (activeTab === 'CANCELLED_REFUNDED' && b.status !== 'CANCELLED' && b.status !== 'REFUNDED') return false

    const term = searchTerm.toLowerCase()
    const code = (b.bookingCode || '').toLowerCase()
    const guest = (b.contactName || '').toLowerCase()
    const phone = (b.contactPhone || '').toLowerCase()
    const hotel = (b.hotelName || '').toLowerCase()
    const status = (b.status || '').toLowerCase()
    return (
      code.includes(term) ||
      guest.includes(term) ||
      phone.includes(term) ||
      hotel.includes(term) ||
      status.includes(term)
    )
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
      case 'CANCEL_REQUESTED':
        return 'bg-rose-100 text-rose-800 border border-rose-300 font-bold animate-pulse'
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
      case 'CANCEL_REQUESTED': return 'Chờ Duyệt Hủy'
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'ALL'
                ? 'bg-primary-900 text-white shadow'
                : 'bg-white text-primary-700 hover:bg-primary-100 border border-primary-200'
            }`}
          >
            Tất Cả ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('CANCEL_REQUESTED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'CANCEL_REQUESTED'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <span>Yêu Cầu Hủy</span>
            {cancelRequestedCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'CANCEL_REQUESTED' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}>
                {cancelRequestedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <span>Chờ Xác Nhận</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'PENDING' ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('CONFIRMED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Đã Xác Nhận
          </button>

          <button
            onClick={() => setActiveTab('CHECKED_IN')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'CHECKED_IN'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            Đang Lưu Trú
          </button>

          <button
            onClick={() => setActiveTab('CANCELLED_REFUNDED')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'CANCELLED_REFUNDED'
                ? 'bg-primary-700 text-white shadow'
                : 'bg-white text-primary-600 hover:bg-primary-100 border border-primary-200'
            }`}
          >
            Đã Hủy / Hoàn Tiền
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
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            title="Xem chi tiết"
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Quick Actions for CANCEL_REQUESTED */}
                          {booking.status === 'CANCEL_REQUESTED' && (
                            <>
                              <button
                                title="Phê duyệt hủy đơn & hoàn tiền"
                                disabled={submittingAction}
                                onClick={() => setApproveConfirmBooking(booking)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded transition flex items-center space-x-1 text-xs font-semibold px-2"
                              >
                                <Check size={14} />
                                <span>Duyệt Hủy</span>
                              </button>
                              <button
                                title="Từ chối yêu cầu hủy"
                                disabled={submittingAction}
                                onClick={() => {
                                  setRejectModalBooking(booking)
                                  setRejectReason('')
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded transition flex items-center space-x-1 text-xs font-semibold px-2"
                              >
                                <X size={14} />
                                <span>Từ Chối</span>
                              </button>
                            </>
                          )}

                          {booking.status === 'PENDING' && (
                            <button
                              title="Xác nhận / Phê duyệt đơn"
                              disabled={actionLoadingId === booking.id}
                              onClick={() => handleConfirm(booking.id)}
                              className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded transition"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

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
                              title="Hủy đơn trực tiếp"
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

                {/* Banner & Chi tiết Yêu cầu Hủy của Khách */}
                {selectedBooking.status === 'CANCEL_REQUESTED' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-800 font-bold">
                      <AlertTriangle size={18} className="text-rose-600" />
                      <span>Khách Hàng Đã Gửi Yêu Cầu Hủy Đơn</span>
                    </div>
                    <div className="text-xs text-rose-900 bg-white p-3 rounded-lg border border-rose-100 space-y-1.5">
                      <p><strong>Lý do từ khách:</strong> {selectedBooking.cancelReason || 'Không có lý do'}</p>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rose-100 text-xs">
                        <div>
                          <span className="text-rose-700">Phí hủy theo quy định:</span>
                          <span className="font-bold text-rose-900 ml-1">
                            {Number(selectedBooking.cancellationFee || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <div>
                          <span className="text-rose-700">Số tiền hoàn trả:</span>
                          <span className="font-bold text-emerald-700 ml-1">
                            {Number(selectedBooking.refundAmount || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                {selectedBooking.status !== 'CANCEL_REQUESTED' && selectedBooking.cancelReason && (
                  <div className="border-t pt-3 bg-red-50 p-3 rounded-lg">
                    <span className="text-red-500 block text-xs font-semibold">Lý do hủy</span>
                    <p className="text-red-700 mt-1">{selectedBooking.cancelReason}</p>
                    {selectedBooking.cancellationFee !== null && selectedBooking.cancellationFee !== undefined && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs pt-2 border-t border-red-200">
                        <div>
                          <span className="text-red-600">Phí hủy:</span>
                          <span className="font-bold ml-1">{Number(selectedBooking.cancellationFee || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div>
                          <span className="text-emerald-700">Tiền hoàn:</span>
                          <span className="font-bold ml-1">{Number(selectedBooking.refundAmount || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedBooking.cancelAdminNote && (
                  <div className="border-t pt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="text-amber-700 block text-xs font-semibold uppercase">Ghi chú từ Quản trị viên</span>
                    <p className="text-amber-900 mt-1">{selectedBooking.cancelAdminNote}</p>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-base text-primary-900">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-luxury-gold">
                    {Number(selectedBooking.totalPrice || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                {selectedBooking.status === 'CANCEL_REQUESTED' && (
                  <>
                    <button
                      onClick={() => setApproveConfirmBooking(selectedBooking)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition text-sm shadow"
                    >
                      <Check size={16} />
                      <span>Duyệt Hủy & Hoàn Tiền</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalBooking(selectedBooking)
                        setRejectReason('')
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition text-sm shadow"
                    >
                      <X size={16} />
                      <span>Từ Chối Hủy</span>
                    </button>
                  </>
                )}

                {selectedBooking.status === 'PENDING' && (
                  <button
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => handleConfirm(selectedBooking.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    {actionLoadingId === selectedBooking.id ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    <span>Xác Nhận Đơn</span>
                  </button>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <button
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => {
                      handleCheckIn(selectedBooking.id)
                      setSelectedBooking(null)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <LogIn size={16} />
                    <span>Check-in</span>
                  </button>
                )}

                {selectedBooking.status === 'CHECKED_IN' && (
                  <button
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => {
                      handleCheckOut(selectedBooking.id)
                      setSelectedBooking(null)
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    <span>Check-out</span>
                  </button>
                )}

                {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                  <button
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => {
                      handleCancel(selectedBooking.id)
                      setSelectedBooking(null)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    <span>Hủy Đơn</span>
                  </button>
                )}

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

        {/* Modal Xác Nhận Duyệt Hủy Đơn */}
        {approveConfirmBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 text-emerald-700 mb-4 pb-3 border-b">
                <CheckCircle size={28} />
                <h3 className="text-lg font-bold text-primary-900">Xác Nhận Phê Duyệt Hủy Đơn</h3>
              </div>
              <div className="text-sm space-y-3 text-primary-800">
                <p>
                  Bạn có chắc chắn muốn phê duyệt hủy đơn <strong>#{approveConfirmBooking.bookingCode || approveConfirmBooking.id}</strong> của khách <strong>{approveConfirmBooking.contactName}</strong>?
                </p>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs space-y-1.5">
                  <p>• <strong>Lý do hủy:</strong> {approveConfirmBooking.cancelReason || 'Lý do cá nhân'}</p>
                  <p>• <strong>Tổng tiền đơn:</strong> {Number(approveConfirmBooking.totalPrice || 0).toLocaleString('vi-VN')} đ</p>
                  <p>• <strong>Phí hủy thu:</strong> {Number(approveConfirmBooking.cancellationFee || 0).toLocaleString('vi-VN')} đ</p>
                  <p className="text-emerald-800 font-bold">• <strong>Số tiền hoàn trả:</strong> {Number(approveConfirmBooking.refundAmount || 0).toLocaleString('vi-VN')} đ</p>
                </div>
                <p className="text-xs text-primary-600 italic">
                  * Hệ thống sẽ tự động giải phóng phòng về khách sạn và thực hiện quy trình hoàn tiền cho khách.
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  disabled={submittingAction}
                  onClick={() => setApproveConfirmBooking(null)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Đóng
                </button>
                <button
                  disabled={submittingAction}
                  onClick={() => handleApproveCancel(approveConfirmBooking)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {submittingAction ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>Duyệt Hủy Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Từ Chối Yêu Cầu Hủy */}
        {rejectModalBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 text-rose-700 mb-4 pb-3 border-b">
                <XCircle size={28} />
                <h3 className="text-lg font-bold text-primary-900">Từ Chối Yêu Cầu Hủy Đơn</h3>
              </div>
              <div className="text-sm space-y-3 text-primary-800">
                <p>
                  Từ chối yêu cầu hủy của đơn <strong>#{rejectModalBooking.bookingCode || rejectModalBooking.id}</strong>. Đơn đặt phòng sẽ được giữ nguyên trạng thái <strong>Đã Xác Nhận (CONFIRMED)</strong>.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
                    Lý do từ chối gửi cho khách hàng <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nhập lý do từ chối hủy (ví dụ: Không đáp ứng chính sách hủy, đơn sát giờ không thể giải phóng phòng...)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  disabled={submittingAction}
                  onClick={() => setRejectModalBooking(null)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Đóng
                </button>
                <button
                  disabled={submittingAction}
                  onClick={handleRejectCancel}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {submittingAction ? <Loader size={16} className="animate-spin" /> : <X size={16} />}
                  <span>Xác Nhận Từ Chối</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
