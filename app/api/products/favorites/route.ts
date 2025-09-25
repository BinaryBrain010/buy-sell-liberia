import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import User from "@/models/User";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

// Get all favorite products for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing user id" }, { status: 401 });
    }
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const productIds = (user.likedProducts || [])
      .map((lp: any) => lp?.product_id)
      .filter((id: any) => !!id);
    const favorites = productIds.length
      ? await Product.find({ _id: { $in: productIds } }).lean()
      : [];
    return NextResponse.json({ favorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get favorites" }, { status: 500 });
  }
}
