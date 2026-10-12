import React, { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader, ArrowRight, Home, Calendar, RotateCw, XCircle, RefreshCw } from 'lucide-react'
import paymentService from '../services/paymentService'
import bookingService from '../services/bookingService'

export default function VNPayReturn() {
  const location = useLocation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [bookingDetail, setBookingDetail] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('')

  useEffect(() => {
    const processReturn = async () => {
      const searchParams = new URLSearchParams(location.search)
      const params = Object.fromEntries(searchParams.entries())

      if (!params.vnp_ResponseCode && !params.vnp_TxnRef) {
        setLoading(false)
        setSuccess(false)
        setErrorMessage('Không tìm thấy thông tin phản hồi từ cổng thanh toán VNPAY.')
        return
      }

      const responseCode = params.vnp_ResponseCode
      const rawAmount = params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0
      const parsedBookingId = params.vnp_TxnRef?.split('_')[0]

      try {
        const res = await paymentService.verifyVNPayCallback(params)

        const finalBookingId = res.data?.bookingId || parsedBookingId
        if (res.success && responseCode === '00') {
          setSuccess(true)
          setResultData({
            bookingId: finalBookingId,
            transactionNo: params.vnp_TransactionNo || res.data?.transactionId,
            txnRef: params.vnp_TxnRef,
            amount: rawAmount || res.data?.amount,
            bankCode: params.vnp_BankCode,
            payDate: params.vnp_PayDate,
            message: res.data?.message || 'Giao dịch thành công'
          })
        } else {
          setSuccess(false)
          setResultData({
            bookingId: finalBookingId,
            transactionNo: params.vnp_TransactionNo || 'N/A',
            txnRef: params.vnp_TxnRef,
            amount: rawAmount,
            bankCode: params.vnp_BankCode,
            responseCode: responseCode
          })
          setErrorMessage(res.error || res.data?.message || getVNPayErrorMessage(responseCode))

          // Lấy thông tin phòng để người dùng có thể dễ dàng đặt lại nếu hủy
          if (finalBookingId) {
            bookingService.getBookingById(finalBookingId).then(bRes => {
              if (bRes.success && bRes.data) {
                setBookingDetail(bRes.data)
              }
            }).catch(() => {})
          }
        }
      } catch (err) {
        setSuccess(false)
        setErrorMessage(err.message || 'Lỗi đối soát chữ ký giao dịch với máy chủ.')
      } finally {
        setLoading(false)
      }
    }

    processReturn()
  }, [location.search])

  const getVNPayErrorMessage = (code) => {
    switch (code) {
      case '07':
        return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).'
      case '09':
        return 'Giao dịch không thành công: Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.'
      case '10':
        return 'Giao dịch không thành công: Khách hàng xác thực thông tin thẻ/tài khoản sai quá 3 lần.'
      case '11':
        return 'Giao dịch không thành công: Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại.'
      case '12':
        return 'Giao dịch không thành công: Thẻ/Tài khoản của bạn đã bị khóa.'
      case '13':
        return 'Giao dịch không thành công: Bạn đã nhập sai mật khẩu xác thực OTP.'
      case '24':
        return 'Giao dịch đã bị hủy bởi khách hàng.'
      case '51':
        return 'Giao dịch không thành công: Tài khoản của bạn không đủ số dư để thanh toán.'
      case '65':
        return 'Giao dịch không thành công: Tài khoản đã vượt quá hạn mức thanh toán trong ngày.'
      case '75':
        return 'Ngân hàng thanh toán đang tạm thời bảo trì.'
      case '79':
        return 'Giao dịch không thành công: Nhập sai mật khẩu thanh toán quá số lần quy định.'
      default:
        return `Giao dịch không thành công qua VNPAY (Mã lỗi: ${code || 'N/A'}).`
    }
  }

  const formatVnpDate = (str) => {
    if (!str || str.length < 14) return new Date().toLocaleString('vi-VN')
    const y = str.substring(0, 4)
    const m = str.substring(4, 6)
    const d = str.substring(6, 8)
    const h = str.substring(8, 10)
    const min = str.substring(10, 12)
    const s = str.substring(12, 14)
    return `${h}:${min}:${s} ${d}/${m}/${y}`
  }

  const handleRetryPayment = async () => {
    if (!resultData?.bookingId) {
      alert('Không tìm thấy thông tin đơn đặt phòng để thanh toán lại.')
      return
    }
    setRetrying(true)
    try {
      const vnpayRes = await paymentService.createVNPayPayment({
        bookingId: resultData.bookingId,
        amount: resultData.amount,
        bankCode: resultData.bankCode || 'NCB',
        returnUrl: `${window.location.origin}/payment/vnpay-return`
      })
      if (vnpayRes.success && vnpayRes.data?.checkoutUrl) {
        window.location.href = vnpayRes.data.checkoutUrl
      } else {
        alert(vnpayRes.error || 'Khởi tạo phiên thanh toán mới thất bại.')
        setRetrying(false)
      }
    } catch (err) {
      alert(err.message || 'Lỗi kết nối cổng thanh toán VNPAY')
      setRetrying(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!resultData?.bookingId) return
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn hủy đơn đặt phòng này? Phòng sẽ được giải phóng ngay lập tức để bạn hoặc người khác có thể đặt lại.'
    )
    if (!confirmed) return

    setCancelling(true)
    try {
      const cancelRes = await bookingService.cancelBooking(
        resultData.bookingId,
        'Khách hàng hủy thanh toán qua cổng VNPAY'
      )
      if (cancelRes.success) {
        setCancelSuccessMsg(`Đã hủy đơn đặt phòng #${resultData.bookingId} và giải phóng phòng thành công!`)
      } else {
        alert(cancelRes.error || 'Hủy đơn thất bại. Vui lòng thử lại.')
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi hủy đơn đặt phòng')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-luxury p-8 w-full max-w-md text-center">
          <Loader className="w-12 h-12 animate-spin text-luxury-gold mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-900 mb-2">Đang xác thực giao dịch VNPAY...</h2>
          <p className="text-sm text-primary-600">Vui lòng không tắt hoặc tải lại trang trong khi hệ thống đang xử lý.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-luxury overflow-hidden">
          {/* Header Banner */}
          <div className={`p-6 text-white text-center ${success ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-rose-600 to-amber-700'}`}>
            {success ? (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-2 text-white" />
                <h1 className="text-2xl font-bold">Thanh Toán VNPAY Thành Công!</h1>
                <p className="text-emerald-100 text-sm mt-1">Giao dịch thanh toán phòng khách sạn đã được ghi nhận</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 mx-auto mb-2 text-white" />
                <h1 className="text-2xl font-bold">Thanh Toán Không Thành Công</h1>
                <p className="text-rose-100 text-sm mt-1">Giao dịch qua VNPAY bị gián đoạn hoặc thất bại</p>
              </>
            )}
          </div>

          {/* Details Body */}
          <div className="p-8">
            {success ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-900 text-sm">
                  <p className="font-semibold mb-1">✓ Trạng thái đặt phòng: Đã ghi nhận thanh toán & Chờ duyệt</p>
                  <p className="text-xs text-emerald-700">
                    Cảm ơn quý khách! Đơn đặt phòng và thanh toán của bạn đã hoàn tất an toàn qua VNPAY. Email xác nhận đã được gửi đến hòm thư của bạn.
                  </p>
                </div>

                <div className="border border-primary-200 rounded-lg p-5 space-y-3 bg-primary-50">
                  <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-2 border-b border-primary-200 pb-2">
                    Chi Tiết Giao Dịch VNPAY
                  </h3>

                  {resultData?.bookingId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Mã Đơn Đặt Phòng:</span>
                      <span className="font-bold text-primary-900">#{resultData.bookingId}</span>
                    </div>
                  )}

                  {resultData?.transactionNo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Mã Giao Dịch VNPAY:</span>
                      <span className="font-mono font-semibold text-primary-900">{resultData.transactionNo}</span>
                    </div>
                  )}

                  {resultData?.amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Số Tiền Thanh Toán:</span>
                      <span className="font-bold text-luxury-gold text-base">
                        {Number(resultData.amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}

                  {resultData?.bankCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Ngân Hàng / Kênh:</span>
                      <span className="font-semibold text-primary-800">{resultData.bankCode}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Thời Gian Giao Dịch:</span>
                    <span className="text-primary-800">{formatVnpDate(resultData?.payDate)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">Cổng Thanh Toán:</span>
                    <span className="font-semibold text-blue-700">VNPAY (Trực Tuyến)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/my-bookings"
                    className="btn-primary flex-1 py-3 text-center flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Xem Đơn Đặt Phòng Của Tôi</span>
                  </Link>

                  <Link
                    to="/"
                    className="border border-primary-300 hover:bg-primary-50 text-primary-700 font-semibold rounded-lg px-6 py-3 text-center flex items-center justify-center space-x-2 transition"
                  >
                    <Home className="w-4 h-4" />
                    <span>Về Trang Chủ</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <h3 className="font-bold mb-1">Lý do thất bại:</h3>
                  <p className="text-sm">{errorMessage}</p>
                </div>

                <div className="border border-primary-200 rounded-lg p-5 space-y-3 bg-primary-50">
                  <h3 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-2 border-b border-primary-200 pb-2">
                    Thông Tin Tham Chiếu
                  </h3>

                  {resultData?.bookingId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Mã Đơn Đặt Phòng:</span>
                      <span className="font-bold text-primary-900">#{resultData.bookingId}</span>
                    </div>
                  )}

                  {resultData?.transactionNo && resultData?.transactionNo !== 'N/A' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Mã Giao Dịch VNPAY:</span>
                      <span className="font-mono text-primary-800">{resultData.transactionNo}</span>
                    </div>
                  )}

                  {resultData?.amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Số Tiền:</span>
                      <span className="font-bold text-primary-900">
                        {Number(resultData.amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                </div>

                {cancelSuccessMsg ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 text-emerald-900 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{cancelSuccessMsg}</span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Phòng đã được mở khóa và trả về trạng thái trống. Bây giờ quý khách có thể tiến hành đặt lại phòng hoặc chọn ngày khác mà không gặp lỗi hết phòng.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {bookingDetail?.roomTypeId && (
                        <Link
                          to={`/booking/${bookingDetail.roomTypeId}`}
                          className="btn-primary py-2.5 px-4 text-center text-sm font-semibold flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Đặt Lại Phòng Này</span>
                        </Link>
                      )}
                      <Link
                        to="/hotels"
                        className="border border-primary-300 hover:bg-primary-100 text-primary-800 py-2.5 px-4 rounded-lg text-center text-sm font-semibold"
                      >
                        Khám Phá Khách Sạn Khác
                      </Link>
                      <Link
                        to="/"
                        className="border border-primary-300 hover:bg-primary-100 text-primary-800 py-2.5 px-4 rounded-lg text-center text-sm font-semibold flex items-center justify-center space-x-1"
                      >
                        <Home className="w-4 h-4" />
                        <span>Trang Chủ</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                      💡 <strong>Lưu ý:</strong> Phòng vẫn đang được giữ tạm trong 15 phút cho đơn này. Nếu quý khách không muốn đặt nữa, vui lòng nhấn <strong>"Hủy Đơn Đặt Phòng Này"</strong> để hệ thống giải phóng phòng ngay lập tức.
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={handleRetryPayment}
                        disabled={retrying || cancelling}
                        className="btn-primary flex-1 py-3 text-center flex items-center justify-center space-x-2 shadow"
                      >
                        {retrying ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Đang Kết Nối VNPAY...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw className="w-4 h-4" />
                            <span>Thanh Toán Lại Đơn Này</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelling || retrying}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-semibold rounded-lg px-4 py-3 text-center flex items-center justify-center space-x-2 transition"
                      >
                        {cancelling ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin text-red-600" />
                            <span>Đang Giải Phóng Phòng...</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>Hủy Đơn Này (Mở Lại Phòng)</span>
                          </>
                        )}
                      </button>

                      <Link
                        to="/my-bookings"
                        className="border border-primary-300 hover:bg-primary-50 text-primary-700 font-semibold rounded-lg px-4 py-3 text-center flex items-center justify-center space-x-2 transition"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Đơn Của Tôi</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

