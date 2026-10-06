import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Wifi, UtensilsCrossed, Zap, Users } from 'lucide-react'

export default function HotelDetail() {
  const { id } = useParams()

  const hotelData = {
    name: 'Mois Luxury Suite',
    city: 'Hồ Chí Minh',
    rating: 5.0,
    reviews: 324,
    description: 'Khách sạn 5 sao hàng đầu với dịch vụ vượt trội và tiện ích sang trọng',
    amenities: [
      { icon: '🏊', name: 'Bể Bơi Ngoài Trời' },
      { icon: '🍽️', name: 'Nhà Hàng Gourmet' },
      { icon: '💪', name: 'Phòng Gym Đầy Đủ' },
      { icon: '🛀', name: 'Spa & Sauna' },
      { icon: '📶', name: 'WiFi Miễn Phí' },
      { icon: '🚗', name: 'Dịch Vụ Đưa Đón' }
    ],
    rooms: [
      {
        id: 1,
        type: 'Phòng Đơn',
        capacity: 1,
        price: 1500000,
        description: 'Phòng với giường đơn, view thành phố',
        amenities: ['AC', 'TV', 'WiFi', 'Phòng Tắm Riêng']
      },
      {
        id: 2,
        type: 'Phòng Đôi',
        capacity: 2,
        price: 2500000,
        description: 'Phòng với giường đôi, view sông',
        amenities: ['AC', 'TV', 'WiFi', 'Ban Công', 'Minibar']
      },
      {
        id: 3,
        type: 'Suite Hạng Sang',
        capacity: 2,
        price: 5000000,
        description: 'Phòng Suite với trang thiết bị cao cấp',
        amenities: ['AC', 'TV', 'WiFi', 'Phòng Khách', 'Bồn Tắm Massage']
      }
    ]
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-luxury-gold to-primary-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{hotelData.name}</h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
              <span className="ml-2 text-xl font-bold">{hotelData.rating}</span>
              <span className="ml-2">({hotelData.reviews} đánh giá)</span>
            </div>
            <div className="flex items-center">
              <MapPin size={20} />
              <span className="ml-2">{hotelData.city}</span>
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
              <h2 className="text-2xl font-bold mb-4">Về Khách Sạn</h2>
              <p className="text-primary-700 mb-6">{hotelData.description}</p>
              <p className="text-primary-600">
                Tọa lạc tại trung tâm thành phố, Mois Luxury Suite cung cấp trải nghiệm lưu trú đẳng cấp 
                với đội ngũ nhân viên chuyên nghiệp sẵn sàng phục vụ 24/7.
              </p>
            </div>

            {/* Amenities */}
            <div className="card-luxury p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Tiện Ích</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotelData.amenities.map((a) => (
                  <div key={a.name} className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-primary-900 font-semibold text-sm">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-bold mb-6">Loại Phòng</h2>
              <div className="space-y-6">
                {hotelData.rooms.map((room) => (
                  <div key={room.id} className="border border-primary-200 rounded-lg p-6 hover:bg-primary-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-primary-900">{room.type}</h3>
                        <p className="text-primary-600 text-sm">{room.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-luxury-gold">
                          {(room.price / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-primary-600 text-sm">/đêm</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1 text-primary-600">
                        <Users size={18} />
                        <span>{room.capacity} khách</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((a) => (
                        <span key={a} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/booking/${room.id}`}
                      className="btn-primary inline-block"
                    >
                      Đặt Phòng Ngay
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h3 className="text-2xl font-bold mb-6 text-primary-900">Thông Tin Liên Hệ</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-primary-600 text-sm">Địa Chỉ</p>
                  <p className="font-semibold">123 Nguyễn Huệ, Hồ Chí Minh</p>
                </div>
                <div>
                  <p className="text-primary-600 text-sm">Điện Thoại</p>
                  <p className="font-semibold">+84 28 3912 3456</p>
                </div>
                <div>
                  <p className="text-primary-600 text-sm">Email</p>
                  <p className="font-semibold">info@mois.vn</p>
                </div>
                <div>
                  <p className="text-primary-600 text-sm">Check-in</p>
                  <p className="font-semibold">14:00</p>
                </div>
                <div>
                  <p className="text-primary-600 text-sm">Check-out</p>
                  <p className="font-semibold">12:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
