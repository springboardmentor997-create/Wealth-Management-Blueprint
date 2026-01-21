import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

/* ✅ DEFINE FIRST */
const API_URL = "http://localhost:8000"


/* ✅ THEN USE */
axios.defaults.baseURL = API_URL

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post('/api/auth/login', formData)
      const { access_token, refresh_token } = response.data

      localStorage.setItem('access_token', access_token)
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
      }
      setToken(access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      await fetchUser()
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

 const register = async (userData) => {
    try {
      const payload = {
        name: userData.name, // ✅ Backend expects 'name', not 'full_name'
        email: userData.email,
        password: userData.password,
        risk_profile: userData.risk_profile.toLowerCase(),
      }

      const response = await axios.post('/api/auth/register', payload)
      return response.data
    } catch (error) {
      throw error
    }
  }


  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
