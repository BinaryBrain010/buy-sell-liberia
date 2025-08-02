import { NextRequest, NextResponse } from "next/server"
import { ProductService } from "../../modules/products/services/product.service"
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const productService = new ProductService()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[PRODUCTS API] Getting product by ID:", params.id)

    const { searchParams } = new URL(request.url)
    const incrementViews = searchParams.get("incrementViews") === "true"

    const product = await productService.getProductById(params.id, incrementViews)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("[PRODUCTS API] Product retrieved successfully")

    return NextResponse.json({
      message: "Product retrieved successfully",
      product,
    })
  } catch (error: any) {
    console.error("[PRODUCTS API] Get product error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to get product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[PRODUCTS API] Updating product:", params.id)

    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const updateData = body

    // Update product
    const product = await productService.updateProduct(params.id, authResult.userId, updateData)

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    console.log("[PRODUCTS API] Product updated successfully")

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error: any) {
    console.error("[PRODUCTS API] Update product error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[PRODUCTS API] Deleting product:", params.id)

    // Verify authentication
    const authResult = await verifyToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await productService.deleteProduct(params.id, authResult.userId)

    console.log("[PRODUCTS API] Product deleted successfully")

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    console.error("[PRODUCTS API] Delete product error:", error.message)
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 400 })
  }
}
