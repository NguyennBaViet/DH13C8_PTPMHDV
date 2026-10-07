import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const bookingData = location.state || {}
  
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  })

  const checkIn = bookingData.checkIn || ''
  const checkOut = bookingData.checkOut || ''
  const nights = bookingData.nights || 0
  const totalPrice = bookingData.totalPrice || 7500000

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => navigate('/my-bookings'), 2000)
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-luxury p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Thanh Toán Thành Công!</h2>
          <p className="text-primary-600">Đơn đặt phòng của bạn đã được xác nhận. Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Thanh Toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="card-luxury p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Phương Thức Thanh Toán</h2>

              <div className="space-y-4 mb-8">
                <label className="flex items-center p-4 border-2 border-luxury-gold rounded-lg cursor-pointer bg-luxury-gold bg-opacity-5">
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

                <label className="flex items-center p-4 border-2 border-primary-200 rounded-lg cursor-pointer hover:border-primary-300">
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

                <label className="flex items-center p-4 border-2 border-primary-200 rounded-lg cursor-pointer hover:border-primary-300">
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-2xl">💳</span>
                  <span className="ml-3 font-semibold">Ví Điện Tử</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">Tên Chủ Thẻ</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Nhập tên trên thẻ"
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
                      placeholder="1234 5678 9012 3456"
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
                        placeholder="MM/YY"
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
                    className="btn-primary w-full text-lg"
                  >
                    {loading ? 'Đang Xử Lý...' : `Thanh Toán ${(totalPrice / 1000000).toFixed(1)}M`}
                  </button>
                </form>
              )}

              {paymentMethod === 'bank' && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-primary-900 mb-4">Thông Tin Chuyển Khoản</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Ngân hàng:</strong> Vietcombank</div>
                    <div><strong>Số TK:</strong> 1234567890</div>
                    <div><strong>Tên TK:</strong> Mois Hotel JSC</div>
                    <div><strong>Nội dung:</strong> BOOKING_{bookingId}</div>
                  </div>
                  <button className="btn-primary w-full mt-6">
                    Tôi Đã Chuyển Khoản
                  </button>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="text-center py-8">
                  <p className="text-primary-600 mb-4">Chọn ví điện tử của bạn:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5">
                      <span className="text-3xl block mb-2">💳</span>
                      <span className="text-sm font-semibold">Momo</span>
                    </button>
                    <button className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5">
                      <span className="text-3xl block mb-2">💰</span>
                      <span className="text-sm font-semibold">ZaloPay</span>
                    </button>
                    <button className="py-4 border-2 border-primary-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold hover:bg-opacity-5">
                      <span className="text-3xl block mb-2">🏦</span>
                      <span className="text-sm font-semibold">PayPal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt</h2>

              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-primary-900 mb-1">{bookingData.hotelName || 'Mois Hotel'}</h3>
                <p className="text-sm text-primary-600">
                  {bookingData.roomNumber ? `Phòng ${bookingData.roomNumber} (${bookingData.roomType || ''})` : 'Phòng tiêu chuẩn'} · {checkIn && checkOut 
                    ? `${new Date(checkIn).toLocaleDateString('vi-VN')} - ${new Date(checkOut).toLocaleDateString('vi-VN')}`
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-primary-600">Giá phòng ({nights} đêm)</span>
                  <span className="font-semibold">{nights > 0 ? `${(totalPrice / 1000000).toFixed(1)}M` : '0M'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Thuế & Phí</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-lg">Tổng Cộng</span>
                <span className="text-2xl font-bold text-luxury-gold">{nights > 0 ? `${(totalPrice / 1000000).toFixed(1)}M` : '0M'}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">
                  ✓ Hoàn tiền 100% nếu hủy trong 24 giờ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
