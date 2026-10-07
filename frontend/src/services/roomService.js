import api from './api'

const roomService = {
  // Get all rooms (with pagination)
  getAllRooms: async (page = 0, size = 100) => {
    try {
      const response = await api.get('/rooms', { params: { page, size } })
      // Backend returns Page<RoomResponse>, so extract content array
      return response.data?.content || []
    } catch (error) {
      console.error('Error fetching rooms:', error)
      throw error
    }
  },

  // Get room by ID
  getRoomById: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching room:', error)
      throw error
    }
  },

  // Get rooms by hotel ID
  getRoomsByHotelId: async (hotelId) => {
    try {
      const response = await api.get(`/rooms/hotel/${hotelId}`)
      // Backend returns List<RoomResponse> directly
      return response.data || []
    } catch (error) {
      console.error('Error fetching rooms by hotel:', error)
      throw error
    }
  },

  // Search available rooms with filters
  searchRooms: async (filters = {}) => {
    try {
      const response = await api.get('/rooms/search', { params: filters })
      // Backend returns Page<RoomResponse>
      return response.data?.content || []
    } catch (error) {
      console.error('Error searching rooms:', error)
      throw error
    }
  },

  // Check room availability for date range
  checkAvailability: async (roomId, checkInDate, checkOutDate) => {
    try {
      const response = await api.get(`/rooms/${roomId}/availability`, {
        params: { checkInDate, checkOutDate }
      })
      return response.data
    } catch (error) {
      console.error('Error checking availability:', error)
      throw error
    }
  },

  // Get availability calendar
  getAvailabilityCalendar: async (roomId, from, to) => {
    try {
      const response = await api.get(`/rooms/${roomId}/availability/calendar`, {
        params: { from, to }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching calendar:', error)
      throw error
    }
  },

  // Create room
  createRoom: async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData)
      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  },

  // Update room
  updateRoom: async (roomId, roomData) => {
    try {
      const response = await api.put(`/rooms/${roomId}`, roomData)
      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  },

  // Delete room
  deleteRoom: async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`)
      return true
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  },

  // Lock room availability (for booking)
  lockRoom: async (roomId, lockData) => {
    try {
      await api.post(`/rooms/${roomId}/availability/lock`, lockData)
      return true
    } catch (error) {
      console.error('Error locking room:', error)
      throw error
    }
  },

  // Unlock room availability (for booking cancellation)
  unlockRoom: async (roomId, unlockData) => {
    try {
      await api.post(`/rooms/${roomId}/availability/unlock`, unlockData)
      return true
    } catch (error) {
      console.error('Error unlocking room:', error)
      throw error
    }
  }
}

export default roomService
