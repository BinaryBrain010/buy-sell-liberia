import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../modules/auth/services/auth.service"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[GOOGLE LOGIN ROUTE] Processing Google login request")

    const body = await request.json()
    const { email } = body

    if (!email) {
      console.log("[GOOGLE LOGIN ROUTE] Missing email")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const result = await authService.loginWithGoogle(email)

    // Set HTTP-only cookies for tokens
    const response = NextResponse.json(
      {
        message: "Google login successful",
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 200 },
    )

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("[GOOGLE LOGIN ROUTE] Google login successful for:", email)
    return response
  } catch (error: any) {
    console.error("[GOOGLE LOGIN ROUTE] Google login error:", error.message)
    return NextResponse.json({ error: error.message || "Google login failed" }, { status: 400 })
  }
}

