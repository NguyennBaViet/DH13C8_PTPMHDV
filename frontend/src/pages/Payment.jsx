import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader, ShieldCheck, QrCode, CreditCard, ExternalLink, Info, XCircle, RotateCcw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import bookingService from '../services/bookingService'
import paymentService from '../services/paymentService'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const bookingData = location.state || {}

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bankCode, setBankCode] = useState('NCB') // Default to NCB test bank on Sandbox
  const [existingBooking, setExistingBooking] = useState(null)
  const [fetchingBooking, setFetchingBooking] = useState(false)

  // Nếu người dùng truy cập trực tiếp URL /payment/:id hoặc refresh trang
  useEffect(() => {
    if (bookingId && !bookingData.checkIn) {
      setFetchingBooking(true)
      bookingService.getBookingById(bookingId)
        .then(res => {
          if (res.success && res.data) {
            setExistingBooking(res.data)
          }
        })
        .catch(err => {
          console.warn('Không thể tải đơn đặt phòng theo ID:', err)
        })
        .finally(() => {
          setFetchingBooking(false)
        })
    }
  }, [bookingId, bookingData.checkIn])

  const activeBooking = existingBooking || bookingData
  const checkIn = activeBooking.checkIn || ''
  const checkOut = activeBooking.checkOut || ''
  const nights = activeBooking.nights || 1
  const totalPrice = activeBooking.totalPrice || activeBooking.roomPrice || 1200000
  const currentBookingId = existingBooking?.id || bookingData.id || bookingData.bookingId

  const handleVNPayPayment = async () => {
    setError('')
    setLoading(true)

    try {
      if (!checkIn || !checkOut) {
        setError('Thiếu thông tin ngày nhận/trả phòng. Vui lòng quay lại chọn phòng.')
        setLoading(false)
        return
      }

      // Format Vietnamese phone number
      let rawPhone = (activeBooking.phone || activeBooking.contactPhone || user?.phone || '0912345678').replace(/\D/g, '')
      if (rawPhone.startsWith('84') && rawPhone.length === 11) {
        rawPhone = '0' + rawPhone.substring(2)
      } else if (!rawPhone.startsWith('0')) {
        rawPhone = '0' + rawPhone
      }
      if (rawPhone.length < 10 || rawPhone.length > 11) {
        rawPhone = '0912345678'
      }

      // 1. Kiểm tra hoặc Tạo booking trên booking-service
      let bookingIdToPay = currentBookingId

      if (!bookingIdToPay) {
        const bookingPayload = {
          hotelId: Number(activeBooking.hotelId || 1),
          roomId: Number(activeBooking.roomId || bookingId || 1),
          roomTypeId: Number(activeBooking.roomId || bookingId || 1),
          checkIn: checkIn,
          checkOut: checkOut,
          rooms: 1,
          guests: Number(activeBooking.guests) || 1,
          specialRequests: activeBooking.specialRequests || 'Không có yêu cầu đặc biệt',
          contactName: activeBooking.fullName || activeBooking.contactName || user?.fullName || user?.username || 'Khách Hàng',
          contactEmail: activeBooking.email || activeBooking.contactEmail || user?.email || 'guest@example.com',
          contactPhone: rawPhone
        }

        const bookingRes = await bookingService.createBooking(bookingPayload)
        if (!bookingRes.success) {
          setError(bookingRes.error || 'Tạo đơn đặt phòng thất bại')
          setLoading(false)
          return
        }
        bookingIdToPay = bookingRes.data?.id
        setExistingBooking(bookingRes.data)
      }

      // 2. Tạo URL thanh toán VNPay trên payment-noti-service
      const vnpayRes = await paymentService.createVNPayPayment({
        bookingId: bookingIdToPay,
        amount: totalPrice,
        bankCode: bankCode || 'NCB',
        returnUrl: `${window.location.origin}/payment/vnpay-return`
      })

      if (!vnpayRes.success || !vnpayRes.data?.checkoutUrl) {
        setError(vnpayRes.error || 'Khởi tạo thanh toán VNPay thất bại')
        setLoading(false)
        return
      }

      // 3. Chuyển hướng người dùng sang cổng thanh toán VNPAY
      window.location.href = vnpayRes.data.checkoutUrl

    } catch (err) {
      console.error('VNPay payment redirect error:', err)
      setError(err.message || 'Đã xảy ra lỗi khi kết nối đến cổng thanh toán VNPay')
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!currentBookingId) {
      navigate(-1)
      return
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hủy đơn đặt phòng này? Phòng sẽ được giải phóng ngay lập tức.'
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await bookingService.cancelBooking(currentBookingId, 'Khách hủy tại trang thanh toán')
      if (res.success) {
        alert('Đã hủy đơn thành công và giải phóng phòng.')
        const returnRoomId = activeBooking.roomId || activeBooking.roomTypeId || bookingId
        navigate(`/booking/${returnRoomId}`)
      } else {
        setError(res.error || 'Hủy đơn thất bại')
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi hủy đơn đặt phòng')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Thanh Toán</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fetchingBooking && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center text-blue-700">
            <Loader className="w-5 h-5 mr-3 animate-spin" />
            <span>Đang tải thông tin đơn đặt phòng #{bookingId}...</span>
          </div>
        )}

        {existingBooking?.status === 'CONFIRMED' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-green-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Đơn đặt phòng #{existingBooking.id} ({existingBooking.bookingCode}) đã được ghi nhận thanh toán thành công!</span>
            </div>
            <Link to="/my-bookings" className="btn-primary py-2 px-4 text-xs font-semibold">Xem Đơn Của Tôi</Link>
          </div>
        )}

        {existingBooking?.status === 'CANCELLED' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Đơn đặt phòng #{existingBooking.id} đã bị hủy. Phòng đã được mở lại.</span>
            </div>
            <Link to="/hotels" className="btn-primary py-2 px-4 text-xs font-semibold">Tìm Phòng Mới</Link>
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Vui lòng <Link to="/login" className="font-bold underline">đăng nhập</Link> trước khi thanh toán để đơn đặt phòng được liên kết với tài khoản của bạn.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Payment Selection */}
          <div className="md:col-span-2">
            <div className="card-luxury p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-primary-900">Phương Thức Thanh Toán</h2>

              {/* VNPay Gateway Option Card */}
              <div className="p-6 border-2 border-luxury-gold bg-amber-50/40 rounded-xl mb-6 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="vnpay-radio"
                      name="payment_choice"
                      checked={true}
                      readOnly
                      className="w-5 h-5 text-luxury-gold accent-amber-600"
                    />
                    <label htmlFor="vnpay-radio" className="font-bold text-lg text-primary-900 cursor-pointer">
                      Cổng Thanh Toán Trực Tuyến VNPAY
                    </label>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
                    Chính Thức
                  </span>
                </div>

                <p className="text-sm text-primary-700 mb-4 leading-relaxed">
                  Thanh toán an toàn & nhanh chóng qua cổng thanh toán VNPAY. Hỗ trợ quét mã VNPAY-QR bằng ứng dụng ngân hàng, thẻ ATM nội địa tất cả các ngân hàng, và thẻ thanh toán quốc tế Visa/Mastercard/JCB.
                </p>

                {/* Method Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="bg-white p-3 rounded-lg border border-primary-200 flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-primary-900">VNPAY-QR</div>
                      <div className="text-[11px] text-primary-500">Quét mã qua App Ngân hàng</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-primary-200 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-primary-900">Thẻ ATM / Tài Khoản</div>
                      <div className="text-[11px] text-primary-500">Hơn 40 ngân hàng nội địa</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-primary-200 flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-primary-900">Thẻ Quốc Tế</div>
                      <div className="text-[11px] text-primary-500">Visa, MasterCard, JCB</div>
                    </div>
                  </div>
                </div>

                {/* Optional Bank Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-primary-700 mb-2">
                    Chọn nhanh kênh thanh toán trên VNPAY (không bắt buộc):
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="form-input text-sm bg-white font-medium"
                  >
                    <option value="NCB">Ngân hàng NCB (Thẻ thử nghiệm Sandbox - Khuyên dùng)</option>
                    <option value="VNBANK">Thẻ ATM / Tài khoản ngân hàng nội địa</option>
                    <option value="INTCARD">Thẻ thanh toán quốc tế (Visa, MasterCard, JCB)</option>
                    <option value="VNPAYQR">Cổng VNPAY-QR</option>
                  </select>
                </div>

                {/* Sandbox Test Credentials Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900">
                  <div className="flex items-center font-bold mb-1.5 text-blue-800">
                    <Info className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>Thông tin thẻ kiểm thử môi trường VNPAY Sandbox:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 font-mono text-[11px] text-blue-950">
                    <div><strong>Ngân hàng:</strong> NCB</div>
                    <div><strong>Số thẻ:</strong> 9704198526191432198</div>
                    <div><strong>Tên chủ thẻ:</strong> NGUYEN VAN A</div>
                    <div><strong>Ngày phát hành:</strong> 07/15</div>
                    <div><strong>Mật khẩu OTP:</strong> 123456</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleVNPayPayment}
                disabled={loading || existingBooking?.status === 'CONFIRMED' || existingBooking?.status === 'CANCELLED'}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    <span>Đang Tạo Đơn & Chuyển Đến VNPAY...</span>
                  </>
                ) : (
                  <>
                    <span>Thanh Toán Qua VNPAY • {Number(totalPrice).toLocaleString('vi-VN')} đ</span>
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              {currentBookingId && existingBooking?.status !== 'CANCELLED' && existingBooking?.status !== 'CONFIRMED' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    disabled={loading}
                    className="text-xs text-red-600 hover:text-red-800 underline font-semibold inline-flex items-center space-x-1 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Hủy đơn #{currentBookingId} để giải phóng phòng</span>
                  </button>
                </div>
              )}

              {/* Security Footnote */}
              <div className="flex items-center justify-center space-x-2 text-xs text-primary-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Bảo mật giao dịch tiêu chuẩn quốc tế PCI DSS & mã hóa SSL 256-bit</span>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-primary-900 mb-1">{activeBooking.hotelName || activeBooking.hotel?.name || 'Khách Sạn Luxury'}</h3>
                <p className="text-sm text-primary-600 mb-2">
                  {activeBooking.roomNumber || activeBooking.roomTypeName ? `Phòng ${activeBooking.roomNumber || ''} (${activeBooking.roomType || activeBooking.roomTypeName || ''})` : 'Phòng tiêu chuẩn'}
                </p>
                <p className="text-xs text-primary-500">
                  {checkIn && checkOut
                    ? `${new Date(checkIn).toLocaleDateString('vi-VN')} → ${new Date(checkOut).toLocaleDateString('vi-VN')}`
                    : 'Chưa chọn ngày'
                  }
                </p>
                <p className="text-xs text-primary-500 mt-1">
                  Số khách: {activeBooking.guests || 1} khách
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-primary-600">Thời gian lưu trú</span>
                  <span className="font-semibold">{nights} đêm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Thuế VAT (10%)</span>
                  <span className="font-semibold text-green-600">Đã bao gồm</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Tổng Cộng</span>
                <span className="text-2xl font-bold text-luxury-gold">
                  {Number(totalPrice).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">
                  ✓ Hoàn tiền nếu hủy trước 24 giờ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
