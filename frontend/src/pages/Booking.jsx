import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { MapPin, AlertCircle, Building, BedDouble, Calendar, User, Mail, Phone, FileText } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import roomService from '../services/roomService'
import hotelService from '../services/hotelService'

export default function Booking() {
  const { roomId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hotel and room selection states
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedHotel, setSelectedHotel] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)

  const [formData, setFormData] = useState({
    checkIn: location.state?.checkIn || '',
    checkOut: location.state?.checkOut || '',
    guests: location.state?.guests || 1,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  })

  // Update user fields when user state is loaded
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

  // Initial load: fetch hotels & room (if roomId is provided)
  useEffect(() => {
    let isMounted = true

    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Tải danh sách tất cả khách sạn
        setLoadingHotels(true)
        let hotelsData = []
        try {
          hotelsData = await hotelService.getAllHotels()
          if (isMounted) {
            setHotels(hotelsData || [])
          }
        } catch (err) {
          console.error('Error fetching hotels:', err)
        } finally {
          if (isMounted) setLoadingHotels(false)
        }

        // 2. Nếu có roomId trong URL (ví dụ: /booking/3)
        if (roomId) {
          try {
            const roomData = await roomService.getRoomById(roomId)
            if (isMounted && roomData) {
              setRoom(roomData)
              setSelectedRoom(String(roomData.id))

              const hotelIdVal = roomData.hotelId || roomData.hotel?.id
              if (hotelIdVal) {
                setSelectedHotel(String(hotelIdVal))
                setLoadingRooms(true)
                try {
                  const hotelRooms = await roomService.getRoomsByHotelId(hotelIdVal)
                  if (isMounted) {
                    setRooms(hotelRooms || [])
                  }
                } catch (rErr) {
                  console.error('Error fetching rooms by hotel:', rErr)
                } finally {
                  if (isMounted) setLoadingRooms(false)
                }
              }
            }
          } catch (roomErr) {
            console.error('Error fetching room details:', roomErr)
            if (isMounted) {
              setError('Không thể tìm thấy thông tin phòng yêu cầu. Bạn có thể chọn phòng khác bên dưới.')
            }
          }
        }
      } catch (generalErr) {
        console.error('Initialization error:', generalErr)
        if (isMounted) {
          setError('Lỗi khi tải dữ liệu trang đặt phòng: ' + generalErr.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeData()

    return () => {
      isMounted = false
    }
  }, [roomId])

  // Khi người dùng đổi khách sạn
  const handleHotelChange = async (hotelId) => {
    setSelectedHotel(hotelId)
    setSelectedRoom('')
    setRoom(null)
    setRooms([])

    if (!hotelId) return

    try {
      setLoadingRooms(true)
      const hotelRooms = await roomService.getRoomsByHotelId(hotelId)
      setRooms(hotelRooms || [])
    } catch (err) {
      console.error('Error fetching rooms by hotel:', err)
      setError('Lỗi tải danh sách phòng: ' + err.message)
    } finally {
      setLoadingRooms(false)
    }
  }

  // Khi người dùng đổi phòng
  const handleRoomChange = async (rId) => {
    setSelectedRoom(rId)
    if (!rId) {
      setRoom(null)
      return
    }

    try {
      setLoading(true)
      const roomData = await roomService.getRoomById(rId)
      setRoom(roomData)
    } catch (err) {
      console.error('Error fetching room details:', err)
      setError('Lỗi tải thông tin phòng: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedRoom || !room) {
      setError('Vui lòng chọn phòng cần đặt')
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

    navigate(`/payment/${selectedRoom}`, {
      state: {
        roomId: selectedRoom,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        hotelId: room.hotelId || selectedHotel,
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
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Đặt Phòng</h1>

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

        {loading && !room && roomId ? (
          <div className="text-center py-16 card-luxury">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent mb-4"></div>
            <p className="text-primary-600 text-lg">Đang tải thông tin phòng...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="card-luxury p-8 space-y-6">
                {/* Hotel and Room Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-6 mb-6">
                  <div>
                    <label className="form-label flex items-center space-x-1">
                      <Building size={16} className="text-luxury-gold" />
                      <span>Chọn Khách Sạn</span>
                    </label>
                    <select
                      value={selectedHotel}
                      onChange={(e) => handleHotelChange(e.target.value)}
                      className="form-input"
                      disabled={loadingHotels}
                      required
                    >
                      <option value="">-- Chọn Khách Sạn --</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name || hotel.hotelName} {hotel.city ? `(${hotel.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label flex items-center space-x-1">
                      <BedDouble size={16} className="text-luxury-gold" />
                      <span>Chọn Phòng</span>
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="form-input"
                      disabled={!selectedHotel || loadingRooms}
                      required
                    >
                      <option value="">-- Chọn Phòng --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Phòng {r.roomNumber} ({r.roomType}) - {(r.pricePerNight ? (r.pricePerNight / 1000000).toFixed(1) : 0)}M/đêm
                        </option>
                      ))}
                    </select>
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

                <button
                  type="submit"
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!room || !selectedRoom || loading}
                >
                  Tiếp Tục Thanh Toán
                </button>
              </form>
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="card-luxury p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

                {room ? (
                  <>
                    {/* Room Info */}
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
                  </>
                ) : (
                  <div className="bg-primary-50 rounded-lg p-6 text-center text-primary-600">
                    <BedDouble size={40} className="mx-auto text-primary-400 mb-3" />
                    <p className="font-semibold text-primary-800 mb-1">Chưa chọn phòng</p>
                    <p className="text-sm">Vui lòng chọn khách sạn và phòng bên cạnh để xem giá và chi tiết đơn.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
