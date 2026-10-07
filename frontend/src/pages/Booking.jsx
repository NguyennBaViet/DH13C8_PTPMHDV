import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { MapPin, AlertCircle, Calendar, User, Mail, Phone, FileText, ArrowLeft, BedDouble } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import roomService from '../services/roomService'

export default function Booking() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    checkIn: location.state?.checkIn || '',
    checkOut: location.state?.checkOut || '',
    guests: location.state?.guests || 1,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  })

  // Tự động điền thông tin tài khoản khi user đăng nhập
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }))
    }
  }, [user])

  // Tải thông tin phòng cố định theo roomId từ URL
  useEffect(() => {
    let isMounted = true

    const fetchRoom = async () => {
      if (!roomId) {
        if (isMounted) {
          setError('Không tìm thấy mã phòng. Vui lòng chọn phòng từ danh sách khách sạn.')
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)
        const roomData = await roomService.getRoomById(roomId)
        if (isMounted) {
          if (roomData) {
            setRoom(roomData)
          } else {
            setError('Không tìm thấy phòng yêu cầu')
          }
        }
      } catch (err) {
        console.error('Error fetching room details:', err)
        if (isMounted) {
          setError('Không thể tải thông tin phòng: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRoom()

    return () => {
      isMounted = false
    }
  }, [roomId])

  const roomPrice = room?.pricePerNight || 0

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn)
      const end = new Date(formData.checkOut)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
    return 0
  }

  const nights = calculateNights()
  const totalPrice = roomPrice * nights

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const isRoomActive = room ? (room.isActive !== undefined ? room.isActive : (room.active !== undefined ? room.active : true)) : true

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!room) {
      setError('Thông tin phòng không hợp lệ')
      return
    }

    if (!isRoomActive) {
      setError('Phòng này hiện đang tạm ngưng phục vụ hoặc bảo trì. Vui lòng chọn phòng khác.')
      return
    }

    if (!formData.checkIn || !formData.checkOut) {
      setError('Vui lòng chọn ngày nhận phòng và ngày trả phòng')
      return
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setError('Ngày trả phòng phải sau ngày nhận phòng')
      return
    }

    navigate(`/payment/${room.id}`, {
      state: {
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        hotelId: room.hotelId,
        hotelName: room.hotelName,
        hotelCity: room.hotelCity,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        roomPrice: roomPrice,
        nights: nights,
        totalPrice: totalPrice
      }
    })
  }

  return (
    <div className="min-h-screen bg-primary-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-primary-100 text-primary-700 transition"
            title="Quay lại"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-primary-900">Đặt Phòng</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 card-luxury">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent mb-4"></div>
            <p className="text-primary-600 text-lg">Đang tải thông tin phòng...</p>
          </div>
        ) : !room ? (
          <div className="card-luxury p-12 text-center max-w-lg mx-auto">
            <BedDouble size={48} className="mx-auto text-primary-400 mb-4" />
            <h2 className="text-2xl font-bold text-primary-900 mb-2">Không Tìm Thấy Phòng</h2>
            <p className="text-primary-600 mb-6">
              Không thể tải thông tin phòng bạn đã chọn. Vui lòng quay lại danh sách khách sạn để chọn phòng.
            </p>
            <Link to="/hotels" className="btn-primary inline-block">
              Xem Danh Sách Khách Sạn
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Đặt Phòng */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="card-luxury p-8 space-y-6">
                {/* Thông tin phòng đã chọn cố định */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary-900">{room.hotelName || 'Khách Sạn'}</h2>
                    <p className="text-luxury-gold font-semibold text-lg">Phòng {room.roomNumber} ({room.roomType})</p>
                    {room.hotelCity && (
                      <p className="text-sm text-primary-600 flex items-center mt-1">
                        <MapPin size={14} className="mr-1 text-luxury-gold" />
                        {room.hotelCity}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-luxury-gold">
                      {(roomPrice / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-primary-500">/đêm · Sức chứa {room.capacity || 2} khách</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center space-x-1">
                      <Calendar size={16} className="text-luxury-gold" />
                      <span>Ngày Nhận Phòng</span>
                    </label>
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
                    <label className="form-label flex items-center space-x-1">
                      <Calendar size={16} className="text-luxury-gold" />
                      <span>Ngày Trả Phòng</span>
                    </label>
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
                  <label className="form-label flex items-center space-x-1">
                    <User size={16} className="text-luxury-gold" />
                    <span>Số Khách</span>
                  </label>
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
                  <label className="form-label flex items-center space-x-1">
                    <User size={16} className="text-luxury-gold" />
                    <span>Họ Và Tên</span>
                  </label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label flex items-center space-x-1">
                      <Mail size={16} className="text-luxury-gold" />
                      <span>Email</span>
                    </label>
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
                    <label className="form-label flex items-center space-x-1">
                      <Phone size={16} className="text-luxury-gold" />
                      <span>Số Điện Thoại</span>
                    </label>
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
                  <label className="form-label flex items-center space-x-1">
                    <FileText size={16} className="text-luxury-gold" />
                    <span>Yêu Cầu Đặc Biệt</span>
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nhập các yêu cầu đặc biệt (tùy chọn)"
                    rows="3"
                  />
                </div>

                {!isRoomActive && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center space-x-2 text-sm">
                    <AlertCircle size={18} className="flex-shrink-0 text-amber-600" />
                    <span>Phòng này hiện đang tạm ngưng phục vụ (bảo trì). Bạn không thể tiến hành đặt phòng này.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!room || loading || !isRoomActive}
                >
                  {isRoomActive ? 'Tiếp Tục Thanh Toán' : 'Phòng Tạm Ngưng Phục Vụ'}
                </button>
              </form>
            </div>

            {/* Cột Tóm Tắt Chi Phí */}
            <div className="md:col-span-1">
              <div className="card-luxury p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-primary-900 mb-1">{room.hotelName || 'Khách sạn'}</h3>
                  <p className="text-sm font-semibold text-luxury-gold mb-1">Phòng {room.roomNumber}</p>
                  <p className="text-sm text-primary-600 mb-1">Loại: {room.roomType}</p>
                  {room.capacity && (
                    <p className="text-sm text-primary-600">Sức chứa: {room.capacity} khách</p>
                  )}
                  {room.hotelCity && (
                    <div className="flex items-center text-sm text-primary-600 mt-2">
                      <MapPin size={14} className="mr-1 text-luxury-gold" />
                      <span>{room.hotelCity}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-primary-600">Nhận phòng</span>
                    <span className="font-semibold">
                      {formData.checkIn ? new Date(formData.checkIn).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Trả phòng</span>
                    <span className="font-semibold">
                      {formData.checkOut ? new Date(formData.checkOut).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600">Số đêm</span>
                    <span className="font-semibold">{nights} đêm</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {nights > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-primary-600">{(roomPrice / 1000000).toFixed(1)}M × {nights} đêm</span>
                        <span className="font-semibold">{(totalPrice / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Thuế & Phí</span>
                        <span className="font-semibold text-green-600">Đã bao gồm</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded text-center">
                      Vui lòng chọn ngày để tính giá
                    </p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-lg">Tổng Cộng</span>
                    <span className="text-2xl font-bold text-luxury-gold">
                      {nights > 0 ? `${(totalPrice / 1000000).toFixed(1)}M` : 'Chưa tính'}
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 text-center">
                    ✓ Hoàn tiền 100% nếu hủy trước 24 giờ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
