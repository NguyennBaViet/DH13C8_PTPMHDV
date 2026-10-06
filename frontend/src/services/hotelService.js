import api from './api'

const hotelService = {
  // Get all hotels
  getHotels: async (params = {}) => {
    try {
      const response = await api.get('/hotels', { params })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy danh sách khách sạn'
      }
    }
  },

  // Get hotel by ID
  getHotelById: async (hotelId) => {
    try {
      const response = await api.get(`/hotels/${hotelId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin khách sạn'
      }
    }
  },

  // Search hotels
  searchHotels: async (criteria) => {
    try {
      const response = await api.get('/hotels/search', { params: criteria })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi tìm kiếm khách sạn'
      }
    }
  },

  // Get rooms by hotel
  getRoomsByHotel: async (hotelId) => {
    try {
      const response = await api.get(`/hotels/${hotelId}/rooms`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy danh sách phòng'
      }
    }
  },

  // Get room by ID
  getRoomById: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi lấy thông tin phòng'
      }
    }
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    try {
      const response = await api.get(`/rooms/${roomId}/availability`, {
        params: { checkIn, checkOut }
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi kiểm tra tình trạng phòng'
      }
    }
  }
}

export default hotelService
