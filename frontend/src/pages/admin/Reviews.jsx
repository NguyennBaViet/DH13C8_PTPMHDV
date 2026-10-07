import React, { useState } from 'react'
import { Star, Trash2, Search, Eye } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'

export default function AdminReviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([
    { id: 1, bookingId: 'BK001', hotelId: 1, hotelName: 'Mois Luxury Suite', guestName: 'Nguyễn Văn A', rating: 5, comment: 'Khách sạn tuyệt vời, phục vụ rất tốt!', date: '2026-10-15', status: 'Approved' },
    { id: 2, bookingId: 'BK002', hotelId: 1, hotelName: 'Mois Luxury Suite', guestName: 'Trần Thị B', rating: 4, comment: 'Phòng sạch sẽ, tiện nghi đủ đầy', date: '2026-10-16', status: 'Approved' },
    { id: 3, bookingId: 'BK003', hotelId: 2, hotelName: 'Mois Premium Plaza', guestName: 'Lê Văn C', rating: 3, comment: 'Bình thường, có thể cải thiện hơn', date: '2026-10-17', status: 'Pending' },
    { id: 4, bookingId: 'BK004', hotelId: 3, hotelName: 'Mois Ocean View', guestName: 'Phạm Văn D', rating: 5, comment: 'Tuyệt vời! Nhân viên rất thân thiện', date: '2026-10-18', status: 'Pending' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-600">Truy cập bị từ chối</p></div>
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  const handleApprove = (id) => {
    const updatedReviews = reviews.map(r => r.id === id ? { ...r, status: 'Approved' } : r)
    setReviews(updatedReviews)
    
    // Calculate and update hotel rating when review is approved
    const approvedReview = reviews.find(r => r.id === id)
    if (approvedReview) {
      const hotelReviews = updatedReviews.filter(r => r.hotelId === approvedReview.hotelId && r.status === 'Approved')
      if (hotelReviews.length > 0) {
        const avgRating = hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length
        // In production: API call to update hotel rating
        // For now just log
        console.log(`🏨 Hotel ${approvedReview.hotelName}: ⭐ ${avgRating.toFixed(1)} (${hotelReviews.length} đánh giá)`)
      }
    }
  }

  const handleReject = (id) => {
    if (confirm('Bạn có chắc muốn từ chối đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id))
    }
  }

  const filtered = reviews.filter(r => {
    const matchSearch = r.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRating = filterRating === 'all' || r.rating === parseInt(filterRating)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchRating && matchStatus
  })

  // Calculate average rating by hotel
  const hotelRatings = {}
  reviews.filter(r => r.status === 'Approved').forEach(r => {
    if (!hotelRatings[r.hotelId]) {
      hotelRatings[r.hotelId] = { ratings: [], count: 0 }
    }
    hotelRatings[r.hotelId].ratings.push(r.rating)
    hotelRatings[r.hotelId].count += 1
  })

  const getHotelAverageRating = (hotelId) => {
    const data = hotelRatings[hotelId]
    if (!data || data.ratings.length === 0) return 5.0
    const avg = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
    return avg.toFixed(1)
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Quản Lý Đánh Giá</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-luxury p-6">
            <p className="text-primary-600 text-sm">Tổng Đánh Giá</p>
            <p className="text-3xl font-bold text-primary-900">{reviews.length}</p>
          </div>
          <div className="card-luxury p-6">
            <p className="text-primary-600 text-sm">Đã Phê Duyệt</p>
            <p className="text-3xl font-bold text-green-600">{reviews.filter(r => r.status === 'Approved').length}</p>
          </div>
          <div className="card-luxury p-6">
            <p className="text-primary-600 text-sm">Chờ Phê Duyệt</p>
            <p className="text-3xl font-bold text-yellow-600">{reviews.filter(r => r.status === 'Pending').length}</p>
          </div>
          <div className="card-luxury p-6">
            <p className="text-primary-600 text-sm">Trung Bình Sao</p>
            <p className="text-3xl font-bold text-luxury-gold">
              {(reviews.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.filter(r => r.status === 'Approved').length)).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-luxury p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tìm kiếm</label>
              <div className="flex items-center space-x-2">
                <Search size={18} className="text-primary-600" />
                <input
                  type="text"
                  placeholder="Khách sạn, khách, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-primary-200 rounded-lg outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Số Sao</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:border-luxury-gold"
              >
                <option value="all">Tất Cả</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Sao)</option>
                <option value="4">⭐⭐⭐⭐ (4 Sao)</option>
                <option value="3">⭐⭐⭐ (3 Sao)</option>
                <option value="2">⭐⭐ (2 Sao)</option>
                <option value="1">⭐ (1 Sao)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Trạng Thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg outline-none focus:border-luxury-gold"
              >
                <option value="all">Tất Cả</option>
                <option value="Approved">Đã Phê Duyệt</option>
                <option value="Pending">Chờ Phê Duyệt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((review) => (
              <div key={review.id} className="card-luxury p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">{review.hotelName}</h3>
                    <p className="text-sm text-primary-600">Khách: {review.guestName}</p>
                    <p className="text-sm text-primary-600">Mã đơn: {review.bookingId}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < review.rating ? 'fill-luxury-gold text-luxury-gold' : 'text-primary-300'}
                        />
                      ))}
                      <span className="ml-2 font-bold text-luxury-gold">{review.rating}.0</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      review.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {review.status === 'Approved' ? 'Đã Phê Duyệt' : 'Chờ Phê Duyệt'}
                    </span>
                  </div>
                </div>

                <p className="text-primary-600 mb-4 italic">"{review.comment}"</p>

                <div className="flex justify-between items-center text-sm text-primary-600">
                  <span>Ngày: {new Date(review.date).toLocaleDateString('vi-VN')}</span>
                  <div className="flex space-x-2">
                    {review.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                        >
                          ✓ Phê Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition"
                        >
                          ✕ Từ Chối
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card-luxury p-8 text-center text-primary-600">
              <p>Không tìm thấy đánh giá nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
