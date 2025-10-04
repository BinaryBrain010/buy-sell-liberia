import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import Chat from "../../../../models/Chat";
import { EJSON } from "bson";

// Define interfaces for TypeScript
interface ILike {
  product_id: mongoose.Types.ObjectId;
  liked_at: Date;
}

// Remove UserLeanDoc and ProductLeanDoc type definitions entirely

export async function GET(request: NextRequest) {
  try {
    // Auth: Allow all admin roles
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check:
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Use centralized role checker (keeps roles consistent)
    // Dynamically import to avoid circular dependency if any
    const { AdminAuthService: AService } = await import(
      "../../modules/auth/services/admin-auth.service"
    );
    // Some earlier tokens may still carry 'admin' or other roles; allow if service recognizes
    const role = (payload as any).role;
    if (!AService.isAllowedRole(role) && role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;
    const format = (searchParams.get("format") || "json").toLowerCase();

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Fetch users (complete docs; no projection so all fields are available)
    const users = await User.find({})
      .skip(skip)
      .limit(limit)
      // our schema uses timestamps: created_at / updated_at
      .sort({ created_at: -1 })
      .lean();

    // For each user, fetch their products and liked products
    const results = await Promise.all(
      users.map(async (user: any) => {
        // Fetch all products listed by this user.
        // Older/other code may have stored product references in user.listedProducts
        // while the main Product model uses `user_id` as the owner field. To be
        // robust we fetch by the stored product ids and also include products
        // where product.user_id === user._id, then merge uniquely.
        const listedProductIds = (user.listedProducts || [])
          .map((l: any) => l.product_id)
          .filter(Boolean);

        let listedProducts: any[] = [];

        if (listedProductIds.length > 0) {
          const ids = listedProductIds.map((id: any) =>
            typeof id === "string" && mongoose.isValidObjectId(id)
              ? new mongoose.Types.ObjectId(id)
              : id
          );
          listedProducts = await Product.find({ _id: { $in: ids } }).lean();
        }

        // Also include any products that have user_id pointing to this user
        const productsByUser = await Product.find({ user_id: user._id }).lean();

        // Merge unique products by _id (prefer data from found product documents)
        const productMap = new Map<string, any>();
        listedProducts.forEach((p: any) => productMap.set(p._id.toString(), p));
        productsByUser.forEach((p: any) => productMap.set(p._id.toString(), p));
        listedProducts = Array.from(productMap.values());
        // Fetch all liked products by product_id
        const likedProductIds = (user.likedProducts || []).map(
          (like: any) => like.product_id
        );
        const likedProducts =
          likedProductIds.length > 0
            ? await Product.find({ _id: { $in: likedProductIds } }).lean()
            : [];
        // Fetch all chats where the user is a participant
        const chats = await Chat.find({
          $or: [{ user1: user._id }, { user2: user._id }],
        })
          .populate("product", "title slug")
          .populate("user1", "fullName username")
          .populate("user2", "fullName username")
          .lean();
        // Prepare stats
        const stats = {
          likedProducts: likedProducts.length,
          listedProducts: listedProducts.length,
          totalListings: listedProducts.length,
          activeListings: listedProducts.filter(
            (p: any) => p.status === "active"
          ).length,
          soldItems: listedProducts.filter((p: any) => p.status === "sold")
            .length,
          expiredListings: listedProducts.filter(
            (p: any) => p.status === "expired"
          ).length,
          removedListings: listedProducts.filter(
            (p: any) => p.status === "removed"
          ).length,
          pendingListings: listedProducts.filter(
            (p: any) => p.status === "pending"
          ).length,
          featuredListings: listedProducts.filter(
            (p: any) => p.featured === true
          ).length,
          rating: user.profile?.rating?.average || 0,
          reviewCount: user.profile?.rating?.count || 0,
          totalViews: listedProducts.reduce(
            (sum: number, product: any) => sum + (product.views || 0),
            0
          ),
          averageViews:
            listedProducts.length > 0
              ? Math.round(
                  listedProducts.reduce(
                    (sum: number, product: any) => sum + (product.views || 0),
                    0
                  ) / listedProducts.length
                )
              : 0,
          joinedDate: user.created_at
            ? new Date(user.created_at).toISOString()
            : user.activity?.joinedDate
            ? new Date(user.activity.joinedDate).toISOString()
            : null,
        };
        // Omit sensitive fields from the user object
        const {
          password,
          passwordResetToken,
          emailVerificationToken,
          phoneVerificationToken,
          // refreshToken can also be considered sensitive; exclude by default
          refreshToken,
          ...safeUser
        } = user;
        // Prepare response without overwriting original arrays
        return {
          ...safeUser,
          listedProductsDetails: listedProducts,
          likedProductsDetails: likedProducts,
          stats,
          chats,
        };
      })
    );

    // If the caller asks for Extended JSON (Mongo export-like), convert
    if (format === "ejson" || format === "extended") {
      const extended = JSON.parse(EJSON.stringify(results, { relaxed: false }));
      return NextResponse.json(extended);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch users",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
