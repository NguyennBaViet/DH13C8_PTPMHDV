import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Building2, DoorOpen, BookOpen, Users, TrendingUp, CheckCircle2, XCircle, Eye } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import adminService from '../../services/adminService'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Load pending bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch recent pending bookings (limit to 3 for dashboard)
        const response = await adminService.dashboard.getRecentBookings(3)
        // Filter only pending bookings and sort by newest first
        const pending = (response.data || []).filter(b => b.status === 'Pending' || b.status === 'PENDING')
        const sortedBookings = pending.sort((a, b) => 
          new Date(b.createdAt || b.checkInDate || b.checkIn) - new Date(a.createdAt || a.checkInDate || a.checkIn)
        )
        setBookings(sortedBookings)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
        setError('Failed to load bookings')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Auto-redirect non-admin users
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="card-luxury p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Truy Cập Bị Từ Chối</h1>
          <p className="text-primary-600 mb-6">Bạn không có quyền truy cập trang Admin</p>
          <button onClick={() => navigate('/')} className="btn-primary">Quay Lại</button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Khách Sạn', value: 3, icon: <Building2 size={24} />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Phòng', value: 42, icon: <DoorOpen size={24} />, color: 'bg-green-100 text-green-600' },
    { label: 'Đơn Đặt', value: 156, icon: <BookOpen size={24} />, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Người Dùng', value: 89, icon: <Users size={24} />, color: 'bg-purple-100 text-purple-600' }
  ]

  // Revenue data - month: 30 days, year: 12 months
  const revenueData = {
    month: [
      { label: '1', value: 80000000 },
      { label: '2', value: 90000000 },
      { label: '3', value: 75000000 },
      { label: '4', value: 85000000 },
      { label: '5', value: 95000000 },
      { label: '6', value: 88000000 },
      { label: '7', value: 92000000 },
      { label: '8', value: 105000000 },
      { label: '9', value: 98000000 },
      { label: '10', value: 110000000 },
      { label: '11', value: 112000000 },
      { label: '12', value: 120000000 },
      { label: '13', value: 95000000 },
      { label: '14', value: 108000000 },
      { label: '15', value: 125000000 },
      { label: '16', value: 115000000 },
      { label: '17', value: 98000000 },
      { label: '18', value: 105000000 },
      { label: '19', value: 112000000 },
      { label: '20', value: 118000000 },
      { label: '21', value: 95000000 },
      { label: '22', value: 102000000 },
      { label: '23', value: 110000000 },
      { label: '24', value: 108000000 },
      { label: '25', value: 120000000 },
      { label: '26', value: 125000000 },
      { label: '27', value: 98000000 },
      { label: '28', value: 115000000 },
      { label: '29', value: 122000000 },
      { label: '30', value: 135000000 }
    ],
    year: [
      { label: 'T1', value: 2450000000 },
      { label: 'T2', value: 2600000000 },
      { label: 'T3', value: 2800000000 },
      { label: 'T4', value: 2900000000 },
      { label: 'T5', value: 3100000000 },
      { label: 'T6', value: 3200000000 },
      { label: 'T7', value: 3300000000 },
      { label: 'T8', value: 3150000000 },
      { label: 'T9', value: 2950000000 },
      { label: 'T10', value: 3400000000 },
      { label: 'T11', value: 3500000000 },
      { label: 'T12', value: 3800000000 }
    ]
  }

  const currentRevenue = revenueData[period]
  const maxRevenue = Math.max(...currentRevenue.map(d => d.value))
  const isMonth = period === 'month'

  // Handle approve booking
  const handleApprove = async (bookingId) => {
    try {
      const result = await adminService.bookings.approve(bookingId)
      if (result.success) {
        // Remove from list after successful approval
        setBookings(bookings.filter(b => b.id !== bookingId))
      } else {
        alert('Lỗi phê duyệt đơn: ' + result.error)
      }
    } catch (err) {
      alert('Lỗi phê duyệt đơn: ' + err.message)
    }
  }

  // Handle reject booking
  const handleReject = async (bookingId) => {
    if (confirm('Bạn có chắc muốn từ chối đơn này?')) {
      try {
        const result = await adminService.bookings.reject(bookingId)
        if (result.success) {
          // Remove from list after successful rejection
          setBookings(bookings.filter(b => b.id !== bookingId))
        } else {
          alert('Lỗi từ chối đơn: ' + result.error)
        }
      } catch (err) {
        alert('Lỗi từ chối đơn: ' + err.message)
      }
    }
  }

  // Create SVG line chart for month view with hover tooltip
  const createLineChart = () => {
    if (!isMonth) return null

    const chartWidth = currentRevenue.length * 35
    const chartHeight = 200
    const padding = 20

    const points = currentRevenue.map((data, idx) => {
      const x = padding + (idx / (currentRevenue.length - 1)) * (chartWidth - 2 * padding)
      const y = chartHeight - padding - (data.value / maxRevenue) * (chartHeight - 2 * padding)
      return { x, y, value: data.value, label: data.label }
    })

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    return (
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Line */}
          <path d={pathD} stroke="#d4af37" strokeWidth="3" fill="none" />

          {/* Interactive points with hover area */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Invisible hover area */}
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Visible point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === i ? 6 : 4}
                fill={hoveredPoint === i ? '#d4af37' : '#d4af37'}
                style={{ transition: 'r 0.2s' }}
              />
            </g>
          ))}

          {/* X-axis */}
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#333" strokeWidth="2" />
        </svg>

        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div
            className="absolute bg-primary-900 text-white px-3 py-2 rounded text-sm font-semibold pointer-events-none"
            style={{
              left: `${padding + (hoveredPoint / (currentRevenue.length - 1)) * (chartWidth - 2 * padding)}px`,
              top: '10px',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap'
            }}
          >
            Ngày {currentRevenue[hoveredPoint].label}: {(currentRevenue[hoveredPoint].value / 1000000).toFixed(1)}M
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">📊 Bảng Điều Khiển Admin</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-luxury p-6">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-primary-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-primary-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart - Full Width */}
        <div className="card-luxury p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <TrendingUp size={24} className="text-luxury-gold" />
              <span>Doanh Thu</span>
            </h2>
            <div className="flex space-x-2">
              {['month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition ${
                    period === p
                      ? 'bg-luxury-gold text-primary-900'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {p === 'month' ? 'Tháng (30 Ngày)' : 'Năm (12 Tháng)'}
                </button>
              ))}
            </div>
          </div>

          {/* Chart - Display all data without scroll */}
          {isMonth ? (
            // Line chart for month view
            <div className="overflow-x-auto mb-6">
              {createLineChart()}
            </div>
          ) : (
            // Bar chart for year view (12 columns fit easily)
            <div className="flex items-end justify-between gap-3 bg-primary-50 p-6 rounded-lg mb-6" style={{ height: '280px' }}>
              {currentRevenue.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0 group">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className="bg-gradient-to-t from-luxury-gold to-luxury-lightGold rounded-t transition hover:from-luxury-darkGold hover:to-luxury-gold cursor-pointer w-3/4"
                      style={{ height: `${(data.value / maxRevenue) * 100}%`, minHeight: '8px', maxWidth: '100%' }}
                      title={`${(data.value / 1000000).toFixed(0)}M`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                        {(data.value / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-primary-600 mt-3 font-semibold text-center w-full truncate">{data.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div>
              <p className="text-primary-600 text-sm">Tổng Doanh Thu</p>
              <p className="text-xl font-bold text-luxury-gold">
                {(currentRevenue.reduce((sum, d) => sum + d.value, 0) / 1000000000).toFixed(2)}B
              </p>
            </div>
            <div>
              <p className="text-primary-600 text-sm">Trung Bình</p>
              <p className="text-xl font-bold text-primary-900">
                {(currentRevenue.reduce((sum, d) => sum + d.value, 0) / currentRevenue.length / 1000000).toFixed(0)}M
              </p>
            </div>
            <div>
              <p className="text-primary-600 text-sm">Cao Nhất</p>
              <p className="text-xl font-bold text-green-600">
                {(maxRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        {/* Pending Bookings - Below Revenue Chart */}
        <div className="card-luxury p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <BookOpen size={24} className="text-luxury-gold" />
            <span>Đơn Chưa Xử Lý</span>
          </h2>
          {loading ? (
            <div className="text-center py-8 text-primary-600">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-primary-50 p-4 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-50 transition group">
                  <div onClick={() => navigate(`/admin/bookings/${booking.id}`)} className="mb-3">
                    <p className="font-semibold text-primary-900 group-hover:text-luxury-gold transition flex items-center gap-2">
                      {booking.id || 'N/A'}
                      <Eye size={14} className="opacity-0 group-hover:opacity-100" />
                    </p>
                    <p className="text-sm text-primary-600">{booking.guestName || booking.fullName || 'Unknown'}</p>
                    <p className="text-sm text-primary-600">Phòng {booking.roomNumber || 'N/A'} - {booking.hotelName || 'N/A'}</p>
                    <p className="text-sm mt-2"><strong>Nhận:</strong> {new Date(booking.checkInDate || booking.checkIn).toLocaleDateString('vi-VN')}</p>
                    <p className="text-lg font-bold text-luxury-gold mt-2">{((booking.totalPrice || booking.price) / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApprove(booking.id)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-semibold transition text-sm"
                    >
                      <CheckCircle2 size={14} />
                      Phê Duyệt
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReject(booking.id)
                      }}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-semibold transition text-sm"
                    >
                      <XCircle size={14} />
                      Từ Chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-primary-50 p-6 rounded-lg text-center text-primary-600 mb-6">
              <p>✅ Không có đơn chưa xử lý</p>
            </div>
          )}
          <button className="btn-secondary w-full">Xem Tất Cả →</button>
        </div>
      </div>
    </div>
  )
}
