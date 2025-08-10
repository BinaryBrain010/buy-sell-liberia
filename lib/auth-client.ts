import axios from "../app/services/BaseService"

interface User {
  id: string
  name: string
  email: string
  username: string
  isEmailVerified: boolean
}

interface LoginResponse {
  message: string
  user: User
  accessToken?: string
  refreshToken?: string
}

interface SignupData {
  fullName: string
  username: string
  email: string
  phone?: string
  password: string
  country: string
}

interface SignupResponse {
  message: string
  email: string
}

class AuthClient {
  async login(email: string, password: string): Promise<User> {
    try {
      console.log("[AUTH CLIENT] Sending login request for:", email)
      const response = await axios.post<LoginResponse>("/auth/login", {
        email,
        password,
      })

      console.log("[AUTH CLIENT] Login response:", response.data)
      
      // Store tokens if they exist in the response
      if (response.data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.data.accessToken)
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }
          console.log("[AUTH CLIENT] Stored tokens")
        }
      }
      
      return response.data.user
    } catch (error: any) {
      console.error("[AUTH CLIENT] Login error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Login failed")
    }
  }

  async signup(userData: SignupData): Promise<SignupResponse> {
    try {
      console.log("[AUTH CLIENT] Sending signup request for:", userData.email)
      const response = await axios.post<SignupResponse>("/auth/signup", userData)
      console.log("[AUTH CLIENT] Signup response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("[AUTH CLIENT] Signup error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Signup failed")
    }
  }

  async checkGoogleUser(email: string): Promise<boolean> {
    try {
      console.log("[AUTH CLIENT] Checking if Google user exists:", email)
      const response = await axios.post("/auth/check-google-user", { email })
      console.log("[AUTH CLIENT] Google user check response:", response.data)
      return response.data.exists
    } catch (error: any) {
      console.error("[AUTH CLIENT] Google user check error:", error.response?.data || error.message)
      return false
    }
  }

  async loginWithGoogle(email: string): Promise<User> {
    try {
      console.log("[AUTH CLIENT] Sending Google login request for:", email)
      const response = await axios.post<LoginResponse>("/auth/google-login", { email })
      console.log("[AUTH CLIENT] Google login response:", response.data)
      
      // Store tokens if they exist in the response
      if (response.data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.data.accessToken)
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken)
          }
          console.log("[AUTH CLIENT] Stored tokens from Google login")
        }
      }
      
      return response.data.user
    } catch (error: any) {
      console.error("[AUTH CLIENT] Google login error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Google login failed")
    }
  }

  async sendOtp(email: string, type: "verification" | "reset" = "verification"): Promise<void> {
    try {
      console.log(`[AUTH CLIENT] Sending ${type} OTP request for:`, email)
      const endpoint = type === "reset" ? "/auth/forgot-password" : "/auth/resend-otp"
      const payload = type === "reset" ? { email } : { email, type: "EMAIL_VERIFICATION" }
      const response = await axios.post(endpoint, payload)
      console.log(`[AUTH CLIENT] ${type} OTP response:`, response.data)
    } catch (error: any) {
      console.error(`[AUTH CLIENT] Send ${type} OTP error:`, error.response?.data || error.message)
      throw new Error(error.response?.data?.error || `Failed to send ${type} OTP`)
    }
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    try {
      console.log("[AUTH CLIENT] Sending OTP verification request for:", email)
      const response = await axios.post("/auth/verify-email", {
        email,
        otp,
      })
      console.log("[AUTH CLIENT] OTP verification response:", response.data)
    } catch (error: any) {
      console.error("[AUTH CLIENT] OTP verification error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "OTP verification failed")
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    try {
      console.log("[AUTH CLIENT] Sending password reset request for:", email)
      const response = await axios.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      })
      console.log("[AUTH CLIENT] Password reset response:", response.data)
    } catch (error: any) {
      console.error("[AUTH CLIENT] Password reset error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Password reset failed")
    }
  }

  async logout(): Promise<void> {
    try {
      console.log("[AUTH CLIENT] Sending logout request")
      const response = await axios.post("/auth/logout")
      console.log("[AUTH CLIENT] Logout response:", response.data)
      
      // Clear tokens on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        console.log("[AUTH CLIENT] Cleared tokens")
      }
    } catch (error: any) {
      console.error("[AUTH CLIENT] Logout error:", error.response?.data || error.message)
      // Clear tokens even if logout request fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        console.log("[AUTH CLIENT] Cleared tokens despite error")
      }
      throw new Error(error.response?.data?.error || "Logout failed")
    }
  }

  async getProfile(): Promise<User> {
    try {
      console.log("[AUTH CLIENT] Fetching user profile")
      const response = await axios.get<{ user: User }>("/auth/profile")
      console.log("[AUTH CLIENT] Profile response:", response.data)
      return response.data.user
    } catch (error: any) {
      console.error("[AUTH CLIENT] Get profile error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Failed to get profile")
    }
  }

  async refreshToken(): Promise<void> {
    try {
      console.log("[AUTH CLIENT] Refreshing token")
      const response = await axios.post("/auth/refresh-token")
      console.log("[AUTH CLIENT] Token refresh response:", response.data)
    } catch (error: any) {
      console.error("[AUTH CLIENT] Token refresh error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.error || "Token refresh failed")
    }
  }
}

export const authClient = new AuthClient()
