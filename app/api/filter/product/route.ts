import { NextRequest, NextResponse } from "next/server"
import { ProductService } from "@/app/api/modules/products/services/product.service"

export const dynamic = "force-dynamic"

const productService = new ProductService()

const allowedSortFields = ["createdAt", "price", "views", "title", "updatedAt"] as const
type SortBy = typeof allowedSortFields[number]

export async function GET(request: NextRequest) {
  try {
    console.log("[FILTER API] Searching products...")

    const { searchParams } = new URL(request.url)
    const filters: any = {}

    if (searchParams.get("category")) filters.category = searchParams.get("category")
    if (searchParams.get("subCategory")) filters.subCategory = searchParams.get("subCategory")

    const priceMin = searchParams.get("priceMin")
    const priceMax = searchParams.get("priceMax")
    if (priceMin) filters.minPrice = Number(priceMin)
    if (priceMax) filters.maxPrice = Number(priceMax)

    if (searchParams.get("location")) filters["location.city"] = searchParams.get("location")
    if (searchParams.get("condition")) filters.condition = searchParams.get("condition")
    if (searchParams.get("search")) filters.search = searchParams.get("search")

    const customFilters: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("cf_")) {
        customFilters[key.replace("cf_", "")] = value
      }
    }
    if (Object.keys(customFilters).length > 0) {
      filters.customFilters = customFilters
    }

    // ✅ Validate sortBy against allowed values
    const sortByParam = searchParams.get("sortBy")
    const sortBy: SortBy | undefined = allowedSortFields.includes(sortByParam as SortBy)
      ? (sortByParam as SortBy)
      : undefined

    const sortOrder = (searchParams.get("sortOrder") === "asc" ? "asc" : "desc") as "asc" | "desc"

    const page = Number(searchParams.get("page") || "1")
    const limit = Number(searchParams.get("limit") || "20")

    const result = await productService.getProducts(filters, { sortBy, sortOrder }, { page, limit })

    console.log(`[FILTER API] Found ${result.products.length} products`)
    return NextResponse.json({
      message: "Filtered products retrieved",
      ...result,
    })
  } catch (error: any) {
    console.error("[FILTER API] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to filter products" },
      { status: 500 }
    )
  }
}
