import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoose"
import { AuthService } from "@/app/api/modules/auth/services/auth.service"


const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[VERIFY EMAIL ROUTE] Processing verification request")

    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      console.log("[VERIFY EMAIL ROUTE] Missing email or OTP")
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const result = await authService.verifyEmail(email, otp)

    console.log("[VERIFY EMAIL ROUTE] Verification successful for:", email)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error("[VERIFY EMAIL ROUTE] Verification error:", error.message)
    return NextResponse.json({ error: error.message || "Email verification failed" }, { status: 400 })
  }
}

