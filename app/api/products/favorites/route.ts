import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../modules/products/services/product.service";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';
const productService = new ProductService();

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const page = Number(new URL(request.url).searchParams.get("page")) || 1;
    const limit = Number(new URL(request.url).searchParams.get("limit")) || 20;
    const result = await productService.getUserFavorites(authResult.userId, { page, limit });
    return NextResponse.json({
      message: "Favorite products retrieved successfully",
      products: result.products,
      total: result.total,
      page: result.currentPage,
      totalPages: result.pages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get favorites" }, { status: 500 });
  }
}
