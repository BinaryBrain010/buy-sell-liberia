import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoose"
import { AuthService } from "@/app/api/modules/auth/services/auth.service"

const authService = new AuthService()

export async function POST(request: NextRequest) {
  try {
    console.log("[SIGNUP ROUTE] Processing signup request")

    const body = await request.json()
    console.log("[SIGNUP ROUTE] Request body:", { ...body, password: "[HIDDEN]" })

    const { fullName, username, email, phone, password, country } = body

    // Validation
    if (!fullName || !username || !email || !password || !country) {
      console.log("[SIGNUP ROUTE] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("[SIGNUP ROUTE] Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    if (username.length < 3) {
      console.log("[SIGNUP ROUTE] Username too short")
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[SIGNUP ROUTE] Invalid email format")
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const result = await authService.signup({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      password,
      country: country.trim(),
    })

    console.log("[SIGNUP ROUTE] Signup successful:", result.email)

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("[SIGNUP ROUTE] Signup error:", error.message)
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 })
  }
}

