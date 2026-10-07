import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, AlertCircle, ArrowLeft, BedDouble, CheckCircle } from 'lucide-react'
import hotelService from '../services/hotelService'
import roomService from '../services/roomService'

export default function HotelDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [selectedDates, setSelectedDates] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || ''
  })
  const [unavailableRoomIds, setUnavailableRoomIds] = useState(new Set())
  const [todayOccupiedRoomIds, setTodayOccupiedRoomIds] = useState(new Set())
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // 1. Tải thông tin khách sạn và danh sách phòng
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        setError(null)

        const [hotelData, roomsData, availableToday] = await Promise.all([
          hotelService.getHotelById(id).catch(err => {
            console.warn('Lỗi tải khách sạn:', err)
            return null
          }),
          roomService.getRoomsByHotelId(id).catch(err => {
            console.warn('Lỗi tải phòng theo khách sạn:', err)
            return []
          }),
          roomService.searchRooms({ hotelId: id, checkInDate: todayStr, checkOutDate: tomorrowStr, page: 0, size: 100 }).catch(() => [])
        ])

        if (isMounted) {
          if (hotelData) {
            setHotel(hotelData)
          } else {
            setError('Không tìm thấy thông tin khách sạn này.')
          }
          const roomList = roomsData || []
          setRooms(roomList)

          // Xác định các phòng đang có khách hôm nay
          const availTodayIds = new Set((availableToday || []).map(r => r.id))
          const occupiedToday = new Set(roomList.filter(r => (r.active ?? r.isActive ?? true) && !availTodayIds.has(r.id)).map(r => r.id))
          setTodayOccupiedRoomIds(occupiedToday)
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết khách sạn:', err)
        if (isMounted) {
          setError('Không thể tải thông tin khách sạn: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [id, todayStr, tomorrowStr])

  // 2. Kiểm tra tình trạng phòng theo ngày lưu trú được chọn
  useEffect(() => {
    if (!id || !selectedDates.checkIn || !selectedDates.checkOut) {
      setUnavailableRoomIds(new Set())
      return
    }

    if (new Date(selectedDates.checkIn) >= new Date(selectedDates.checkOut)) {
      return
    }

    let isCurrent = true
    setCheckingAvailability(true)

    roomService.searchRooms({
      hotelId: id,
      checkInDate: selectedDates.checkIn,
      checkOutDate: selectedDates.checkOut,
      page: 0,
      size: 100
    })
      .then(availableRooms => {
        if (!isCurrent) return
        const availableIds = new Set((availableRooms || []).map(r => r.id))
        const bookedIds = new Set(rooms.filter(r => !availableIds.has(r.id)).map(r => r.id))
        setUnavailableRoomIds(bookedIds)
      })
      .catch(err => {
        console.warn('Lỗi kiểm tra phòng theo ngày:', err)
      })
      .finally(() => {
        if (isCurrent) setCheckingAvailability(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id, selectedDates.checkIn, selectedDates.checkOut, rooms])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="card-luxury p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-primary-600 font-semibold">Đang tải thông tin khách sạn và danh sách phòng...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-primary-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="card-luxury p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Đã Xảy Ra Lỗi</h2>
            <p className="text-primary-600 mb-6">{error || 'Không tìm thấy khách sạn'}</p>
            <Link to="/hotels" className="btn-primary inline-flex items-center space-x-2">
              <ArrowLeft size={18} />
              <span>Quay Lại Danh Sách Khách Sạn</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const hasSelectedDates = selectedDates.checkIn && selectedDates.checkOut && (new Date(selectedDates.checkIn) < new Date(selectedDates.checkOut))

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div 
        className="relative bg-gradient-to-r from-luxury-gold to-primary-800 text-white py-14"
        style={hotel.coverImage ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${hotel.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/hotels" className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-4 text-sm transition">
            <ArrowLeft size={16} />
            <span>Tất cả khách sạn</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4 drop-shadow">{hotel.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
            <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              {[...Array(hotel.starRating || 5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" className="text-yellow-400" />
              ))}
              <span className="ml-2 font-bold">{hotel.starRating || 5}.0 Sao</span>
            </div>
            <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <MapPin size={18} className="text-luxury-gold" />
              <span className="ml-2">{hotel.address ? `${hotel.address}, ` : ''}{hotel.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Description */}
            <div className="card-luxury p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-primary-900">Về Khách Sạn</h2>
              <p className="text-primary-700 leading-relaxed mb-4">{hotel.description}</p>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="card-luxury p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-primary-900">Tiện Ích Khách Sạn</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((a) => (
                    <div key={a.id || a.name} className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                      <span className="text-xl">✨</span>
                      <span className="text-primary-900 font-semibold text-sm">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bộ Lọc Ngày Lưu Trú */}
            <div className="card-luxury p-5 mb-8 border-2 border-luxury-gold/30 bg-gradient-to-r from-amber-50/50 to-white">
              <h3 className="text-base font-bold text-primary-900 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-luxury-gold" />
                <span>Chọn ngày lưu trú để kiểm tra phòng trống:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">Ngày Nhận Phòng</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDates.checkIn}
                    onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="form-input text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary-700 mb-1">Ngày Trả Phòng</label>
                  <input
                    type="date"
                    min={selectedDates.checkIn || todayStr}
                    value={selectedDates.checkOut}
                    onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="form-input text-sm w-full"
                  />
                </div>
              </div>
              {hasSelectedDates && (
                <div className="mt-3 flex items-center justify-between text-xs text-primary-600 pt-2 border-t border-primary-100">
                  <span>
                    Khoảng thời gian:{' '}
                    <strong>{new Date(selectedDates.checkIn).toLocaleDateString('vi-VN')}</strong> →{' '}
                    <strong>{new Date(selectedDates.checkOut).toLocaleDateString('vi-VN')}</strong>
                  </span>
                  {checkingAvailability ? (
                    <span className="text-blue-600 animate-pulse">Đang kiểm tra phòng...</span>
                  ) : (
                    <button
                      onClick={() => setSelectedDates({ checkIn: '', checkOut: '' })}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Xóa ngày chọn
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Rooms */}
            <div className="card-luxury p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-900">Danh Sách Loại Phòng</h2>
                <span className="text-primary-600 text-sm">Tìm thấy {rooms.length} phòng</span>
              </div>

              {rooms.length === 0 ? (
                <div className="text-center py-8 bg-primary-50 rounded-lg">
                  <BedDouble className="w-12 h-12 text-primary-400 mx-auto mb-2" />
                  <p className="text-primary-600">Khách sạn này hiện chưa có phòng nào sẵn sàng.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rooms.map((room) => {
                    const isRoomActive = room.isActive !== undefined ? room.isActive : (room.active !== undefined ? room.active : true)
                    const isBookedForDates = hasSelectedDates && unavailableRoomIds.has(room.id)
                    const isOccupiedToday = !hasSelectedDates && todayOccupiedRoomIds.has(room.id)

                    return (
                      <div 
                        key={room.id} 
                        className={`border rounded-xl p-6 transition ${
                          !isRoomActive 
                            ? 'border-gray-200 bg-gray-50 opacity-75'
                            : isBookedForDates
                            ? 'border-red-200 bg-red-50/30'
                            : 'border-primary-200 hover:shadow-luxury hover:bg-primary-50/50'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div className="flex gap-4">
                            {room.image ? (
                              <img 
                                src={room.image} 
                                alt={room.roomNumber} 
                                className="w-24 h-24 object-cover rounded-lg border border-primary-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-lg">
                                #{room.roomNumber}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-primary-900">
                                  Phòng {room.roomNumber} - {room.roomType}
                                </h3>
                                {!isRoomActive ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                                    Tạm ngưng phục vụ
                                  </span>
                                ) : isBookedForDates ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                                    Đã kín chỗ ngày này
                                  </span>
                                ) : isOccupiedToday ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                    Đang có khách hôm nay
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                                    Còn phòng trống
                                  </span>
                                )}
                              </div>
                              <p className="text-primary-600 text-sm mt-1">{room.description || 'Không gian sang trọng đầy đủ tiện nghi'}</p>
                              {room.floor && (
                                <p className="text-xs text-primary-500 mt-1">Tầng: {room.floor}</p>
                              )}
                            </div>
                          </div>

                          <div className="text-left md:text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-luxury-gold">
                              {(room.pricePerNight || 0).toLocaleString('vi-VN')} VND
                            </p>
                            <p className="text-primary-600 text-xs">/ đêm (chưa gồm thuế)</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4 text-sm text-primary-600">
                          <div className="flex items-center space-x-1.5">
                            <Users size={16} />
                            <span>Tối đa {room.capacity || 2} khách</span>
                          </div>
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {room.amenities.map((a) => (
                              <span key={a.id || a.name} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">
                                {a.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-primary-100 flex items-center justify-between">
                          <span className="text-xs text-primary-500">
                            {isBookedForDates
                              ? '⚠️ Đã có người đặt trong thời gian bạn chọn'
                              : isOccupiedToday
                              ? 'ℹ️ Đang có khách hôm nay, có thể đặt trước các ngày tới'
                              : '✓ Sẵn sàng nhận khách'}
                          </span>

                          <div>
                            {!isRoomActive ? (
                              <button
                                disabled
                                className="px-6 py-2.5 bg-gray-200 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                              >
                                Phòng Đang Bảo Trì
                              </button>
                            ) : isBookedForDates ? (
                              <button
                                disabled
                                className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg text-sm font-semibold cursor-not-allowed border border-red-300"
                              >
                                Đã Kín Chỗ Ngày Này
                              </button>
                            ) : (
                              <Link
                                to={`/booking/${room.id}`}
                                state={{
                                  checkIn: selectedDates.checkIn,
                                  checkOut: selectedDates.checkOut
                                }}
                                className="btn-primary inline-flex items-center space-x-2 px-6 py-2.5"
                              >
                                <span>Đặt Phòng Ngay</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4 space-y-6">
              <h3 className="text-xl font-bold text-primary-900 border-b pb-3">Thông Tin Liên Hệ</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-primary-500 font-medium">Địa Chỉ Khách Sạn</p>
                  <p className="font-semibold text-primary-900 mt-0.5">
                    {hotel.address ? `${hotel.address}, ` : ''}{hotel.district ? `${hotel.district}, ` : ''}{hotel.city}
                  </p>
                </div>
                <div>
                  <p className="text-primary-500 font-medium">Số Điện Thoại</p>
                  <p className="font-semibold text-primary-900 mt-0.5">{hotel.phone || '024-3825-6920'}</p>
                </div>
                <div>
                  <p className="text-primary-500 font-medium">Email Hỗ Trợ</p>
                  <p className="font-semibold text-primary-900 mt-0.5">{hotel.email || 'support@mois.vn'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-primary-500 font-medium">Nhận Phòng</p>
                    <p className="font-bold text-primary-900 mt-0.5">Từ 14:00</p>
                  </div>
                  <div>
                    <p className="text-primary-500 font-medium">Trả Phòng</p>
                    <p className="font-bold text-primary-900 mt-0.5">Trước 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
