import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../modules/auth/services/auth.service"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGIN ROUTE] Processing login request")

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      console.log("[LOGIN ROUTE] Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await authService.login(email, password)

    // Set HTTP-only cookies for tokens
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: result.user,
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

    console.log("[LOGIN ROUTE] Login successful for:", email)
    return response
  } catch (error: any) {
    console.error("[LOGIN ROUTE] Login error:", error.message)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 })
  }
}

