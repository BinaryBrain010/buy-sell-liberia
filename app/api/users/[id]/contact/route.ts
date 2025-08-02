import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoose"
import { User } from "@/app/api/modules/auth/models/user.model"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[USER CONTACT API] Getting contact info for user: ${params.id}`)

    await connectDB()

    // Find user by ID
    const user = await User.findById(params.id).select('phone fullName')

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log(`[USER CONTACT API] Contact info retrieved for: ${user.fullName}`)

    return NextResponse.json({
      phone: user.phone,
      name: user.fullName
    })

  } catch (error: any) {
    console.error("[USER CONTACT API] Error:", error.message)
    return NextResponse.json(
      { error: "Failed to get contact information" },
      { status: 500 }
    )
  }
}
