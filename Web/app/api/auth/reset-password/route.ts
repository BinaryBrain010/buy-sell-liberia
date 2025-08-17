import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import {AuthService} from '@/app/api/modules/auth/services/auth.service';

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[RESET PASSWORD ROUTE] Processing password reset request")

    const body = await request.json()
    const { email, otp, newPassword } = body

    if (!email || !otp || !newPassword) {
      console.log("[RESET PASSWORD ROUTE] Missing required fields")
      return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      console.log("[RESET PASSWORD ROUTE] Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const result = await authService.resetPassword(email, otp, newPassword)

    console.log("[RESET PASSWORD ROUTE] Password reset successful for:", email)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("[RESET PASSWORD ROUTE] Password reset error:", error.message)
    return NextResponse.json({ error: error.message || "Password reset failed" }, { status: 400 })
  }
}
