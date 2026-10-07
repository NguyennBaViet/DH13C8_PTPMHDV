import React, { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import bookingService from '../services/bookingService'
import paymentService from '../services/paymentService'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const bookingData = location.state || {}

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  })

  const checkIn = bookingData.checkIn || ''
  const checkOut = bookingData.checkOut || ''
  const nights = bookingData.nights || 1
  const totalPrice = bookingData.totalPrice || bookingData.roomPrice || 1200000

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleExecutePayment = async (method) => {
    setError('')
    setLoading(true)

    try {
      if (!bookingData.checkIn || !bookingData.checkOut) {
        setError('Thiếu thông tin ngày nhận/trả phòng. Vui lòng quay lại đặt phòng.')
        setLoading(false)
        return
      }

      // Format Vietnamese phone number
      let rawPhone = (bookingData.phone || user?.phone || '0912345678').replace(/\D/g, '')
      if (rawPhone.startsWith('84') && rawPhone.length === 11) {
        rawPhone = '0' + rawPhone.substring(2)
      } else if (!rawPhone.startsWith('0')) {
        rawPhone = '0' + rawPhone
      }
      if (rawPhone.length < 10 || rawPhone.length > 11) {
        rawPhone = '0912345678'
      }

      // 1. Tạo booking trên backend booking-service
      const bookingPayload = {
        hotelId: Number(bookingData.hotelId || 1),
        roomTypeId: Number(bookingData.roomId || bookingId || 1),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        rooms: 1,
        guests: Number(bookingData.guests) || 1,
        specialRequests: bookingData.specialRequests || 'Không có yêu cầu đặc biệt',
        contactName: bookingData.fullName || user?.fullName || user?.username || 'Khách Hàng',
        contactEmail: bookingData.email || user?.email || 'guest@example.com',
        contactPhone: rawPhone
      }

      const bookingRes = await bookingService.createBooking(bookingPayload)
      if (!bookingRes.success) {
        setError(bookingRes.error || 'Tạo đơn đặt phòng thất bại')
        setLoading(false)
        return
      }

      const createdBooking = bookingRes.data

      // 2. Tạo yêu cầu thanh toán trên payment-noti-service
      const methodEnum = method === 'bank' ? 'BANK_TRANSFER' : method === 'wallet' ? 'E_WALLET' : 'CREDIT_CARD'
      const paymentPayload = {
        bookingId: createdBooking.id,
        amount: createdBooking.totalPrice || totalPrice,
        currency: 'VND',
        paymentMethod: methodEnum
      }

      const paymentRes = await paymentService.createPayment(paymentPayload)
      if (!paymentRes.success) {
        setError(paymentRes.error || 'Khởi tạo thanh toán thất bại')
        setLoading(false)
        return
      }

      const createdPayment = paymentRes.data
      const paymentId = createdPayment.paymentId || createdPayment.id

      // 3. Xử lý thanh toán -> ghi nhận thanh toán và gửi thông báo
      const processRes = await paymentService.processPayment({
        paymentId: paymentId,
        simulateSuccess: true,
        paymentMethod: methodEnum
      })

      if (!processRes.success) {
        setError(processRes.error || 'Xử lý thanh toán thất bại')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        navigate('/my-bookings')
      }, 2500)

    } catch (err) {
      console.error('Payment flow error:', err)
      setError(err.message || 'Đã xảy ra lỗi trong quá trình thanh toán')
      setLoading(false)
    }
  }

  const handleSubmitCard = (e) => {
    e.preventDefault()
    handleExecutePayment('card')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-luxury p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Đặt Phòng Thành Công!</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-amber-900 font-semibold mb-1">Trạng thái: Chờ xác nhận</p>
            <p className="text-xs text-amber-700">
              Đơn đặt phòng của bạn đã được ghi nhận. Quản trị viên hoặc nhân viên khách sạn sẽ duyệt và xác nhận đơn của bạn trong thời gian sớm nhất.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-primary-500">
            <Loader className="w-4 h-4 animate-spin text-luxury-gold" />
            <span>Đang chuyển hướng sang Đơn Đặt Phòng Của Tôi...</span>
          </div>
        </div>
      </div>
    )
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

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Vui lòng <Link to="/login" className="font-bold underline">đăng nhập</Link> trước khi thanh toán để đơn đặt phòng được liên kết với tài khoản của bạn.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="card-luxury p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Phương Thức Thanh Toán</h2>

              <div className="space-y-4 mb-8">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-luxury-gold bg-luxury-gold bg-opacity-5' : 'border-primary-200 hover:border-primary-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <CreditCard className="ml-3 text-luxury-gold" />
                  <span className="ml-3 font-semibold">Thẻ Tín Dụng / Ghi Nợ</span>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${paymentMethod === 'bank' ? 'border-luxury-gold bg-luxury-gold bg-opacity-5' : 'border-primary-200 hover:border-primary-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <DollarSign className="ml-3" />
                  <span className="ml-3 font-semibold">Chuyển Khoản Ngân Hàng</span>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer ${paymentMethod === 'wallet' ? 'border-luxury-gold bg-luxury-gold bg-opacity-5' : 'border-primary-200 hover:border-primary-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-xl">💳</span>
                  <span className="ml-3 font-semibold">Ví Điện Tử (Momo / ZaloPay / PayPal)</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmitCard} className="space-y-6">
                  <div>
                    <label className="form-label">Tên Chủ Thẻ</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="NGUYEN VAN A"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Số Thẻ</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="4242 4242 4242 4242"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Hạn Sử Dụng</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="12/28"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">CVC</label>
                      <input
                        type="text"
                        name="cardCVC"
                        value={formData.cardCVC}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-lg flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        <span>Đang Xử Lý Đặt Phòng & Thanh Toán...</span>
                      </>
                    ) : (
                      <span>Thanh Toán {Number(totalPrice).toLocaleString('vi-VN')} đ</span>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'bank' && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-primary-900 mb-4">Thông Tin Chuyển Khoản Ngân Hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Ngân hàng:</strong> Vietcombank (Chi nhánh Hà Nội)</div>
                    <div><strong>Số tài khoản:</strong> 1234567890</div>
                    <div><strong>Tên tài khoản:</strong> CONG TY KHACH SAN LUXURY</div>
                    <div><strong>Số tiền:</strong> {Number(totalPrice).toLocaleString('vi-VN')} đ</div>
                    <div><strong>Nội dung CK:</strong> DATPHONG {bookingData.roomNumber || ''}</div>
                  </div>
                  <button
                    onClick={() => handleExecutePayment('bank')}
                    disabled={loading}
                    className="btn-primary w-full mt-6 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        <span>Đang Xác Nhận Đơn Đặt Phòng...</span>
                      </>
                    ) : (
                      <span>Tôi Đã Chuyển Khoản & Xác Nhận Đặt Phòng</span>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="text-center py-6">
                  <p className="text-primary-600 mb-4">Chọn ví điện tử để tiến hành thanh toán:</p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleExecutePayment('wallet')}
                      className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5 flex flex-col items-center justify-center transition"
                    >
                      <span className="text-3xl block mb-2">🌸</span>
                      <span className="text-sm font-semibold">MoMo</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleExecutePayment('wallet')}
                      className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5 flex flex-col items-center justify-center transition"
                    >
                      <span className="text-3xl block mb-2">⚡</span>
                      <span className="text-sm font-semibold">ZaloPay</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleExecutePayment('wallet')}
                      className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5 flex flex-col items-center justify-center transition"
                    >
                      <span className="text-3xl block mb-2">🏦</span>
                      <span className="text-sm font-semibold">PayPal</span>
                    </button>
                  </div>
                  {loading && (
                    <div className="flex items-center justify-center space-x-2 text-primary-600">
                      <Loader className="w-5 h-5 animate-spin text-luxury-gold" />
                      <span>Đang xử lý kết nối ví điện tử...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-primary-900 mb-1">{bookingData.hotelName || 'Khách Sạn Luxury'}</h3>
                <p className="text-sm text-primary-600 mb-2">
                  {bookingData.roomNumber ? `Phòng ${bookingData.roomNumber} (${bookingData.roomType || ''})` : 'Phòng tiêu chuẩn'}
                </p>
                <p className="text-xs text-primary-500">
                  {checkIn && checkOut 
                    ? `${new Date(checkIn).toLocaleDateString('vi-VN')} → ${new Date(checkOut).toLocaleDateString('vi-VN')}`
                    : 'Chưa chọn ngày'
                  }
                </p>
                <p className="text-xs text-primary-500 mt-1">
                  Số khách: {bookingData.guests || 1} khách
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
