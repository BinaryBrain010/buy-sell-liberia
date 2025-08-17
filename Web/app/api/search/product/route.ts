import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/app/api/modules/products/services/product.service";

const productService = new ProductService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit")) || 10;

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const filters: any = {
      search: query,
      status: "active", // Optional: Only show active listings
    };

    const sortOptions = {
      sortBy: "createdAt" as "createdAt",
      sortOrder: "desc" as "desc",
    };

    const result = await productService.getProducts(filters, sortOptions, {
      page: 1,
      limit,
    });

    return NextResponse.json({
      results: result.products.map((product) => ({
        id: product._id,
        title: product.title,
        category: product.category,
        price: product.price,
        image: product.images[product.titleImageIndex || 0],
      })),
    });
  } catch (error: any) {
    console.error("[SEARCH API] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
