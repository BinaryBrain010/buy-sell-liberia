"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { authClient } from "@/lib/auth-client"

interface User {
  id: string
  name: string
  email: string
  username: string
  isEmailVerified: boolean
}

interface SignupData {
  fullName: string
  username: string
  email: string
  phone?: string
  password: string
  country: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<{ email: string; message: string }>
  logout: () => Promise<void>
  sendOtp: (email: string, type?: "verification" | "reset") => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<{ needsRegistration: boolean; userData?: any }>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await authClient.getProfile()
      setUser(userData)
      console.log("[AUTH PROVIDER] User authenticated:", userData)
    } catch (error) {
      console.log("[AUTH PROVIDER] No authenticated user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[AUTH PROVIDER] Attempting login for:", email)
      const userData = await authClient.login(email, password)
      setUser(userData)
      console.log("[AUTH PROVIDER] Login successful:", userData)
    } catch (error) {
      console.error("[AUTH PROVIDER] Login failed:", error)
      throw error
    }
  }

  const signup = async (userData: SignupData) => {
    try {
      console.log("[AUTH PROVIDER] Attempting signup for:", userData.email)
      const result = await authClient.signup(userData)
      console.log("[AUTH PROVIDER] Signup successful, OTP sent")
      return result
    } catch (error) {
      console.error("[AUTH PROVIDER] Signup failed:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authClient.logout()
      setUser(null)
      console.log("[AUTH PROVIDER] Logout successful")
    } catch (error) {
      console.error("[AUTH PROVIDER] Logout error:", error)
      setUser(null) // Clear user anyway
    }
  }

  const sendOtp = async (email: string, type: "verification" | "reset" = "verification") => {
    try {
      console.log(`[AUTH PROVIDER] Sending ${type} OTP to:`, email)
      await authClient.sendOtp(email, type)
      console.log(`[AUTH PROVIDER] ${type} OTP sent successfully`)
    } catch (error) {
      console.error(`[AUTH PROVIDER] Send ${type} OTP failed:`, error)
      throw error
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      console.log("[AUTH PROVIDER] Verifying OTP for:", email)
      await authClient.verifyOtp(email, otp)
      console.log("[AUTH PROVIDER] OTP verification successful")
    } catch (error) {
      console.error("[AUTH PROVIDER] OTP verification failed:", error)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      console.log("[AUTH PROVIDER] Sending forgot password OTP to:", email)
      await authClient.sendOtp(email, "reset")
      console.log("[AUTH PROVIDER] Forgot password OTP sent successfully")
    } catch (error) {
      console.error("[AUTH PROVIDER] Forgot password failed:", error)
      throw error
    }
  }

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      console.log("[AUTH PROVIDER] Resetting password for:", email)
      await authClient.resetPassword(email, otp, newPassword)
      console.log("[AUTH PROVIDER] Password reset successful")
    } catch (error) {
      console.error("[AUTH PROVIDER] Password reset failed:", error)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      console.log("[AUTH PROVIDER] Starting Google login")
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")
      
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Extract user data from Google
      const googleUserData = {
        email: user.email || '',
        fullName: user.displayName || '',
        photoURL: user.photoURL || ''
      }
      
      console.log("[AUTH PROVIDER] Google login successful, checking if user exists in our DB")
      
      // Check if user exists in our database
      try {
        const existingUser = await authClient.checkGoogleUser(user.email!)
        if (existingUser) {
          // User exists, log them in
          const userData = await authClient.loginWithGoogle(user.email!)
          setUser(userData)
          return { needsRegistration: false }
        } else {
          // User doesn't exist, needs registration
          return { needsRegistration: true, userData: googleUserData }
        }
      } catch (error) {
        // User doesn't exist, needs registration
        return { needsRegistration: true, userData: googleUserData }
      }
    } catch (error: any) {
      console.error("[AUTH PROVIDER] Google login error:", error)
      throw new Error(error.message || "Google login failed")
    }
  }

  const refreshToken = async () => {
    try {
      await authClient.refreshToken()
      console.log("[AUTH PROVIDER] Token refreshed successfully")
    } catch (error) {
      console.error("[AUTH PROVIDER] Token refresh failed:", error)
      setUser(null)
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    sendOtp,
    verifyOtp,
    resetPassword,
    forgotPassword,
    loginWithGoogle,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
