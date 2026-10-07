import api from './api'

const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi tạo đơn đặt phòng'
      }
    }
  },

  // Get user's bookings (Spring Boot: GET /api/bookings/me)
  getMyBookings: async (page = 0, size = 20) => {
    try {
      const response = await api.get('/bookings/me', {
        params: { page, size }
      })
      const payload = response.data?.data || response.data
      return {
        success: true,
        data: payload?.content || (Array.isArray(payload) ? payload : [])
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy danh sách đơn đặt phòng'
      }
    }
  },

  // Get all bookings (Admin/Staff: GET /api/bookings)
  getAllBookings: async (page = 0, size = 50) => {
    try {
      const response = await api.get('/bookings', {
        params: { page, size }
      })
      const payload = response.data?.data || response.data
      return {
        success: true,
        data: payload?.content || (Array.isArray(payload) ? payload : [])
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy danh sách đơn đặt phòng'
      }
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin đơn đặt phòng'
      }
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`, { reason })
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi hủy đơn đặt phòng'
      }
    }
  },

  // Check-in (Admin/Staff)
  checkInBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/check-in`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi check-in'
      }
    }
  },

  // Check-out (Admin/Staff)
  checkOutBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/check-out`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi check-out'
      }
    }
  },

  // Confirm booking (Admin/Staff)
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/confirm`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi xác nhận đơn đặt phòng'
      }
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, updateData)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi cập nhật đơn đặt phòng'
      }
    }
  }
}

export default bookingService
