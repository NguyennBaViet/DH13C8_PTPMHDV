import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, MapPin, AlertCircle, Building2 } from 'lucide-react'
import hotelService from '../services/hotelService'

export default function HotelSearch() {
  const [searchParams] = useSearchParams()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || 'all',
    rating: 0
  })

  useEffect(() => {
    let isMounted = true

    const fetchHotels = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await hotelService.getAllHotels()
        if (isMounted) {
          setHotels(data || [])
        }
      } catch (err) {
        console.error('Failed to fetch hotels:', err)
        if (isMounted) {
          setError('Không thể tải danh sách khách sạn: ' + (err.response?.data?.message || err.message))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchHotels()

    return () => {
      isMounted = false
    }
  }, [])

  const cities = ['all', ...new Set(hotels.map(h => h.city).filter(Boolean))]

  const filteredHotels = hotels.filter(h => {
    if (filters.city !== 'all' && h.city !== filters.city) return false
    if (filters.rating > 0 && (h.starRating || 5) < filters.rating) return false
    return true
  })

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Tìm Kiếm Khách Sạn</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="md:col-span-1">
            <div className="card-luxury p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4 text-primary-900">Bộ Lọc Khách Sạn</h3>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Thành Phố</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="form-input"
                  >
                    {cities.map(c => (
                      <option key={c} value={c}>
                        {c === 'all' ? 'Tất Cả Thành Phố' : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Hạng Sao Tối Thiểu</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})}
                    className="form-input"
                  >
                    <option value="0">Tất Cả Hạng Sao</option>
                    <option value="3">3+ ⭐</option>
                    <option value="4">4+ ⭐</option>
                    <option value="5">5 ⭐ Sang Trọng</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-primary-600 font-medium">
                {loading ? 'Đang tải dữ liệu...' : `Tìm thấy ${filteredHotels.length} khách sạn`}
              </p>
            </div>

            {loading ? (
              <div className="card-luxury p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
                <p className="text-primary-600">Đang tải danh sách khách sạn...</p>
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="card-luxury p-12 text-center">
                <Building2 className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-900 mb-2">Không tìm thấy khách sạn phù hợp</h3>
                <p className="text-primary-600 mb-4">Thử thay đổi bộ lọc thành phố hoặc hạng sao.</p>
                <button
                  onClick={() => setFilters({ city: 'all', rating: 0 })}
                  className="btn-secondary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    to={`/hotels/${hotel.id}`}
                    className="card-luxury overflow-hidden hover:shadow-luxury-lg cursor-pointer transition flex flex-col sm:flex-row group"
                  >
                    <div className="h-48 sm:h-auto sm:w-56 bg-primary-200 flex-shrink-0 relative overflow-hidden">
                      {hotel.coverImage ? (
                        <img 
                          src={hotel.coverImage} 
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-luxury-gold to-primary-800 flex items-center justify-center text-white">
                          <Building2 size={48} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-primary-900 group-hover:text-luxury-gold transition">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center text-yellow-500 flex-shrink-0">
                            {[...Array(hotel.starRating || 5)].map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center text-primary-600 mb-3 text-sm">
                          <MapPin size={16} className="text-luxury-gold mr-1.5 flex-shrink-0" />
                          <span>{hotel.address ? `${hotel.address}, ` : ''}{hotel.city}</span>
                        </div>
                        <p className="text-primary-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {hotel.description}
                        </p>
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {hotel.amenities.slice(0, 4).map((a) => (
                              <span key={a.id || a.name} className="px-2.5 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                                {a.name}
                              </span>
                            ))}
                            {hotel.amenities.length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{hotel.amenities.length - 4} tiện ích
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-primary-100">
                        <span className="text-xs text-primary-500">Khách sạn tiêu chuẩn {hotel.starRating || 5} sao</span>
                        <span className="btn-secondary text-sm px-4 py-2 group-hover:bg-luxury-gold group-hover:text-white transition">
                          Xem Phòng & Đặt Chỗ →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
