import React, { useState } from 'react'
import { Edit2, Lock, Unlock, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import AdminHeader from '../../components/AdminHeader'

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([
    { id: 1, username: 'testuser2001', email: 'test2001@example.com', fullName: 'Test User 2001', role: 'GUEST', status: 'Active', joinDate: '2026-10-07' },
    { id: 2, username: 'admin', email: 'admin@mois.vn', fullName: 'Admin User', role: 'ADMIN', status: 'Active', joinDate: '2026-01-01' },
    { id: 3, username: 'user123', email: 'user123@example.com', fullName: 'User 123', role: 'GUEST', status: 'Active', joinDate: '2026-09-15' },
    { id: 4, username: 'staff001', email: 'staff@mois.vn', fullName: 'Staff User', role: 'STAFF', status: 'Inactive', joinDate: '2026-08-01' }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-600">Truy cập bị từ chối</p></div>
  }

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? {...u, status: u.status === 'Active' ? 'Inactive' : 'Active'} : u))
  }

  const handleChangeRole = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? {...u, role: newRole} : u))
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700'
      case 'STAFF': return 'bg-blue-100 text-blue-700'
      case 'GUEST': return 'bg-primary-100 text-primary-700'
      default: return 'bg-primary-100'
    }
  }

  const stats = [
    { label: 'Tổng Người Dùng', value: users.length },
    { label: 'Admin', value: users.filter(u => u.role === 'ADMIN').length },
    { label: 'Staff', value: users.filter(u => u.role === 'STAFF').length },
    { label: 'Đang Hoạt Động', value: users.filter(u => u.status === 'Active').length }
  ]

  return (
    <div className="min-h-screen bg-primary-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary-900 mb-8">Quản Lý Người Dùng</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-luxury p-4">
              <p className="text-primary-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="card-luxury">
          <div className="p-6 border-b flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 flex items-center space-x-2">
              <Search size={20} className="text-primary-600" />
              <input type="text" placeholder="Tìm kiếm người dùng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none" />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="form-input w-full md:w-40">
              <option value="all">Tất Cả Vai Trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Username</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Tên</th>
                  <th className="px-6 py-4 text-left font-semibold">Vai Trò</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Ngày Tham Gia</th>
                  <th className="px-6 py-4 text-left font-semibold">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-primary-50">
                    <td className="px-6 py-4 font-semibold">{u.username}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.fullName}</td>
                    <td className="px-6 py-4">
                      <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} className={`px-3 py-1 rounded text-sm font-semibold border-0 ${getRoleColor(u.role)} cursor-pointer`}>
                        <option value="GUEST">GUEST</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(u.joinDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(u.id)} className="p-2 hover:bg-yellow-100 rounded">
                        {u.status === 'Active' ? <Lock size={18} className="text-yellow-600" /> : <Unlock size={18} className="text-green-600" />}
                      </button>
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
