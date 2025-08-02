import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("[UPLOAD API] Handling file upload")

    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const uploadType = formData.get("type") as string
    const productId = formData.get("productId") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!uploadType) {
      return NextResponse.json({ error: "Upload type is required" }, { status: 400 })
    }

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File ${file.name} is too large (max 5MB)`)
        continue
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${file.name} has unsupported format`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      return NextResponse.json({ 
        error: "No valid files to upload", 
        details: errors 
      }, { status: 400 })
    }

    // Note: Since we can't use Firebase Storage directly in API routes due to client-side nature,
    // we'll return the file information for client-side upload
    const fileInfos = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))

    console.log(`[UPLOAD API] Validated ${validFiles.length} files for upload`)

    return NextResponse.json({
      message: "Files validated successfully",
      files: fileInfos,
      errors: errors.length > 0 ? errors : undefined,
      uploadInfo: {
        userId: authResult.userId,
        uploadType,
        productId: uploadType === "product" ? productId : undefined
      }
    })

  } catch (error: any) {
    console.error("[UPLOAD API] Upload error:", error.message)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}

// GET method to retrieve upload configurations
export async function GET() {
  try {
    const config = {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      maxFiles: 10,
      uploadTypes: ["avatar", "product"]
    }

    return NextResponse.json({
      message: "Upload configuration retrieved",
      config
    })
  } catch (error: any) {
    console.error("[UPLOAD API] Get config error:", error.message)
    return NextResponse.json({ error: "Failed to get upload config" }, { status: 500 })
  }
}
