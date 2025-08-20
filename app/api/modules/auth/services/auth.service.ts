import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model"
import { PendingUser } from "../models/pending-user.model"
import { OTP } from "../models/otp.model"
import { EmailService } from "./email.service"
import { connectDB } from "@/lib/mongoose"

export class AuthService {
  resendOtp(email: any, type: any) {
    throw new Error('Method not implemented.')
  }
  private emailService = new EmailService()

  async signup(userData: {
    fullName: string
    username: string
    email: string
    phone?: string
    password: string
    country: string
  }) {
    try {
      console.log("[AUTH SERVICE] Starting signup process for:", userData.email)
      await connectDB()

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      })

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new Error("Email already registered")
        }
        if (existingUser.username === userData.username) {
          throw new Error("Username already taken")
        }
      }

      // Check if there's already a pending user
      const existingPendingUser = await PendingUser.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      })

      if (existingPendingUser) {
        // Delete existing pending user to allow re-registration
        await PendingUser.deleteOne({ _id: existingPendingUser._id })
        console.log("[AUTH SERVICE] Removed existing pending user")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Create pending user
      const pendingUser = new PendingUser({
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone || "",
        password: hashedPassword,
        country: userData.country,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })

      await pendingUser.save()
      console.log("[AUTH SERVICE] Pending user created:", userData.email)

      // Generate and send OTP
      await this.generateAndSendOTP(userData.email, "EMAIL_VERIFICATION")

      return {
        message: "Registration successful. Please check your email for verification code.",
        email: userData.email,
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Signup error:", error.message)
      throw new Error(error.message || "Registration failed")
    }
  }

  async login(email: string, password: string) {
    try {
      console.log("[AUTH SERVICE] Starting login process for:", email)
      await connectDB()

      const user = await User.findOne({ email })
      if (!user) {
        throw new Error("Invalid email or password")
      }

      if (!user.isEmailVerified) {
        throw new Error("Please verify your email before logging in")
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error("Invalid email or password")
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id.toString())
      const refreshToken = this.generateRefreshToken(user._id.toString())

      // Update user with refresh token
      user.refreshToken = refreshToken
      await user.save()

      console.log("[AUTH SERVICE] Login successful for:", email)

      return {
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Login error:", error.message)
      throw new Error(error.message || "Login failed")
    }
  }

  async verifyEmail(email: string, otp: string) {
    try {
      console.log("[AUTH SERVICE] Starting email verification for:", email)
      await connectDB()

      // Find and verify OTP
      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: "EMAIL_VERIFICATION",
        expiresAt: { $gt: new Date() },
      })

      if (!otpRecord) {
        throw new Error("Invalid or expired OTP")
      }

      // Find pending user
      const pendingUser = await PendingUser.findOne({ email })
      if (!pendingUser) {
        throw new Error("Pending user not found")
      }

      // Create verified user
      const user = new User({
        fullName: pendingUser.fullName,
        username: pendingUser.username,
        email: pendingUser.email,
        phone: pendingUser.phone,
        password: pendingUser.password,
        country: pendingUser.country,
        isEmailVerified: true,
        createdAt: new Date(),
      })

      await user.save()

      // Clean up
      await PendingUser.deleteOne({ email })
      await OTP.deleteOne({ _id: otpRecord._id })

      console.log("[AUTH SERVICE] Email verification successful for:", email)

      return {
        message: "Email verified successfully. You can now log in.",
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
        },
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Email verification error:", error.message)
      throw new Error(error.message || "Email verification failed")
    }
  }

  async generateAndSendOTP(email: string, type: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
    try {
      console.log(`[AUTH SERVICE] Generating ${type} OTP for:`, email)
      await connectDB()

      // Delete existing OTPs for this email and type
      await OTP.deleteMany({ email, type })

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // Save OTP to database
      const otpRecord = new OTP({
        email,
        otp,
        type,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      })

      await otpRecord.save()
      console.log(`[AUTH SERVICE] OTP saved to database for ${email}:`, otp)

      // Send email
      if (type === "EMAIL_VERIFICATION") {
        await this.emailService.sendVerificationEmail(email, otp)
      } else {
        await this.emailService.sendPasswordResetEmail(email, otp)
      }

      console.log(`[AUTH SERVICE] ${type} OTP sent successfully to:`, email)

      return {
        message: `${type === "EMAIL_VERIFICATION" ? "Verification" : "Password reset"} code sent to your email`,
      }
    } catch (error: any) {
      console.error(`[AUTH SERVICE] Generate and send OTP error:`, error.message)
      throw new Error(error.message || "Failed to send OTP")
    }
  }

  async forgotPassword(email: string) {
    try {
      console.log("[AUTH SERVICE] Starting forgot password for:", email)
      await connectDB()

      const user = await User.findOne({ email })
      if (!user) {
        throw new Error("User not found")
      }

      await this.generateAndSendOTP(email, "PASSWORD_RESET")

      return {
        message: "Password reset code sent to your email",
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Forgot password error:", error.message)
      throw new Error(error.message || "Failed to send password reset code")
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    try {
      console.log("[AUTH SERVICE] Starting password reset for:", email)
      await connectDB()

      // Verify OTP
      const otpRecord = await OTP.findOne({
        email,
        otp,
        type: "PASSWORD_RESET",
        expiresAt: { $gt: new Date() },
      })

      if (!otpRecord) {
        throw new Error("Invalid or expired OTP")
      }

      // Find user and update password
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error("User not found")
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      user.password = hashedPassword
      await user.save()

      // Clean up OTP
      await OTP.deleteOne({ _id: otpRecord._id })

      console.log("[AUTH SERVICE] Password reset successful for:", email)

      return {
        message: "Password reset successful",
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Password reset error:", error.message)
      throw new Error(error.message || "Password reset failed")
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log("[AUTH SERVICE] Refreshing token")
      await connectDB()

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }

      const user = await User.findById(decoded.userId)
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token")
      }

      const newAccessToken = this.generateAccessToken(user._id.toString())
      const newRefreshToken = this.generateRefreshToken(user._id.toString())

      user.refreshToken = newRefreshToken
      await user.save()

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Refresh token error:", error.message)
      throw new Error("Invalid refresh token")
    }
  }

  async logout(userId: string) {
    try {
      console.log("[AUTH SERVICE] Logging out user:", userId)
      await connectDB()

      await User.findByIdAndUpdate(userId, { refreshToken: null })

      return {
        message: "Logged out successfully",
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Logout error:", error.message)
      throw new Error("Logout failed")
    }
  }

  async getProfile(userId: string) {
    try {
      console.log("[AUTH SERVICE] Getting profile for user:", userId)
      await connectDB()

      const user = await User.findById(userId).select("-password -refreshToken")
      if (!user) {
        throw new Error("User not found")
      }

      return {
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
        },
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Get profile error:", error.message)
      throw new Error("Failed to get profile")
    }
  }

  async checkUserExists(email: string) {
    try {
      console.log("[AUTH SERVICE] Checking if user exists:", email)
      await connectDB()

      const user = await User.findOne({ email })
      return !!user
    } catch (error: any) {
      console.error("[AUTH SERVICE] Check user exists error:", error.message)
      return false
    }
  }

  async loginWithGoogle(email: string) {
    try {
      console.log("[AUTH SERVICE] Google login for:", email)
      await connectDB()

      const user = await User.findOne({ email })
      if (!user) {
        throw new Error("User not found")
      }

      if (!user.isEmailVerified) {
        throw new Error("Please verify your email before logging in")
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id.toString())
      const refreshToken = this.generateRefreshToken(user._id.toString())

      // Update user with refresh token
      user.refreshToken = refreshToken
      await user.save()

      console.log("[AUTH SERVICE] Google login successful for:", email)

      return {
        user: {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      }
    } catch (error: any) {
      console.error("[AUTH SERVICE] Google login error:", error.message)
      throw new Error(error.message || "Google login failed")
    }
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" })
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" })
  }
}
