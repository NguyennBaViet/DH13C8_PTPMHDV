import React, { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'
import hotelService from '../../services/hotelService'
import roomService from '../../services/roomService'

export default function AdminRooms() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [hotels, setHotels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedHotel, setSelectedHotel] = useState('')
  
  const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TWIN', 'SUITE', 'DELUXE', 'FAMILY']

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'DOUBLE',
    pricePerNight: '',
    capacity: 2,
    description: '',
    floor: '',
    image: ''
  })

  const [imagePreview, setImagePreview] = useState(null)

  // Load hotels and rooms on mount
  useEffect(() => {
    fetchHotels()
    fetchRooms()
  }, [])

  // Fetch hotels
  const fetchHotels = async () => {
    try {
      const data = await hotelService.getAllHotels()
      setHotels(data)
      if (data.length > 0 && !selectedHotel) {
        setSelectedHotel(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch hotels:', err)
      setError('Không thể tải danh sách khách sạn')
    }
  }

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomService.getAllRooms(0, 1000)
      setRooms(data)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      setError('Không thể tải danh sách phòng')
    } finally {
      setLoading(false)
    }
  }

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData({...formData, image: reader.result})
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle image URL
  const handleImageUrl = () => {
    const url = prompt('Nhập đường dẫn ảnh:')
    if (url && url.trim()) {
      setImagePreview(url)
      setFormData({...formData, image: url})
    }
  }

  // Handle edit
  const handleEdit = (room) => {
    setEditId(room.id)
    setSelectedHotel(room.hotelId)
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      description: room.description || '',
      floor: room.floor || '',
      image: room.image || ''
    })
    setImagePreview(room.image || null)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa phòng này?')) {
      try {
        setLoading(true)
        await roomService.deleteRoom(id)
        alert('Phòng đã xóa thành công')
        await fetchRooms()
      } catch (err) {
        console.error('Error deleting room:', err)
        alert('Lỗi: ' + (err.message || 'Không thể xóa phòng'))
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle save
  const handleSave = async () => {
    // Validate required fields
    if (!formData.roomNumber || !formData.roomType || !formData.pricePerNight || !selectedHotel) {
      alert('Vui lòng điền tất cả các trường bắt buộc!')
      return
    }

    // Validate price
    const price = parseFloat(formData.pricePerNight)
    if (isNaN(price) || price <= 0) {
      alert('Giá phòng phải là số dương')
      return
    }

    const roomData = {
      hotelId: parseInt(selectedHotel),
      roomNumber: formData.roomNumber,
      roomType: formData.roomType,
      pricePerNight: price,
      capacity: parseInt(formData.capacity),
      description: formData.description,
      floor: formData.floor ? parseInt(formData.floor) : null,
      image: formData.image || null
    }

    try {
      setLoading(true)
      if (editId) {
        await roomService.updateRoom(editId, roomData)
        alert('Phòng đã cập nhật thành công')
      } else {
        await roomService.createRoom(roomData)
        alert('Phòng đã thêm thành công')
      }
      setShowForm(false)
      setEditId(null)
      setFormData({
        roomNumber: '',
        roomType: 'DOUBLE',
        pricePerNight: '',
        capacity: 2,
        description: '',
        floor: ''
      })
      await fetchRooms()
    } catch (err) {
      console.error('Error saving room:', err)
      alert('Lỗi: ' + (err.response?.data?.message || err.message || 'Không thể lưu phòng'))
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="card-luxury p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Truy Cập Bị Từ Chối</h1>
          <p className="text-primary-600">Bạn không có quyền truy cập trang Admin</p>
        </div>
      </div>
    )
  }

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-primary-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <p className="text-primary-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const filtered = rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.hotelName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (isActive) => {
    return isActive 
      ? <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">Hoạt động</span>
      : <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">Không hoạt động</span>
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900">Quản Lý Phòng</h1>
          <button 
            onClick={() => { 
              setShowForm(true)
              setEditId(null)
              setFormData({
                roomNumber: '',
                roomType: 'DOUBLE',
                pricePerNight: '',
                capacity: 2,
                description: '',
                floor: '',
                image: ''
              })
              setImagePreview(null)
            }} 
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Thêm Phòng</span>
          </button>
        </div>

        {showForm && (
          <div className="card-luxury p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">{editId ? 'Chỉnh Sửa' : 'Thêm'} Phòng</h2>
            
            {/* Image Section */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-semibold mb-3">Ảnh Phòng</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({...formData, image: ''})
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 border-2 border-dashed">
                      Chưa chọn ảnh
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="btn-primary px-4 py-2 text-center cursor-pointer">
                    Chọn File
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <button onClick={handleImageUrl} className="btn-secondary px-4 py-2">Dán URL</button>
                </div>
              </div>
            </div>
            
            {/* Hotel Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Khách Sạn *</label>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold"
              >
                <option value="">Chọn khách sạn</option>
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                ))}
              </select>
            </div>

            {/* Room Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Số Phòng *</label>
                <input 
                  type="text" 
                  placeholder="101" 
                  value={formData.roomNumber} 
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} 
                  className="form-input w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Loại Phòng *</label>
                <select 
                  value={formData.roomType} 
                  onChange={(e) => setFormData({...formData, roomType: e.target.value})} 
                  className="form-input w-full"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Giá/Đêm (VND) *</label>
                <input 
                  type="number" 
                  placeholder="1500000" 
                  value={formData.pricePerNight} 
                  onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} 
                  className="form-input w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sức Chứa (Khách) *</label>
                <input 
                  type="number" 
                  placeholder="2" 
                  min="1" 
                  max="10" 
                  value={formData.capacity} 
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                  className="form-input w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tầng</label>
                <input 
                  type="number" 
                  placeholder="1" 
                  value={formData.floor} 
                  onChange={(e) => setFormData({...formData, floor: e.target.value})} 
                  className="form-input w-full" 
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Mô Tả</label>
              <textarea 
                placeholder="Mô tả về phòng..." 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="form-input w-full" 
                rows="3" 
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button 
                onClick={handleSave} 
                disabled={loading} 
                className="btn-primary flex-1"
              >
                {loading ? 'Đang xử lý...' : editId ? 'Cập Nhật' : 'Thêm Phòng'}
              </button>
              <button 
                onClick={() => { 
                  setShowForm(false)
                  setEditId(null)
                }} 
                className="btn-secondary flex-1"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="card-luxury">
          <div className="p-6 border-b flex items-center space-x-2">
            <Search size={20} className="text-primary-600" />
            <input 
              type="text" 
              placeholder="Tìm kiếm phòng hoặc khách sạn..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="flex-1 bg-transparent outline-none" 
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Ảnh</th>
                  <th className="px-6 py-4 text-left font-semibold">Số Phòng</th>
                  <th className="px-6 py-4 text-left font-semibold">Khách Sạn</th>
                  <th className="px-6 py-4 text-left font-semibold">Loại</th>
                  <th className="px-6 py-4 text-left font-semibold">Giá/Đêm</th>
                  <th className="px-6 py-4 text-left font-semibold">Sức Chứa</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-primary-600">
                      Không có phòng nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((room) => (
                    <tr key={room.id} className="border-b hover:bg-primary-50">
                      <td className="px-6 py-4">
                        {room.image ? (
                          <img src={room.image} alt={room.roomNumber} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center text-xs text-primary-600">
                            No image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold">{room.roomNumber}</td>
                      <td className="px-6 py-4">{room.hotelName}</td>
                      <td className="px-6 py-4">{room.roomType}</td>
                      <td className="px-6 py-4">{(room.pricePerNight / 1000000).toFixed(1)}M VND</td>
                      <td className="px-6 py-4">{room.capacity} khách</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(room.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(room)} 
                            className="p-2 hover:bg-blue-100 rounded"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(room.id)} 
                            className="p-2 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
