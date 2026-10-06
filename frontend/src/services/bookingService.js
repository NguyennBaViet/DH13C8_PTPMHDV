import api from './api'

const bookingService = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi tạo đơn đặt phòng'
      }
    }
  },

  // Get user's bookings
  getMyBookings: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/bookings/my-bookings', {
        params: { page, limit }
      })
      return {
        success: true,
        data: response.data
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
        data: response.data
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
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi hủy đơn đặt phòng'
      }
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.put(`/bookings/${bookingId}`, updateData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi cập nhật đơn đặt phòng'
      }
    }
  },

  // Get booking history
  getBookingHistory: async (userId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/bookings/user/${userId}/history`, {
        params: { page, limit }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy lịch sử đặt phòng'
      }
    }
  }
}

export default bookingService
