import { type NextRequest, NextResponse } from "next/server"
import {AuthService} from '@/app/api/modules/auth/services/auth.service';

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[RESEND OTP ROUTE] Processing resend OTP request")

    const body = await request.json()
    const { email, type = "EMAIL_VERIFICATION" } = body

    if (!email) {
      console.log("[RESEND OTP ROUTE] Missing email")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await authService.generateAndSendOTP(email, type)

    console.log("[RESEND OTP ROUTE] OTP resent successfully to:", email)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("[RESEND OTP ROUTE] Resend OTP error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to resend OTP" }, { status: 400 })
  }
}

