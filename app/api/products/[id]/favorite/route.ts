import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../modules/auth/middlewares/next-auth-middleware";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Add product to user's favorites
export async function PUT(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { error: "login_required", message: "Please log in to use favorites." },
        { status: 401 }
      );
    }
    if (!params.id) {
      return NextResponse.json(
        { error: "missing_product_id", message: "Product id is required." },
        { status: 400 }
      );
    }
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const productId = new mongoose.Types.ObjectId(params.id);
    if (!user.hasLikedProduct(productId)) {
      await user.likeProduct(productId);
    }
    return NextResponse.json({
      message: "Added to favorites",
      isFavorite: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// Remove product from user's favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { error: "login_required", message: "Please log in to use favorites." },
        { status: 401 }
      );
    }
    if (!params.id) {
      return NextResponse.json(
        { error: "missing_product_id", message: "Product id is required." },
        { status: 400 }
      );
    }
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const productId = new mongoose.Types.ObjectId(params.id);
    await user.unlikeProduct(productId);
    return NextResponse.json({
      message: "Removed from favorites",
      isFavorite: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

// Get all favorite products for the user
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        {
          error: "login_required",
          message: "Please log in to view your favorites.",
        },
        { status: 401 }
      );
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
    return NextResponse.json(
      { error: error.message || "Failed to get favorites" },
      { status: 500 }
    );
  }
}
