import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import { User } from "../../modules/auth/models/user.model";

export const dynamic = 'force-dynamic';

// Get all favorite products for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized or missing user id" }, { status: 401 });
    }
    const user = await User.findById(authResult.userId).populate({
      path: "favorites",
      populate: {
        path: "seller",
        select: "fullName username"
      }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ favorites: user.favorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get favorites" }, { status: 500 });
  }
}
