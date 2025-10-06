import React, { createContext, useState, useEffect } from 'react'
import api, { setToken } from '../services/api'

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mc_token')
    const name = localStorage.getItem('mc_name')
    const role = localStorage.getItem('mc_role')
    const userId = localStorage.getItem('mc_userId')
    if (token) {
      setToken(token)
      setUser({ name, role, userId })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    const { token, name, role, userId } = res.data
    localStorage.setItem('mc_token', token)
    localStorage.setItem('mc_name', name)
    localStorage.setItem('mc_role', role)
    localStorage.setItem('mc_userId', userId)
    setToken(token)
    setUser({ name, role, userId })
    return res.data
  }

  const signup = async (name, email, password, role) => {
    const res = await api.post('/api/auth/signup', { name, email, password, role })
    const { token, name: n, role: r, userId } = res.data
    localStorage.setItem('mc_token', token)
    localStorage.setItem('mc_name', n)
    localStorage.setItem('mc_role', r)
    localStorage.setItem('mc_userId', userId)
    setToken(token)
    setUser({ name: n, role: r, userId })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('mc_token')
    localStorage.removeItem('mc_name')
    localStorage.removeItem('mc_role')
    localStorage.removeItem('mc_userId')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
