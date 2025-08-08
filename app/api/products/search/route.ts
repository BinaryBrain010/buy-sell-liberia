import { NextRequest, NextResponse } from "next/server";
import { ProductService, ProductFilters } from "../../modules/products/services/product.service";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const productService = new ProductService();



// Define the PaginationOptions type
interface PaginationOptions {
  page: number;
  limit: number;
}

// Define the response type for searchProducts
interface SearchProductsResponse {
  products: any[]; // Replace with a proper Product interface if available
  total: number;
  currentPage: number;
  pages: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: ProductFilters = {};
    if (searchParams.get("category")) filters.category = searchParams.get("category")!;
    if (searchParams.get("minPrice")) filters.minPrice = Number(searchParams.get("minPrice"));
    if (searchParams.get("maxPrice")) filters.maxPrice = Number(searchParams.get("maxPrice"));
    if (searchParams.get("condition")) filters.condition = searchParams.get("condition")!.split(",");
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("seller")) filters.seller = searchParams.get("seller")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("negotiable")) filters.negotiable = searchParams.get("negotiable") === "true";
    if (searchParams.get("featured")) filters.featured = searchParams.get("featured") === "true";

    // Parse pagination
    const pagination: PaginationOptions = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    };

    // Call the service method with filters and pagination
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