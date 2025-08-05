
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../modules/products/services/product.service";

export const dynamic = 'force-dynamic';

const productService = new ProductService();

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get("incrementViews") === "true";
    // Always lowercase and trim the slug for robust querying
    const normalizedSlug = params.slug.trim().toLowerCase();
    const product = await productService.getProductBySlug(normalizedSlug, incrementViews);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get product" }, { status: 500 });
  }
}
