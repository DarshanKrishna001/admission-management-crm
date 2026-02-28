import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser  = localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      } catch (e) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setLoading(false)
  }, [])

  // ── LOGIN — stores token, sets user, redirects to dashboard ───────────────
  const login = async (username, password) => {
    const res  = await axios.post('/api/auth/login', { username, password })
    const data = res.data
    const userData = {
      username: data.username,
      fullName: data.fullName,
      email:    data.email,
      role:     data.role,
    }
    setToken(data.token)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user',  JSON.stringify(userData))
    return data
  }

  // ── REGISTER — only creates account, does NOT log in, does NOT store token ─
  // After register, user must login manually with their credentials
  const register = async (formData) => {
    const res = await axios.post('/api/auth/register', formData)
    // Just return the response — do NOT set user, do NOT store token
    return res.data
  }

  // ── LOGOUT — clears everything ─────────────────────────────────────────────
  const logout = () => {
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // Role helpers
  const isAdmin      = () => user?.role === 'ADMIN'
  const isOfficer    = () => user?.role === 'ADMISSION_OFFICER'
  const isManagement = () => user?.role === 'MANAGEMENT'
  const canWrite     = () => ['ADMIN', 'ADMISSION_OFFICER'].includes(user?.role)

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAdmin, isOfficer, isManagement, canWrite
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}