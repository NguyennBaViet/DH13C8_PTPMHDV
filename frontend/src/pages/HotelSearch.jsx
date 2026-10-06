import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Wifi, UtensilsCrossed } from 'lucide-react'

export default function HotelSearch() {
  const [hotels, setHotels] = useState([
    {
      id: 1,
      name: 'Mois Luxury Suite',
      city: 'Hồ Chí Minh',
      rating: 5.0,
      reviews: 324,
      price: 2500000,
      image: '🏨',
      amenities: ['WiFi', 'Nhà Hàng', 'Phòng Gym']
    },
    {
      id: 2,
      name: 'Mois Premium Plaza',
      city: 'Hà Nội',
      rating: 4.8,
      reviews: 256,
      price: 2200000,
      image: '🏛️',
      amenities: ['WiFi', 'Spa', 'Bể Bơi']
    },
    {
      id: 3,
      name: 'Mois Ocean View',
      city: 'Đà Nẵng',
      rating: 4.9,
      reviews: 189,
      price: 1800000,
      image: '🏝️',
      amenities: ['WiFi', 'Bãi Biển', 'Quán Cà Phê']
    },
    {
      id: 4,
      name: 'Mois Garden Estate',
      city: 'Hồ Chí Minh',
      rating: 4.7,
      reviews: 145,
      price: 1600000,
      image: '🌳',
      amenities: ['WiFi', 'Vườn', 'Dịch Vụ Phòng']
    },
    {
      id: 5,
      name: 'Mois Downtown Hotel',
      city: 'Hà Nội',
      rating: 4.6,
      reviews: 198,
      price: 1400000,
      image: '🏢',
      amenities: ['WiFi', 'Nhà Hàng', 'Phòng Họp']
    },
    {
      id: 6,
      name: 'Mois Coastal Resort',
      city: 'Phú Quốc',
      rating: 4.9,
      reviews: 267,
      price: 1900000,
      image: '🏖️',
      amenities: ['WiFi', 'Resort', 'Nước Nóng']
    }
  ])

  const [filters, setFilters] = useState({
    city: 'all',
    priceMax: 3000000,
    rating: 0
  })

  const filteredHotels = hotels.filter(h => {
    if (filters.city !== 'all' && h.city !== filters.city) return false
    if (h.price > filters.priceMax) return false
    if (h.rating < filters.rating) return false
    return true
  })

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Tìm Kiếm Khách Sạn</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6">
              <h3 className="text-lg font-bold mb-4">Bộ Lọc</h3>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Thành Phố</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="form-input"
                  >
                    <option value="all">Tất Cả</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Phú Quốc">Phú Quốc</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Giá Tối Đa</label>
                  <input
                    type="range"
                    min="1000000"
                    max="3000000"
                    step="100000"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <p className="text-primary-600 text-sm mt-2">
                    {(filters.priceMax / 1000000).toFixed(1)}M VNĐ
                  </p>
                </div>

                <div>
                  <label className="form-label">Đánh Giá Tối Thiểu</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                    className="form-input"
                  >
                    <option value="0">Tất Cả</option>
                    <option value="4">4+⭐</option>
                    <option value="4.5">4.5+⭐</option>
                    <option value="4.8">4.8+⭐</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-3">
            <div className="mb-4">
              <p className="text-primary-600">Tìm thấy {filteredHotels.length} khách sạn</p>
            </div>

            <div className="space-y-4">
              {filteredHotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  to={`/hotels/${hotel.id}`}
                  className="card-luxury overflow-hidden hover:shadow-luxury-lg cursor-pointer transition flex"
                >
                  <div className="h-48 w-48 bg-gradient-to-br from-luxury-gold to-primary-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-6xl">{hotel.image}</span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-primary-900">{hotel.name}</h3>
                        <div className="flex items-center text-luxury-gold">
                          {[...Array(Math.floor(hotel.rating))].map((_, i) => (
                            <Star key={i} size={18} fill="currentColor" />
                          ))}
                          <span className="ml-2 text-primary-900 font-bold">{hotel.rating}</span>
                          <span className="ml-1 text-primary-600">({hotel.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center text-primary-600 mb-4">
                        <MapPin size={18} />
                        <span className="ml-2">{hotel.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hotel.amenities.map((a) => (
                          <span key={a} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-600">từ</p>
                        <p className="text-3xl font-bold text-luxury-gold">{(hotel.price / 1000000).toFixed(1)}M</p>
                      </div>
                      <button className="btn-secondary">Xem Chi Tiết</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
