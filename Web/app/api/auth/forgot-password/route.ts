import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import {AuthService} from '@/app/api/modules/auth/services/auth.service';

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[FORGOT PASSWORD ROUTE] Processing forgot password request")

    const body = await request.json()
    const { email } = body

    if (!email) {
      console.log("[FORGOT PASSWORD ROUTE] Missing email")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await authService.forgotPassword(email)

    console.log("[FORGOT PASSWORD ROUTE] Password reset OTP sent to:", email)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("[FORGOT PASSWORD ROUTE] Forgot password error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to send password reset code" }, { status: 400 })
  }
}
