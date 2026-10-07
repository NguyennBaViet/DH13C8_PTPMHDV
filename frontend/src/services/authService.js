import api from './api'

const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        usernameOrEmail: username,
        password
      })
      
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi đăng nhập'
      }
    }
  },

  // Register
  register: async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi đăng ký'
      }
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken
      })
      if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi làm mới token'
      }
    }
  },

  // Validate token
  validateToken: async () => {
    try {
      const response = await api.post('/auth/validate-token')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: 'Token không hợp lệ'
      }
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi đổi mật khẩu'
      }
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi gửi email đặt lại mật khẩu'
      }
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Lỗi đặt lại mật khẩu'
      }
    }
  }
}

export default authService
