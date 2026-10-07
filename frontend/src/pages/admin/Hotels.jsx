import React, { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'
import ghnService from '../../services/ghnService'

export default function AdminHotels() {
  const { user } = useAuth()
  const [hotels, setHotels] = useState([
    { id: 1, name: 'Mois Luxury Suite', city: 'Hồ Chí Minh', cityCode: '79', address: '123 Nguyễn Huệ', rooms: 25, rating: 4.8, reviews: 156, status: 'Active', image: '' },
    { id: 2, name: 'Mois Premium Plaza', city: 'Hà Nội', cityCode: '1', address: '456 Hàng Bài', rooms: 18, rating: 4.6, reviews: 89, status: 'Active', image: '' },
    { id: 3, name: 'Mois Ocean View', city: 'Đà Nẵng', cityCode: '48', address: '789 Trần Phú', rooms: 30, rating: 4.9, reviews: 234, status: 'Active', image: '' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    name: '', cityCode: '', city: '', address: '', rooms: '', status: 'Active', image: ''
  })
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Load cities from GHN API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        const result = await ghnService.getProvinces()
        
        if (result.success && result.data.length > 0) {
          // Map GHN format to our format
          const mappedCities = result.data.map(province => ({
            ProvinceID: province.ProvinceID,
            ProvinceName: province.ProvinceName,
            Code: province.Code
          }))
          setCities(mappedCities)
        } else {
          // Fallback to hardcoded list if API fails
          setCities([
            { ProvinceID: 1, ProvinceName: 'Hà Nội', Code: '1' },
            { ProvinceID: 2, ProvinceName: 'Hà Giang', Code: '2' },
            { ProvinceID: 4, ProvinceName: 'Cao Bằng', Code: '4' },
            { ProvinceID: 6, ProvinceName: 'Bắc Kạn', Code: '6' },
            { ProvinceID: 8, ProvinceName: 'Tuyên Quang', Code: '8' },
            { ProvinceID: 10, ProvinceName: 'Lào Cai', Code: '10' },
            { ProvinceID: 11, ProvinceName: 'Điện Biên', Code: '11' },
            { ProvinceID: 12, ProvinceName: 'Lai Châu', Code: '12' },
            { ProvinceID: 14, ProvinceName: 'Sơn La', Code: '14' },
            { ProvinceID: 15, ProvinceName: 'Yên Bái', Code: '15' },
            { ProvinceID: 17, ProvinceName: 'Hòa Bình', Code: '17' },
            { ProvinceID: 19, ProvinceName: 'Thái Nguyên', Code: '19' },
            { ProvinceID: 20, ProvinceName: 'Lạng Sơn', Code: '20' },
            { ProvinceID: 22, ProvinceName: 'Quảng Ninh', Code: '22' },
            { ProvinceID: 24, ProvinceName: 'Bắc Giang', Code: '24' },
            { ProvinceID: 25, ProvinceName: 'Phú Thọ', Code: '25' },
            { ProvinceID: 26, ProvinceName: 'Vĩnh Phúc', Code: '26' },
            { ProvinceID: 27, ProvinceName: 'Bắc Ninh', Code: '27' },
            { ProvinceID: 30, ProvinceName: 'Hải Dương', Code: '30' },
            { ProvinceID: 31, ProvinceName: 'Hải Phòng', Code: '31' },
            { ProvinceID: 48, ProvinceName: 'Đà Nẵng', Code: '48' },
            { ProvinceID: 77, ProvinceName: 'Hồ Chí Minh', Code: '77' },
            { ProvinceID: 92, ProvinceName: 'Cần Thơ', Code: '92' }
          ])
        }
      } catch (err) {
        console.error('Error loading cities:', err)
        setCities([
          { ProvinceID: 1, ProvinceName: 'Hà Nội', Code: '1' },
          { ProvinceID: 48, ProvinceName: 'Đà Nẵng', Code: '48' },
          { ProvinceID: 77, ProvinceName: 'Hồ Chí Minh', Code: '77' }
        ])
      } finally {
        setLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-600">Truy cập bị từ chối</p></div>
  }

  const handleEdit = (hotel) => {
    setEditId(hotel.id)
    setFormData({ ...hotel, cityCode: hotel.cityCode || '' })
    setImagePreview(hotel.image || null)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa khách sạn này?')) {
      setHotels(hotels.filter(h => h.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.cityCode || !formData.address || !formData.rooms) {
      alert('Vui lòng điền tất cả các trường!')
      return
    }
    
    const selectedCity = cities.find(c => c.ProvinceID == formData.cityCode)
    const cityName = selectedCity ? selectedCity.ProvinceName : formData.city

    if (editId) {
      setHotels(hotels.map(h => h.id === editId ? { ...h, ...formData, city: cityName } : h))
    } else {
      setHotels([...hotels, { ...formData, city: cityName, id: Date.now(), rating: 0, reviews: 0 }])
    }
    setShowForm(false)
    setEditId(null)
    setFormData({ name: '', cityCode: '', city: '', address: '', rooms: '', status: 'Active' })
  }

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

  const handleImageUrl = () => {
    const url = prompt('Nhập đường dẫn ảnh từ Chrome:')
    if (url && url.trim()) {
      setImagePreview(url)
      setFormData({...formData, image: url})
    }
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
          <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', cityCode: '', city: '', address: '', rooms: '', status: 'Active', image: '' }); setImagePreview(null); }} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Thêm Khách Sạn</span>
          </button>
        </div>

        {showForm && (
          <div className="card-luxury p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">{editId ? 'Chỉnh Sửa' : 'Thêm'} Khách Sạn</h2>
            
            {/* Image Section */}
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
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={handleImageUrl}
                    className="btn-secondary px-4 py-2"
                  >
                    Dán URL
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Tên khách sạn" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="form-input" 
              />
              <select 
                value={formData.cityCode} 
                onChange={(e) => setFormData({...formData, cityCode: e.target.value})} 
                className="form-input"
              >
                <option value="">Chọn Thành Phố</option>
                {cities.map((city) => (
                  <option key={city.ProvinceID} value={city.ProvinceID}>
                    {city.ProvinceName}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Địa chỉ" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="form-input" 
              />
              <input 
                type="number" 
                placeholder="Số phòng" 
                min="1"
                value={formData.rooms} 
                onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value) || ''})} 
                className="form-input" 
              />
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                className="form-input"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleSave} className="btn-primary">Lưu</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        )}

        <div className="card-luxury">
          <div className="p-6 border-b flex items-center space-x-2">
            <Search size={20} className="text-primary-600" />
            <input type="text" placeholder="Tìm kiếm khách sạn..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Ảnh</th>
                  <th className="px-6 py-4 text-left font-semibold">Tên Khách Sạn</th>
                  <th className="px-6 py-4 text-left font-semibold">Thành Phố</th>
                  <th className="px-6 py-4 text-left font-semibold">Số Phòng</th>
                  <th className="px-6 py-4 text-left font-semibold">Đánh Giá</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((hotel) => (
                  <tr key={hotel.id} className="border-b hover:bg-primary-50">
                    <td className="px-6 py-4">
                      {hotel.image ? (
                        <img src={hotel.image} alt={hotel.name} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center text-xs text-primary-600">Không ảnh</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold">{hotel.name}</td>
                    <td className="px-6 py-4">{hotel.city}</td>
                    <td className="px-6 py-4">{hotel.rooms} phòng</td>
                    <td className="px-6 py-4">
                      {hotel.reviews > 0 ? (
                        <span className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span className="font-semibold">{hotel.rating.toFixed(1)}</span>
                          <span className="text-xs text-primary-600">({hotel.reviews})</span>
                        </span>
                      ) : (
                        <span className="text-sm text-primary-600">Chưa có đánh giá</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{hotel.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(hotel)} className="p-2 hover:bg-blue-100 rounded"><Edit2 size={18} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(hotel.id)} className="p-2 hover:bg-red-100 rounded"><Trash2 size={18} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
