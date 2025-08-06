import { NextRequest, NextResponse } from "next/server";
import { ProductService, ProductFilters } from "../../modules/products/services/product.service";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const productService = new ProductService();

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SearchProductsResponse {
  products: any[]; // Replace with actual Product interface if available
  total: number;
  currentPage: number;
  pages: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Construct filters from query params
    const filters: ProductFilters = {
      search: searchParams.get("search") || undefined, // Title / Keyword search
      category: searchParams.get("category") || undefined, // Category slug or ID
      seller: searchParams.get("seller") || undefined, // Seller/User ID
      status: searchParams.get("status") || undefined, // e.g., 'active'
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      condition: searchParams.get("condition") ? searchParams.get("condition")!.split(",") : undefined,
      negotiable: searchParams.get("negotiable") === "true" ? true : undefined,
      featured: searchParams.get("featured") === "true" ? true : undefined,
    };

    const pagination: PaginationOptions = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    };

    // Call productService with filters
    const result: SearchProductsResponse = await productService.searchProducts(
      filters.search || "",
      filters,
      pagination
    );

    return NextResponse.json({
      message: "Search results retrieved successfully",
      products: result.products,
      total: result.total,
      page: result.currentPage,
      totalPages: result.pages,
    });
  } catch (error: any) {
    console.error("[PRODUCTS API] Search products error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to search products" }, { status: 500 });
  }
}
