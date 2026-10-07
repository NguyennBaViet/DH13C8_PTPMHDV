import React, { useState } from 'react'
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'

export default function AdminBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([
    { id: 'BK001', guest: 'Nguyễn Văn A', room: '101', hotel: 'Mois Luxury', checkIn: '2026-10-15', checkOut: '2026-10-18', price: 7500000, status: 'Confirmed' },
    { id: 'BK002', guest: 'Trần Thị B', room: '201', hotel: 'Mois Premium', checkIn: '2026-10-20', checkOut: '2026-10-22', price: 5000000, status: 'Pending' },
    { id: 'BK003', guest: 'Lê Văn C', room: '102', hotel: 'Mois Luxury', checkIn: '2026-10-12', checkOut: '2026-10-14', price: 3000000, status: 'Completed' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-600">Truy cập bị từ chối</p></div>
  }

  const handleApprove = (id) => {
    setBookings(bookings.map(b => b.id === id ? {...b, status: 'Confirmed'} : b))
  }

  const handleCancel = (id) => {
    setBookings(bookings.map(b => b.id === id ? {...b, status: 'Cancelled'} : b))
  }

  const filtered = bookings.filter(b =>
    b.id.includes(searchTerm.toUpperCase()) || b.guest.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Completed': return 'bg-blue-100 text-blue-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-primary-100 text-primary-700'
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Quản Lý Đơn Đặt Phòng</h1>

        <div className="card-luxury">
          <div className="p-6 border-b flex items-center space-x-2">
            <Search size={20} className="text-primary-600" />
            <input type="text" placeholder="Tìm kiếm đơn đặt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Mã Đơn</th>
                  <th className="px-6 py-4 text-left font-semibold">Khách</th>
                  <th className="px-6 py-4 text-left font-semibold">Phòng</th>
                  <th className="px-6 py-4 text-left font-semibold">Khách Sạn</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày Nhận</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày Trả</th>
                  <th className="px-6 py-4 text-left font-semibold">Giá</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-primary-50">
                    <td className="px-6 py-4 font-semibold">{booking.id}</td>
                    <td className="px-6 py-4">{booking.guest}</td>
                    <td className="px-6 py-4">{booking.room}</td>
                    <td className="px-6 py-4">{booking.hotel}</td>
                    <td className="px-6 py-4">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">{(booking.price / 1000000).toFixed(1)}M</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => setSelectedBooking(booking)} className="p-2 hover:bg-blue-100 rounded"><Eye size={18} className="text-blue-600" /></button>
                        {booking.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApprove(booking.id)} className="p-2 hover:bg-green-100 rounded"><CheckCircle size={18} className="text-green-600" /></button>
                            <button onClick={() => handleCancel(booking.id)} className="p-2 hover:bg-red-100 rounded"><XCircle size={18} className="text-red-600" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card-luxury p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Chi Tiết Đơn Đặt</h2>
              <div className="space-y-3">
                <div><p className="text-primary-600 text-sm">Mã Đơn</p><p className="font-semibold">{selectedBooking.id}</p></div>
                <div><p className="text-primary-600 text-sm">Khách</p><p className="font-semibold">{selectedBooking.guest}</p></div>
                <div><p className="text-primary-600 text-sm">Phòng</p><p className="font-semibold">{selectedBooking.room} - {selectedBooking.hotel}</p></div>
                <div><p className="text-primary-600 text-sm">Nhận/Trả</p><p className="font-semibold">{new Date(selectedBooking.checkIn).toLocaleDateString('vi-VN')} - {new Date(selectedBooking.checkOut).toLocaleDateString('vi-VN')}</p></div>
                <div><p className="text-primary-600 text-sm">Giá</p><p className="font-semibold text-luxury-gold">{(selectedBooking.price / 1000000).toFixed(1)}M</p></div>
                <div><p className="text-primary-600 text-sm">Trạng Thái</p><p className={`font-semibold px-3 py-1 rounded inline-block ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</p></div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="btn-primary w-full mt-6">Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
