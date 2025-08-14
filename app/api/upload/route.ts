import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware"
import path from "path"
import fs from "fs"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// File upload configuration
const uploadDir = path.join(process.cwd(), 'public', 'uploads')

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

    console.log(`[UPLOAD API] Processing ${files.length} files for upload`)

    // Process and store files
    const uploadedFiles: Array<{ name: string; path: string; url: string; size: number }> = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
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

        // Convert File to Buffer for storage
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = file.name.split('.').pop()
        const filename = `file-${uniqueSuffix}.${ext}`
        
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        
        // Save file to disk
        const filePath = path.join(uploadDir, filename)
        fs.writeFileSync(filePath, buffer)
        
        // Create URL for the uploaded file
        const fileUrl = `/uploads/${filename}`
        
        uploadedFiles.push({
          name: file.name,
          path: filePath,
          url: fileUrl,
          size: file.size
        })
        
        console.log(`[UPLOAD API] Successfully uploaded: ${filename}`)
        
      } catch (fileError: any) {
        console.error(`[UPLOAD API] Error processing file ${file.name}:`, fileError)
        errors.push(`Failed to process ${file.name}: ${fileError.message}`)
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ 
        error: "No files were successfully uploaded", 
        details: errors 
      }, { status: 400 })
    }

    console.log(`[UPLOAD API] Successfully uploaded ${uploadedFiles.length} files`)

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles.map(file => ({
        name: file.name,
        url: file.url,
        size: file.size
      })),
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
