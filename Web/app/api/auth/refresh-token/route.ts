import { type NextRequest, NextResponse } from "next/server"
import {AuthService} from '@/app/api/modules/auth/services/auth.service';

export const dynamic = 'force-dynamic';

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[REFRESH TOKEN ROUTE] Processing token refresh request")

    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      console.log("[REFRESH TOKEN ROUTE] No refresh token found")
      return NextResponse.json({ error: "Refresh token required" }, { status: 401 })
    }

    const result = await authService.refreshToken(refreshToken)

    const response = NextResponse.json({ message: "Token refreshed successfully" }, { status: 200 })

    // Set new tokens as HTTP-only cookies
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

    console.log("[REFRESH TOKEN ROUTE] Token refresh successful")
    return response
  } catch (error: any) {
    console.error("[REFRESH TOKEN ROUTE] Token refresh error:", error.message)
    return NextResponse.json({ error: error.message || "Token refresh failed" }, { status: 401 })
  }
}

