import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"
import { secretKey } from "../enviroment/enviroment"

// Mark routes using this middleware as dynamic
export const dynamic = 'force-dynamic'

export function getUserFromRequest(req: NextRequest) {
  try {
    // First try to get token from cookies (preferred)
    let token = req.cookies.get("accessToken")?.value
    
    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7) // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) return null

    const decoded = jwt.verify(token, secretKey) as { userId: string; email?: string; [key: string]: any }
    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function requireAuth(req: NextRequest) {
  const user = getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

export async function verifyToken(req: NextRequest): Promise<{ success: boolean; userId?: string; user?: any }> {
  try {
    const user = getUserFromRequest(req)
    if (user && user.userId) {
      return { success: true, userId: user.userId, user }
    }
    return { success: false }
  } catch (error) {
    console.error("Token verification error:", error)
    return { success: false }
  }
}

// Helper function for optional authentication (doesn't require auth but provides user if available)
export async function optionalAuth(req: NextRequest): Promise<{ userId?: string; user?: any }> {
  try {
    const user = getUserFromRequest(req)
    return user ? { userId: user.userId, user } : {}
  } catch (error) {
    console.error("Optional auth error:", error)
    return {}
  }
}
