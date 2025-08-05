import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../modules/products/services/product.service";
import { verifyToken } from "../../../modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';

const productService = new ProductService();

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: any = { user_id: params.userId };
    if (searchParams.get("status")) filters.status = searchParams.get("status")?.split(",");
    const includeExpired = searchParams.get("includeExpired") === "true";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const authResult = await verifyToken(request);
    let status: string | undefined = undefined;
    if (!includeExpired && authResult.success && authResult.userId === params.userId) {
      status = "active";
    }
    const result = await productService.getProductsByUser(params.userId, status, { page, limit });
    return NextResponse.json({
      message: "User products retrieved successfully",
      products: result.products,
      total: result.total,
      page: result.currentPage,
      totalPages: result.pages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get user products" }, { status: 500 });
  }
}
