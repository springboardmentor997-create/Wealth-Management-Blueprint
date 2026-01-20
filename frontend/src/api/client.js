import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE,
})

// Add token to every request
apiClient.interceptors.request.use((config) => {
  let token = localStorage.getItem('token')
  if (!token) {
    const auth = localStorage.getItem('auth')
    if (auth) {
      try {
        token = JSON.parse(auth).token
      } catch (e) {
        token = null
      }
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
