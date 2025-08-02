import { NextRequest, NextResponse } from "next/server"
import { ProductService } from "../modules/products/services/product.service"
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware"
import { parseFiles, validateFiles } from "@/lib/multer"
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload"
import mongoose from "mongoose"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const productService = new ProductService()

export async function POST(request: NextRequest) {
  try {
    console.log("[PRODUCTS API] Creating new product")

    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse files and fields using multer
    const { files: imageFiles, fields } = await parseFiles(request)
    
    // Parse form data from JSON string
    let formData
    try {
      formData = JSON.parse(fields.formData || '{}')
    } catch (error) {
      return NextResponse.json({ error: "Invalid form data format" }, { status: 400 })
    }
    
    // Extract form fields
    const title = formData.title
    const description = formData.description
    const price = parseFloat(formData.price)
    const category = formData.category
    const subCategory = formData.subCategory || ''
    const condition = formData.condition
    const negotiable = formData.negotiable === true
    const showPhoneNumber = formData.showPhoneNumber === true
    const titleImageIndex = parseInt(formData.titleImageIndex) || 0
    const location = formData.location || {}
    const contactInfo = formData.contactInfo || {}
    const tags = formData.tags || []
    const specifications = formData.specifications || {}
    
    // Validate image files
    const validation = validateImageFilesForLocal(imageFiles)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "Image validation failed", 
        details: validation.errors 
      }, { status: 400 })
    }
    
    console.log(`[PRODUCTS API] Processing ${imageFiles.length} images`)
    
    // Validate required fields before processing
    if (!title || !description || !price || !category || !location) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price, category, location" },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 })
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 })
    }
    
    // Generate product ID for file naming
    const productId = new mongoose.Types.ObjectId().toString()
    
    // Upload images to local storage
    const imagePaths = await uploadProductImagesToLocal(
      imageFiles,
      category,
      productId,
      title
    )

    // Validation for images
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Validate title image index
    if (titleImageIndex < 0 || titleImageIndex >= imagePaths.length) {
      return NextResponse.json({ error: "Invalid title image index" }, { status: 400 })
    }

    // Create product with image paths
    const product = await productService.createProduct(authResult.userId, {
      title,
      description,
      price,
      category,
      subCategory,
      condition,
      images: imagePaths,
      titleImageIndex,
      location,
      contactInfo,
      tags,
      specifications,
      negotiable,
      showPhoneNumber,
    })

    console.log("[PRODUCTS API] Product created successfully:", product._id)

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          condition: product.condition,
          images: product.images,
          titleImageIndex: product.titleImageIndex,
          status: product.status,
          createdAt: product.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[PRODUCTS API] Create product error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[PRODUCTS API] Getting products")

    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters: any = {}
    if (searchParams.get("category")) filters.category = searchParams.get("category")
    if (searchParams.get("minPrice")) filters.minPrice = Number(searchParams.get("minPrice"))
    if (searchParams.get("maxPrice")) filters.maxPrice = Number(searchParams.get("maxPrice"))
    if (searchParams.get("condition")) filters.condition = searchParams.get("condition")?.split(",")
    if (searchParams.get("search")) filters.search = searchParams.get("search")
    if (searchParams.get("seller")) filters.seller = searchParams.get("seller")
    if (searchParams.get("status")) filters.status = searchParams.get("status")

    // Location filters
    if (searchParams.get("city") || searchParams.get("state") || searchParams.get("country")) {
      filters.location = {}
      if (searchParams.get("city")) filters.location.city = searchParams.get("city")
      if (searchParams.get("state")) filters.location.state = searchParams.get("state")
      if (searchParams.get("country")) filters.location.country = searchParams.get("country")
    }

    // Parse sort options
    const sortOptions: any = {}
    if (searchParams.get("sortBy")) sortOptions.sortBy = searchParams.get("sortBy")
    if (searchParams.get("sortOrder")) sortOptions.sortOrder = searchParams.get("sortOrder")

    // Parse pagination
    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 20

    const result = await productService.getProducts(filters, sortOptions, { page, limit })

    console.log(`[PRODUCTS API] Returning ${result.products.length} products`)

    return NextResponse.json({
      message: "Products retrieved successfully",
      ...result,
    })
  } catch (error: any) {
    console.error("[PRODUCTS API] Get products error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to get products" }, { status: 500 })
  }
}
