import api from './api'

const paymentService = {
  // Create payment (POST /api/payments)
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi tạo thanh toán'
      }
    }
  },

  // Process mock payment (POST /api/payments/process)
  processPayment: async (processData) => {
    try {
      const response = await api.post('/payments/process', processData)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi xử lý thanh toán'
      }
    }
  },

  // Get payment details (GET /api/payments/:id)
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin thanh toán'
      }
    }
  },

  // Get payment by booking ID (GET /api/payments/booking/:bookingId)
  getPaymentByBookingId: async (bookingId) => {
    try {
      const response = await api.get(`/payments/booking/${bookingId}`)
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin thanh toán'
      }
    }
  },

  // Get payment history (GET /api/payments/me)
  getMyPayments: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/payments/me', {
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
        error: error.response?.data?.message || 'Lỗi lấy lịch sử thanh toán'
      }
    }
  },

  // Refund payment (POST /api/payments/:id/refund)
  refundPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, { reason })
      return {
        success: true,
        data: response.data?.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi hoàn tiền'
      }
    }
  }
}

export default paymentService
