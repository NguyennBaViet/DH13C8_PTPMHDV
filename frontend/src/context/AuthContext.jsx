import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const result = await authService.login(username, password)
    if (result.success) {
      setUser(result.data.user)
    }
    return result
  }

  const register = async (data) => {
    return await authService.register(data)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const changePassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword)
  }

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email)
  }

  const resetPassword = async (token, newPassword) => {
    return await authService.resetPassword(token, newPassword)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
