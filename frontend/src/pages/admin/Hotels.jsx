import React, { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, Search, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'
import API from '../../services/api'

export default function AdminHotels() {
  const { user, token } = useAuth()
  const [hotels, setHotels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    coverImage: '',
    description: ''
  })
  const [imagePreview, setImagePreview] = useState(null)

  // DANH SÁCH THÀNH PHỐ
  const CITIES = [
    'Hà Nội',
    'Hà Giang',
    'Cao Bằng',
    'Bắc Kạn',
    'Tuyên Quang',
    'Lào Cai',
    'Điện Biên',
    'Lai Châu',
    'Sơn La',
    'Yên Bái',
    'Hòa Bình',
    'Thái Nguyên',
    'Lạng Sơn',
    'Quảng Ninh',
    'Bắc Giang',
    'Phú Thọ',
    'Vĩnh Phúc',
    'Bắc Ninh',
    'Hải Dương',
    'Hải Phòng',
    'Đà Nẵng',
    'Hồ Chí Minh',
    'Cần Thơ'
  ]

  // FETCH HOTELS TỪ API
  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await API.get('/hotels?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Hotels response:', response.data)
      if (response.data.content) {
        setHotels(response.data.content)
      } else if (Array.isArray(response.data)) {
        setHotels(response.data)
      }
    } catch (err) {
      console.error('Error loading hotels:', err)
      setError('Lỗi tải dữ liệu khách sạn: ' + (err.message || 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (hotel) => {
    setEditId(hotel.id)
    setFormData({
      name: hotel.name || '',
      city: hotel.city || '',
      address: hotel.address || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      coverImage: hotel.coverImage || '',
      description: hotel.description || ''
    })
    setImagePreview(hotel.coverImage || null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa khách sạn này?')) return
    try {
      await API.delete(`/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHotels(hotels.filter(h => h.id !== id))
      alert('Xóa khách sạn thành công!')
    } catch (err) {
      console.error('Error deleting hotel:', err)
      alert('Lỗi khi xóa khách sạn: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.city || !formData.address) {
      alert('Vui lòng điền tất cả các trường bắt buộc (Tên, Thành Phố, Địa chỉ)!')
      return
    }
    
    try {
      setSubmitting(true)
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        coverImage: formData.coverImage?.trim() || null,
        description: formData.description?.trim() || null
      }

      console.log('Saving hotel:', payload, 'EditID:', editId)

      if (editId) {
        // UPDATE
        const response = await API.put(`/hotels/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setHotels(hotels.map(h => h.id === editId ? response.data : h))
        alert('Cập nhật khách sạn thành công!')
      } else {
        // CREATE
        const response = await API.post('/hotels', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('Created hotel response:', response.data)
        setHotels([...hotels, response.data])
        alert('Thêm khách sạn thành công!')
      }
      
      resetForm()
    } catch (err) {
      console.error('Error saving hotel:', err)
      const message = err.response?.data?.message || err.response?.data?.error || err.message
      alert('Lỗi: ' + message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormData({
      name: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      coverImage: '',
      description: ''
    })
    setImagePreview(null)
  }

  const handleOpenNewForm = () => {
    resetForm()
    setShowForm(true)
  }

  const handleImageUrl = () => {
    const url = prompt('Nhập đường dẫn ảnh:')
    if (url && url.trim()) {
      setImagePreview(url)
      setFormData({...formData, coverImage: url})
    }
  }

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-600">Truy cập bị từ chối</p></div>
  }

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900">Quản Lý Khách Sạn</h1>
          <button onClick={handleOpenNewForm} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Thêm Khách Sạn</span>
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="card-luxury p-4 mb-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* FORM THÊMM/SỬA */}
        {showForm && (
          <div className="card-luxury p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">{editId ? 'Chỉnh Sửa' : 'Thêm'} Khách Sạn</h2>
            
            {/* IMAGE SECTION */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-semibold mb-3">Ảnh Khách Sạn</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({...formData, coverImage: ''})
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
                  <button 
                    type="button"
                    onClick={handleImageUrl}
                    className="btn-primary px-4 py-2"
                  >
                    Dán URL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Tên khách sạn *" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="form-input" 
              />
              <select 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                className="form-input"
              >
                <option value="">Chọn Thành Phố *</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Địa chỉ *" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="form-input" 
              />
              <input 
                type="text" 
                placeholder="Điện thoại" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="form-input" 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="form-input" 
              />
              <textarea 
                placeholder="Mô tả" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="form-input col-span-2" 
                rows="3"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button 
                onClick={handleSave} 
                disabled={submitting}
                className="btn-primary flex items-center space-x-2"
              >
                {submitting ? <Loader size={18} className="animate-spin" /> : null}
                <span>{submitting ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
              <button onClick={resetForm} className="btn-secondary">Hủy</button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="card-luxury p-8 text-center">
            <Loader size={32} className="animate-spin mx-auto text-primary-600" />
            <p className="text-primary-600 mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="card-luxury">
            <div className="p-6 border-b flex items-center space-x-2">
              <Search size={20} className="text-primary-600" />
              <input 
                type="text" 
                placeholder="Tìm kiếm khách sạn..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="flex-1 bg-transparent outline-none" 
              />
            </div>
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-primary-600">
                  Không có khách sạn nào
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-primary-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Ảnh</th>
                      <th className="px-6 py-4 text-left font-semibold">Tên Khách Sạn</th>
                      <th className="px-6 py-4 text-left font-semibold">Thành Phố</th>
                      <th className="px-6 py-4 text-left font-semibold">Địa Chỉ</th>
                      <th className="px-6 py-4 text-left font-semibold">Sao</th>
                      <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((hotel) => (
                      <tr key={hotel.id} className="border-b hover:bg-primary-50">
                        <td className="px-6 py-4">
                          {hotel.coverImage ? (
                            <img src={hotel.coverImage} alt={hotel.name} className="w-16 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center text-xs text-primary-600">Không ảnh</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold">{hotel.name}</td>
                        <td className="px-6 py-4">{hotel.city}</td>
                        <td className="px-6 py-4 text-sm">{hotel.address}</td>
                        <td className="px-6 py-4">⭐ {hotel.starRating}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button onClick={() => handleEdit(hotel)} className="p-2 hover:bg-blue-100 rounded">
                              <Edit2 size={18} className="text-blue-600" />
                            </button>
                            <button onClick={() => handleDelete(hotel.id)} className="p-2 hover:bg-red-100 rounded">
                              <Trash2 size={18} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
