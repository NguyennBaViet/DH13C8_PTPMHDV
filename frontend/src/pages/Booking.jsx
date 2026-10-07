import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
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

  // Fetch all hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoadingHotels(true)
        const hotelsData = await hotelService.getAllHotels()
        setHotels(hotelsData)
      } catch (err) {
        console.error('Error fetching hotels:', err)
        setError('Lỗi tải danh sách khách sạn: ' + err.message)
      } finally {
        setLoadingHotels(false)
      }
    }

    fetchHotels()
  }, [])

  // Fetch rooms when hotel is selected
  useEffect(() => {
    if (selectedHotel) {
      const fetchRoomsByHotel = async () => {
        try {
          setLoadingRooms(true)
          setRooms([])
          setSelectedRoom('')
          setRoom(null)
          
          const roomsData = await roomService.getRoomsByHotelId(selectedHotel)
          setRooms(roomsData)
        } catch (err) {
          console.error('Error fetching rooms:', err)
          setError('Lỗi tải danh sách phòng: ' + err.message)
        } finally {
          setLoadingRooms(false)
        }
      }

      fetchRoomsByHotel()
    }
  }, [selectedHotel])

  // Fetch room details when room is selected
  useEffect(() => {
    if (selectedRoom) {
      const fetchRoomDetails = async () => {
        try {
          setLoading(true)
          setError(null)
          
          const roomData = await roomService.getRoomById(selectedRoom)
          if (roomData) {
            setRoom(roomData)
          }
        } catch (err) {
          console.error('Error fetching room details:', err)
          setError('Lỗi tải thông tin phòng: ' + err.message)
        } finally {
          setLoading(false)
        }
      }

      fetchRoomDetails()
    }
  }, [selectedRoom])

  const roomPrice = room?.pricePerNight || 0
  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      return Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
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
    
    if (!selectedRoom) {
      setError('Vui lòng chọn phòng')
      return
    }

    navigate(`/payment/${selectedRoom}`, {
      state: {
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-primary-600">Đang tải thông tin phòng...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        ) : !room ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
            Không tìm thấy phòng để đặt
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="card-luxury p-8 space-y-6">
                {/* Hotel and Room Selection */}
                <div className="grid grid-cols-2 gap-4 border-b pb-6 mb-6">
                  <div>
                    <label className="form-label">Chọn Khách Sạn</label>
                    <select
                      value={selectedHotel}
                      onChange={(e) => setSelectedHotel(e.target.value)}
                      className="form-input"
                      disabled={loadingHotels}
                      required
                    >
                      <option value="">-- Chọn Khách Sạn --</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.hotelName} ({hotel.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Chọn Phòng</label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="form-input"
                      disabled={!selectedHotel || loadingRooms}
                      required
                    >
                      <option value="">-- Chọn Phòng --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Phòng {r.roomNumber} ({r.roomType}) - {(r.pricePerNight / 1000000).toFixed(1)}M/đêm
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Ngày Nhận Phòng</label>
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
                    <label className="form-label">Ngày Trả Phòng</label>
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
                  <label className="form-label">Số Khách</label>
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
                  <label className="form-label">Họ Và Tên</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Email</label>
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
                    <label className="form-label">Số Điện Thoại</label>
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
                  <label className="form-label">Yêu Cầu Đặc Biệt</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nhập các yêu cầu đặc biệt (tùy chọn)"
                    rows="4"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!room || loading}
                >
                  Tiếp Tục Thanh Toán
                </button>
              </form>
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="card-luxury p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6 text-primary-900">Tóm Tắt Đơn</h2>

                {/* Room Info */}
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-primary-900 mb-2">{room?.hotelName || 'Khách sạn'}</h3>
                  <p className="text-sm text-primary-600 mb-2">Phòng {room?.roomNumber}</p>
                  <p className="text-sm text-primary-600 mb-2">{room?.roomType}</p>
                  {room?.capacity && (
                    <p className="text-sm text-primary-600">Sức chứa: {room.capacity} khách</p>
                  )}
                  {room?.hotelCity && (
                    <div className="flex items-center text-sm text-primary-600 mt-2">
                      <MapPin size={14} className="mr-1" />
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
                    <span className="font-semibold">
                      {formData.checkIn && formData.checkOut 
                        ? Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
                        : 0} đêm
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {nights > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-primary-600">{(roomPrice / 1000000).toFixed(1)}M × {nights} đêm</span>
                        <span className="font-semibold">{(roomPrice * nights / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Thuế</span>
                        <span className="font-semibold">Miễn phí</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-primary-600 text-center">Vui lòng chọn ngày để tính giá</p>
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
                    Hoàn tiền 100% nếu hủy trong 24 giờ
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
