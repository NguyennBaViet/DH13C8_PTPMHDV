import api from './api'

const paymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi tạo thanh toán'
      }
    }
  },

  // Process payment
  processPayment: async (paymentId, paymentMethodData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/process`, paymentMethodData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi xử lý thanh toán'
      }
    }
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin thanh toán'
      }
    }
  },

  // Get payment history
  getPaymentHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/payments/history', {
        params: { page, limit }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy lịch sử thanh toán'
      }
    }
  },

  // Refund payment
  refundPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, { reason })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi hoàn tiền'
      }
    }
  },

  // Verify payment
  verifyPayment: async (paymentId) => {
    try {
      const response = await api.post(`/payments/${paymentId}/verify`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi xác minh thanh toán'
      }
    }
  }
}

export default paymentService
