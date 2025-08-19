import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../modules/auth/middlewares/next-auth-middleware";
import { User } from "../../../modules/auth/models/user.model";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

// Add product to user's favorites
export async function PUT(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !params.id || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing product/user id" }, { status: 401 });
    }
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const productId = new mongoose.Types.ObjectId(params.id);
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    return NextResponse.json({ message: "Added to favorites", isFavorite: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add favorite" }, { status: 500 });
  }
}

// Remove product from user's favorites
export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !params.id || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing product/user id" }, { status: 401 });
    }
    const user = await User.findById(authResult.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const productId = new mongoose.Types.ObjectId(params.id);
    user.favorites = user.favorites.filter((favId: mongoose.Types.ObjectId) => !favId.equals(productId));
    await user.save();
    return NextResponse.json({ message: "Removed from favorites", isFavorite: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove favorite" }, { status: 500 });
  }
}

// Get all favorite products for the user
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing user id" }, { status: 401 });
    }
    const user = await User.findById(authResult.userId).populate("favorites");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ favorites: user.favorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get favorites" }, { status: 500 });
  }
}
