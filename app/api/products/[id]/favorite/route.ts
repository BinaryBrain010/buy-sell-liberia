import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../modules/products/services/product.service";
import { verifyToken } from "../../../modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';
const productService = new ProductService();

// Add or toggle favorite
export async function POST(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !params.id || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing product/user id" }, { status: 401 });
    }
    const result = await productService.toggleFavorite(params.id as string, authResult.userId as string);
    return NextResponse.json({
      message: result.isFavorite ? "Added to favorites" : "Removed from favorites",
      isFavorite: result.isFavorite,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update favorite" }, { status: 500 });
  }
}

// Remove from favorites (force remove)
export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !params.id || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing product/user id" }, { status: 401 });
    }
    // Always remove (if present)
    await productService.updateById(params.id as string, { $pull: { favorites: authResult.userId as string } });
    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove favorite" }, { status: 500 });
  }
}
