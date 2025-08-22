import axios from "axios"
import { clearAllAuthData } from "@/lib/jwt"

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`)
    
    // Add authorization header if token exists
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage first
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('[AXIOS] Added Bearer token to request')
      }
    }
    
    return config
  },
  (error) => {
    console.error("[AXIOS] Request error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response ${response.status} from ${response.config.url}`)
    
    // Store tokens if they exist in the response
    if (response.data?.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken)
        console.log('[AXIOS] Stored access token')
      }
    }
    
    return response
  },
  (error) => {
    console.error("[AXIOS] Response error:", error.response?.data || error.message)
    
    // Handle 401 errors by clearing all authentication data
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearAllAuthData()
        console.log('[AXIOS] Cleared all authentication data due to 401 error')
      }
    }
    
    return Promise.reject(error)
  },
)

export default axiosInstance
