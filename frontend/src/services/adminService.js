import api from './api'

const adminService = {
  // ─── HOTELS ───────────────────────────────────────────────────────
  hotels: {
    getAll: async () => {
      try {
        const response = await api.get('/admin/hotels')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy danh sách khách sạn' }
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/admin/hotels/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy chi tiết khách sạn' }
      }
    },
    create: async (hotelData) => {
      try {
        const response = await api.post('/admin/hotels', hotelData)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi tạo khách sạn' }
      }
    },
    update: async (id, hotelData) => {
      try {
        const response = await api.put(`/admin/hotels/${id}`, hotelData)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi cập nhật khách sạn' }
      }
    },
    delete: async (id) => {
      try {
        const response = await api.delete(`/admin/hotels/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi xóa khách sạn' }
      }
    }
  },

  // ─── ROOMS ────────────────────────────────────────────────────────
  rooms: {
    getAll: async (filters = {}) => {
      try {
        const response = await api.get('/admin/rooms', { params: filters })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy danh sách phòng' }
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/admin/rooms/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy chi tiết phòng' }
      }
    },
    create: async (roomData) => {
      try {
        const response = await api.post('/admin/rooms', roomData)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi tạo phòng' }
      }
    },
    update: async (id, roomData) => {
      try {
        const response = await api.put(`/admin/rooms/${id}`, roomData)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi cập nhật phòng' }
      }
    },
    delete: async (id) => {
      try {
        const response = await api.delete(`/admin/rooms/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi xóa phòng' }
      }
    },
    updateStatus: async (id, status) => {
      try {
        const response = await api.patch(`/admin/rooms/${id}/status`, { status })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi cập nhật trạng thái phòng' }
      }
    }
  },

  // ─── BOOKINGS ─────────────────────────────────────────────────────
  bookings: {
    getAll: async (filters = {}) => {
      try {
        const response = await api.get('/admin/bookings', { params: filters })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy danh sách đơn đặt' }
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/admin/bookings/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy chi tiết đơn đặt' }
      }
    },
    approve: async (id) => {
      try {
        const response = await api.patch(`/admin/bookings/${id}/approve`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi phê duyệt đơn đặt' }
      }
    },
    reject: async (id, reason = '') => {
      try {
        const response = await api.patch(`/admin/bookings/${id}/reject`, { reason })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi từ chối đơn đặt' }
      }
    },
    cancel: async (id, reason = '') => {
      try {
        const response = await api.patch(`/admin/bookings/${id}/cancel`, { reason })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi hủy đơn đặt' }
      }
    },
    getStats: async () => {
      try {
        const response = await api.get('/admin/bookings/stats')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy thống kê đơn đặt' }
      }
    }
  },

  // ─── USERS ────────────────────────────────────────────────────────
  users: {
    getAll: async (filters = {}) => {
      try {
        const response = await api.get('/admin/users', { params: filters })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy danh sách người dùng' }
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/admin/users/${id}`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy chi tiết người dùng' }
      }
    },
    updateRole: async (id, role) => {
      try {
        const response = await api.patch(`/admin/users/${id}/role`, { role })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi cập nhật vai trò người dùng' }
      }
    },
    toggleStatus: async (id) => {
      try {
        const response = await api.patch(`/admin/users/${id}/toggle-status`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi thay đổi trạng thái người dùng' }
      }
    },
    ban: async (id, reason = '') => {
      try {
        const response = await api.patch(`/admin/users/${id}/ban`, { reason })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi khóa tài khoản người dùng' }
      }
    },
    unban: async (id) => {
      try {
        const response = await api.patch(`/admin/users/${id}/unban`)
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi mở khóa tài khoản người dùng' }
      }
    },
    getStats: async () => {
      try {
        const response = await api.get('/admin/users/stats')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy thống kê người dùng' }
      }
    }
  },

  // ─── DASHBOARD ────────────────────────────────────────────────────
  dashboard: {
    getStats: async () => {
      try {
        const response = await api.get('/admin/dashboard/stats')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy thống kê dashboard' }
      }
    },
    getRevenueStats: async (period = 'month') => {
      try {
        const response = await api.get('/admin/dashboard/revenue', { params: { period } })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy thống kê doanh thu' }
      }
    },
    getOccupancyStats: async () => {
      try {
        const response = await api.get('/admin/dashboard/occupancy')
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy thống kê chiếm dụng' }
      }
    },
    getRecentBookings: async (limit = 10) => {
      try {
        const response = await api.get('/admin/dashboard/recent-bookings', { params: { limit } })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi lấy đơn đặt gần đây' }
      }
    }
  },

  // ─── REPORTS ──────────────────────────────────────────────────────
  reports: {
    generateBookingsReport: async (startDate, endDate) => {
      try {
        const response = await api.get('/admin/reports/bookings', { 
          params: { startDate, endDate },
          responseType: 'blob'
        })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi tạo báo cáo đơn đặt' }
      }
    },
    generateRevenueReport: async (startDate, endDate) => {
      try {
        const response = await api.get('/admin/reports/revenue', { 
          params: { startDate, endDate },
          responseType: 'blob'
        })
        return { success: true, data: response.data }
      } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Lỗi tạo báo cáo doanh thu' }
      }
    }
  }
}

export default adminService
