// Support GET for markAsSold and renew actions
export async function GET(request: NextRequest, { params }: { params: { id: string, action: string } }) {
  try {
    // Parse action from URL (e.g., /api/products/{id}/markAsSold or /api/products/{id}/renew)
    const urlParts = request.url.split("/");
    const action = urlParts[urlParts.length - 1];
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let product;
    switch (action) {
      case "markAsSold": {
        if (!params.id || !authResult.userId) {
          return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
        }
        product = await productService.updateProduct(params.id, authResult.userId, { status: "sold" });
        if (!product) {
          return NextResponse.json({ error: "Product not found or you don't have permission" }, { status: 404 });
        }
        return NextResponse.json({
          message: "Product marked as sold successfully",
          product,
        });
      }
      case "renew": {
        if (!params.id || !authResult.userId) {
          return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
        }
        product = await productService.renewProduct(params.id, authResult.userId);
        if (!product) {
          return NextResponse.json({ error: "Product not found or you don't have permission" }, { status: 404 });
        }
        return NextResponse.json({
          message: "Product renewed successfully",
          product,
        });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to perform action" }, { status: 400 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../../../modules/products/services/product.service";
import { verifyToken } from "../../../modules/auth/middlewares/next-auth-middleware";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const productService = new ProductService();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await request.json();
    const authResult = await verifyToken(request);

    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    let product;
    switch (action) {
      case "markAsSold": {
        if (!params.id || !authResult.userId) {
          return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
        }
        console.log("[PRODUCTS API] Marking product as sold:", params.id);
        product = await productService.updateProduct(params.id, authResult.userId, { status: "sold" });
        if (!product) {
          return NextResponse.json(
            { error: "Product not found or you don't have permission" },
            { status: 404 }
          );
        }
        return NextResponse.json({
          message: "Product marked as sold successfully",
          product,
        });
      }
      case "renew": {
        if (!params.id || !authResult.userId) {
          return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
        }
        console.log("[PRODUCTS API] Renewing product:", params.id);
        product = await productService.renewProduct(params.id, authResult.userId);
        if (!product) {
          return NextResponse.json(
            { error: "Product not found or you don't have permission" },
            { status: 404 }
          );
        }
        return NextResponse.json({
          message: "Product renewed successfully",
          product,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[PRODUCTS API] Action error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to perform action" }, { status: 400 });
  }
}