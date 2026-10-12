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
  const [cancelModalBooking, setCancelModalBooking] = useState(null)
  const [cancelReasonPreset, setCancelReasonPreset] = useState('Thay đổi lịch trình cá nhân / công tác')
  const [cancelReasonCustom, setCancelReasonCustom] = useState('')
  const [submittingCancel, setSubmittingCancel] = useState(false)

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

  const calculateCancelPolicy = (b) => {
    if (!b || !b.checkIn) return { isFree: true, refundRate: 100, refundAmount: 0, fee: 0, hoursLeft: 999 }
    const now = new Date()
    const checkInDate = new Date(b.checkIn + 'T14:00:00')
    const diffMs = checkInDate - now
    const hoursLeft = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)))
    const isPending = b.status === 'PENDING'
    const isFree = isPending || hoursLeft >= 24
    const total = Number(b.totalPrice || 0)
    const refundRate = isFree ? 100 : 50
    const refundAmount = isFree ? total : Math.round(total * 0.5)
    const fee = total - refundAmount
    return { isFree, refundRate, refundAmount, fee, hoursLeft }
  }

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return
    const finalReason = cancelReasonPreset === 'Khác'
      ? (cancelReasonCustom.trim() || 'Lý do cá nhân')
      : cancelReasonPreset + (cancelReasonCustom.trim() ? `: ${cancelReasonCustom.trim()}` : '')

    setSubmittingCancel(true)
    try {
      const res = await bookingService.cancelBooking(cancelModalBooking.id, finalReason)
      if (res.success) {
        if (res.data?.status === 'CANCEL_REQUESTED') {
          setMessage('Yêu cầu hủy đơn đã được gửi tới Quản trị viên (Admin) để xác nhận và hoàn tiền!')
        } else {
          setMessage('Đã hủy đơn đặt phòng và giải phóng phòng thành công!')
        }
        setTimeout(() => setMessage(''), 6000)
        setCancelModalBooking(null)
        setCancelReasonCustom('')
        await loadBookings()
      } else {
        alert(res.error || 'Gửi yêu cầu hủy thất bại')
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi gửi yêu cầu hủy')
    } finally {
      setSubmittingCancel(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border border-amber-300'
      case 'CANCEL_REQUESTED':
        return 'bg-rose-100 text-rose-800 border border-rose-300'
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
        return 'Chờ Xác Nhận'
      case 'CANCEL_REQUESTED':
        return 'Chờ Admin Duyệt Hủy'
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
                        onClick={() => setCancelModalBooking(booking)}
                        disabled={submittingCancel}
                        className="btn-danger w-full flex items-center justify-center space-x-2 text-sm py-2"
                      >
                        <Trash2 size={16} />
                        <span>Hủy Đơn</span>
                      </button>
                    ) : booking.status === 'CANCEL_REQUESTED' ? (
                      <div className="w-full text-center py-2 px-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center justify-center space-x-1.5">
                        <Clock size={14} className="text-rose-600 animate-spin" />
                        <span>Chờ Duyệt Hủy</span>
                      </div>
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

                {selectedBooking.status === 'PENDING' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    ℹ️ Đơn đặt phòng đang ở trạng thái <strong>Chờ xác nhận</strong>. Quản trị viên / nhân viên khách sạn sẽ sớm kiểm tra và xác nhận đơn của bạn.
                  </div>
                )}

                {selectedBooking.status === 'CANCEL_REQUESTED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start space-x-2">
                    <Clock size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Yêu cầu hủy đang chờ Quản trị viên duyệt</p>
                      <p className="text-rose-700 mt-0.5">Admin sẽ kiểm tra và giải phóng phòng, hoàn tiền cho bạn theo chính sách.</p>
                    </div>
                  </div>
                )}

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
                  <div className="border-t pt-3 bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <span className="text-rose-600 block text-xs font-semibold uppercase">Lý do yêu cầu hủy</span>
                    <p className="text-rose-900 mt-1">{selectedBooking.cancelReason}</p>
                    {(selectedBooking.refundAmount !== null && selectedBooking.refundAmount !== undefined) && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-200">
                        <div>
                          <span className="text-rose-700">Phí hủy:</span>
                          <span className="font-semibold text-rose-900 ml-1">{Number(selectedBooking.cancellationFee || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div>
                          <span className="text-rose-700">Tiền hoàn:</span>
                          <span className="font-semibold text-emerald-700 ml-1">{Number(selectedBooking.refundAmount || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedBooking.cancelAdminNote && (
                  <div className="border-t pt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="text-amber-700 block text-xs font-semibold uppercase">Phản hồi từ Quản trị viên</span>
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

        {/* Modal Hủy Đơn Đặt Phòng (Tùy biến 1 & Yêu cầu duyệt Admin) */}
        {cancelModalBooking && (() => {
          const policy = calculateCancelPolicy(cancelModalBooking)
          const isPending = cancelModalBooking.status === 'PENDING'
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <AlertCircle size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-900">Xác Nhận Hủy Đặt Phòng</h3>
                      <p className="text-xs font-mono text-primary-500">
                        Mã đơn: #{cancelModalBooking.bookingCode || cancelModalBooking.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!submittingCancel) {
                        setCancelModalBooking(null)
                        setCancelReasonCustom('')
                      }
                    }}
                    className="p-1.5 hover:bg-primary-100 rounded-full text-primary-500 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  {/* Tóm tắt phòng */}
                  <div className="p-3.5 bg-primary-50 rounded-xl">
                    <p className="font-bold text-primary-900 text-base">{cancelModalBooking.hotelName}</p>
                    <p className="text-primary-600 font-medium text-xs mt-0.5">{cancelModalBooking.roomTypeName}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-primary-700 pt-2 border-t border-primary-200">
                      <span>Nhận phòng: <strong>{new Date(cancelModalBooking.checkIn).toLocaleDateString('vi-VN')}</strong> (tính từ 14:00)</span>
                      <span>{cancelModalBooking.nights || 1} đêm</span>
                    </div>
                  </div>

                  {/* Khung Chính Sách Hủy Phòng (Tùy biến 1) */}
                  <div className={`p-4 rounded-xl border ${policy.isFree ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-primary-700">
                        Chính Sách Hủy & Hoàn Tiền
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        policy.isFree ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {policy.isFree ? 'Hoàn 100% Tiền' : 'Hoàn 50% Tiền (Phí 50%)'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-primary-800">
                      <p className="flex items-center">
                        <Clock size={14} className="mr-1.5 flex-shrink-0 text-primary-600" />
                        <span>Thời gian đến giờ check-in: <strong>{policy.hoursLeft} giờ</strong></span>
                      </p>
                      {isPending ? (
                        <p className="text-emerald-700">
                          • Đơn chưa hoàn tất thanh toán: Bạn có thể hủy miễn phí ngay lập tức mà không phát sinh chi phí.
                        </p>
                      ) : policy.isFree ? (
                        <p className="text-emerald-700">
                          • Yêu cầu hủy trước 24 giờ nhận phòng: <strong>Miễn 100% phí hủy</strong>, hoàn lại toàn bộ số tiền đã thanh toán.
                        </p>
                      ) : (
                        <p className="text-amber-800">
                          • Yêu cầu hủy trong vòng 24 giờ nhận phòng: <strong>Phí hủy 50%</strong> theo quy định khách sạn, hoàn lại 50% số tiền đã thanh toán.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-primary-200 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white bg-opacity-70 rounded-lg p-2">
                        <span className="text-[11px] text-primary-500 block">Tổng tiền</span>
                        <span className="font-bold text-xs text-primary-900">
                          {Number(cancelModalBooking.totalPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-2">
                        <span className="text-[11px] text-primary-500 block">Phí hủy ({100 - policy.refundRate}%)</span>
                        <span className={`font-bold text-xs ${policy.fee > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {policy.fee.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-2">
                        <span className="text-[11px] text-primary-500 block">Hoàn lại ({policy.refundRate}%)</span>
                        <span className="font-bold text-xs text-luxury-gold">
                          {policy.refundAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông báo Admin Duyệt Hủy */}
                  {!isPending && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start space-x-2">
                      <div className="mt-0.5 text-blue-600 font-bold">ℹ️</div>
                      <div>
                        <p className="font-semibold text-blue-900">Quy trình duyệt hủy bởi Quản trị viên</p>
                        <p className="text-blue-700 mt-0.5">
                          Đơn phòng đã được xác nhận. Khi bạn gửi yêu cầu, hệ thống sẽ chuyển sang trạng thái <strong>Chờ Admin Duyệt Hủy</strong>. Quản trị viên sẽ kiểm tra và hoàn trả <strong>{policy.refundAmount.toLocaleString('vi-VN')} đ</strong> về tài khoản của bạn.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form chọn lý do */}
                  <div>
                    <label className="block text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1.5">
                      Lý do hủy phòng <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={cancelReasonPreset}
                      onChange={(e) => setCancelReasonPreset(e.target.value)}
                      className="w-full px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                    >
                      <option value="Thay đổi lịch trình cá nhân / công tác">Thay đổi lịch trình cá nhân / công tác</option>
                      <option value="Tìm được phòng hoặc khách sạn khác phù hợp hơn">Tìm được phòng hoặc khách sạn khác phù hợp hơn</option>
                      <option value="Gặp sự cố phương tiện đi lại / thời tiết">Gặp sự cố phương tiện đi lại / thời tiết</option>
                      <option value="Đặt nhầm ngày hoặc nhầm loại phòng">Đặt nhầm ngày hoặc nhầm loại phòng</option>
                      <option value="Khác">Lý do khác (nhập bên dưới)</option>
                    </select>

                    <div className="mt-2">
                      <textarea
                        rows={2}
                        placeholder={cancelReasonPreset === 'Khác' ? 'Vui lòng ghi rõ lý do hủy...' : 'Ghi chú thêm (không bắt buộc)...'}
                        value={cancelReasonCustom}
                        onChange={(e) => setCancelReasonCustom(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t">
                  <button
                    disabled={submittingCancel}
                    onClick={() => {
                      setCancelModalBooking(null)
                      setCancelReasonCustom('')
                    }}
                    className="btn-secondary px-5 py-2 text-sm"
                  >
                    Đóng
                  </button>
                  <button
                    disabled={submittingCancel}
                    onClick={handleConfirmCancel}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submittingCancel ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>{isPending ? 'Xác Nhận Hủy Phòng' : 'Gửi Yêu Cầu Hủy Đơn'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
