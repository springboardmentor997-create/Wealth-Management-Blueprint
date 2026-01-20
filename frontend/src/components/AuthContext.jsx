import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auth')
      const plainToken = localStorage.getItem('token')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUser(parsed.user)
        setToken(parsed.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
        // ensure compatibility with apiClient which reads `token`
        localStorage.setItem('token', parsed.token)
      } else if (plainToken) {
        // if only a plain token exists, set it on axios so requests work
        setToken(plainToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${plainToken}`
      }
    } catch (e) {
      console.error("Failed to load auth from storage", e)
      localStorage.removeItem('auth')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:8000/auth/login', { email, password })
    const data = res.data
    setUser(data.user)
    setToken(data.access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    // persist both shapes for compatibility across the app
    localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.access_token }))
    localStorage.setItem('token', data.access_token)
    return data
  }

  const register = async (payload) => {
    const res = await axios.post('http://localhost:8000/auth/register', payload)
    return res.data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('auth')
    localStorage.removeItem('token')
  }

  const updateUser = (userData) => {
    // merge updates
    const newUser = { ...user, ...userData }
    setUser(newUser)
    // update localStorage
    const saved = localStorage.getItem('auth')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.user = newUser
      localStorage.setItem('auth', JSON.stringify(parsed))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
