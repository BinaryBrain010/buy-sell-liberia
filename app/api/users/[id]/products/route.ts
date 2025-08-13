import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/app/api/modules/products/models/product.model";
import { connectDB } from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

// GET all products listed by a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    const products = await Product.find({ seller: userId });
    return NextResponse.json({
      message: "Products listed by user retrieved successfully",
      products,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get user's products" }, { status: 500 });
  }
}
