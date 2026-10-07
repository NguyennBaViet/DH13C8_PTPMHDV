import api from './api'

const hotelService = {
  // Get all hotels with pagination
  getHotels: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/hotels', { params: { page, size } })
      // Backend returns Page<HotelResponse>
      return response.data?.content || []
    } catch (error) {
      console.error('Error fetching hotels:', error)
      throw error
    }
  },

  // Get all hotels (simplified - returns all without pagination)
  getAllHotels: async () => {
    try {
      const response = await api.get('/hotels', { params: { page: 0, size: 1000 } })
      return response.data?.content || []
    } catch (error) {
      console.error('Error fetching all hotels:', error)
      throw error
    }
  },

  // Get hotel by ID
  getHotelById: async (hotelId) => {
    try {
      const response = await api.get(`/hotels/${hotelId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching hotel:', error)
      throw error
    }
  },

  // Search hotels with filters
  searchHotels: async (city, minStar, maxStar, page = 0, size = 10) => {
    try {
      const response = await api.get('/hotels/search', {
        params: { city, minStar, maxStar, page, size }
      })
      // Backend returns Page<HotelResponse>
      return response.data?.content || []
    } catch (error) {
      console.error('Error searching hotels:', error)
      throw error
    }
  },

  // Get rooms by hotel (calls room service instead)
  getRoomsByHotel: async (hotelId) => {
    try {
      const response = await api.get(`/rooms/hotel/${hotelId}`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching rooms by hotel:', error)
      throw error
    }
  },

  // Create hotel
  createHotel: async (hotelData) => {
    try {
      const response = await api.post('/hotels', hotelData)
      return response.data
    } catch (error) {
      console.error('Error creating hotel:', error)
      throw error
    }
  },

  // Update hotel
  updateHotel: async (hotelId, hotelData) => {
    try {
      const response = await api.put(`/hotels/${hotelId}`, hotelData)
      return response.data
    } catch (error) {
      console.error('Error updating hotel:', error)
      throw error
    }
  },

  // Delete hotel
  deleteHotel: async (hotelId) => {
    try {
      await api.delete(`/hotels/${hotelId}`)
      return true
    } catch (error) {
      console.error('Error deleting hotel:', error)
      throw error
    }
  }
}

export default hotelService
