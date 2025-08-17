import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AuthService } from "../../modules/auth/services/auth.service"
import jwt from "jsonwebtoken"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGOUT ROUTE] Processing logout request")

    const accessToken = request.cookies.get("accessToken")?.value

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as { userId: string }
        await authService.logout(decoded.userId)
      } catch (error) {
        console.log("[LOGOUT ROUTE] Invalid token, proceeding with logout")
      }
    }

    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 })

    // Clear cookies
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")

    console.log("[LOGOUT ROUTE] Logout successful")
    return response
  } catch (error: any) {
    console.error("[LOGOUT ROUTE] Logout error:", error.message)
    return NextResponse.json({ error: error.message || "Logout failed" }, { status: 400 })
  }
}

