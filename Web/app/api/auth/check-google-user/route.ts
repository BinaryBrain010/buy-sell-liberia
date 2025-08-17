import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "../../modules/auth/services/auth.service"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[CHECK GOOGLE USER ROUTE] Processing request")

    const body = await request.json()
    const { email } = body

    if (!email) {
      console.log("[CHECK GOOGLE USER ROUTE] Missing email")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const exists = await authService.checkUserExists(email)

    console.log("[CHECK GOOGLE USER ROUTE] User exists check result:", exists)
    return NextResponse.json({ exists }, { status: 200 })
  } catch (error: any) {
    console.error("[CHECK GOOGLE USER ROUTE] Error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to check user" }, { status: 400 })
  }
}

