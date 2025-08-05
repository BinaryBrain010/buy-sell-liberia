import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/app/api/modules/products/services/product.service";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";

export const dynamic = 'force-dynamic';

const productService = new ProductService();

// GET product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const incrementViews = searchParams.get("incrementViews") === "true";
    const product = await productService.getProductById(params.id, incrementViews);
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


// Update product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updateData = await request.json();
    if (!params.id || !authResult.userId) {
      return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
    }
    let product: any = null;
    try {
      product = await productService.updateProduct(params.id, authResult.userId, updateData);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Product not found or you don't have permission" }, { status: 404 });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found or you don't have permission" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 400 });
  }
}

// Delete product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!params.id || !authResult.userId) {
      return NextResponse.json({ error: "Missing product id or user id" }, { status: 400 });
    }
    try {
      await productService.deleteProduct(params.id, authResult.userId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Product not found or you don't have permission" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 400 });
  }
}