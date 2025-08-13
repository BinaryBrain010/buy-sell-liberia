// DELETE: Remove a product from user's favorites
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;
    const { productId } = await request.json();
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid user or product ID" }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const wasFav = user.favorites.includes(productId);
    if (wasFav) {
      user.favorites.pull(productId);
      await user.save();
      return NextResponse.json({
        message: "Product removed from favorites",
        favorites: user.favorites,
      });
    } else {
      return NextResponse.json({ error: "Product not in favorites" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove from favorites" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/api/modules/auth/models/user.model";
import { Product } from "@/app/api/modules/products/models/product.model";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

// POST: Add or remove a product from user's favorites
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;
    const { productId } = await request.json();
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid user or product ID" }, { status: 400 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const alreadyFav = user.favorites.includes(productId);
    if (alreadyFav) {
      user.favorites.pull(productId);
    } else {
      user.favorites.push(productId);
    }
    await user.save();
    return NextResponse.json({
      message: alreadyFav ? "Product removed from favorites" : "Product added to favorites",
      favorites: user.favorites,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update favorites" }, { status: 500 });
  }
}

// GET: Get all favorite products for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const userId = params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      message: "Favorite products retrieved successfully",
      favorites: user.favorites,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get favorites" }, { status: 500 });
  }
}
