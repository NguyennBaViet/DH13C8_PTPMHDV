import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, MapPin, Calendar, Users, Building2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import hotelService from '../services/hotelService'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [featuredHotels, setFeaturedHotels] = useState([])

  // Auto-redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin')
    }
  }, [user, navigate])

  useEffect(() => {
    hotelService.getHotels(0, 3)
      .then(res => setFeaturedHotels(res || []))
      .catch(err => console.warn('Lỗi tải khách sạn nổi bật:', err))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Navigate to search with parameters
    navigate(`/hotels?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" 
        style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(212,175,55,0.3))', backgroundColor: '#1f2937'}}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-5xl font-display font-bold mb-4">Mois Hotel</h1>
          <p className="text-xl mb-8">Trải nghiệm sang trọng & thoải mái</p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 shadow-luxury w-full max-w-3xl mx-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Ngày Nhận Phòng</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Ngày Trả Phòng</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Số Khách</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="form-input"
                >
                  <option value="1">1 Khách</option>
                  <option value="2">2 Khách</option>
                  <option value="3">3 Khách</option>
                  <option value="4">4+ Khách</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  Tìm Kiếm
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="section-title">
          <h2 className="text-3xl font-bold mb-2">Tại Sao Chọn Mois?</h2>
          <p className="text-primary-600">Dịch vụ 5 sao, giá cạnh tranh</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card-luxury p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Chất Lượng Cao</h3>
            <p className="text-primary-600">Những phòng sang trọng với trang thiết bị hiện đại</p>
          </div>

          <div className="card-luxury p-6 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Giá Tốt</h3>
            <p className="text-primary-600">Đặt trực tuyến tiết kiệm tới 30% so với quầy</p>
          </div>

          <div className="card-luxury p-6 text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">An Toàn</h3>
            <p className="text-primary-600">Thanh toán an toàn, hoàn tiền 100% nếu hủy</p>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="section bg-primary-50">
        <div className="section-title">
          <h2 className="text-3xl font-bold mb-2">Khách Sạn Nổi Bật</h2>
          <p className="text-primary-600">Những lựa chọn tốt nhất cho bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featuredHotels.map((hotel) => (
            <Link key={hotel.id} to={`/hotels/${hotel.id}`} className="card-luxury overflow-hidden hover:shadow-luxury-lg cursor-pointer group flex flex-col justify-between">
              <div>
                <div className="h-48 bg-primary-200 relative overflow-hidden">
                  {hotel.coverImage ? (
                    <img 
                      src={hotel.coverImage} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-luxury-gold to-primary-800 flex items-center justify-center text-white">
                      <Building2 size={40} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold group-hover:text-luxury-gold transition">{hotel.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="ml-1 text-primary-900 font-semibold">{hotel.starRating || 5}.0</span>
                    </div>
                  </div>
                  <p className="text-primary-600 text-sm mb-4">
                    <MapPin size={14} className="inline mr-1 text-luxury-gold" />
                    {hotel.city}, Việt Nam
                  </p>
                  <p className="text-primary-500 text-xs line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 flex items-center justify-between border-t border-primary-50 mt-2">
                <span className="text-xs text-primary-500">Khách sạn {hotel.starRating || 5} sao</span>
                <button className="btn-small">Xem Chi Tiết →</button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-800 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Sẵn Sàng Đặt Phòng?</h2>
        <p className="text-lg mb-8 text-primary-200">Tìm khách sạn hoàn hảo cho kỳ nghỉ của bạn</p>
        <Link to="/hotels" className="btn-secondary inline-block">
          Xem Tất Cả Khách Sạn
        </Link>
      </section>
    </div>
  )
}
