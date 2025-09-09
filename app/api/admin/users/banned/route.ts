import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../../models/User";

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
    const allowedRoles = [
      "super_admin",
      "admin",
      "moderator",
      "payment_officer",
      "support_agent",
      "custom",
    ];
    if (
      !payload ||
      typeof payload !== "object" ||
      !allowedRoles.includes(payload.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const users = await User.find(
      { isBanned: true },
      "-password -passwordResetToken -emailVerificationToken -phoneVerificationToken"
    )
      .skip(skip)
      .limit(limit)
      .sort({ bannedAt: -1 });
    const total = await User.countDocuments({ isBanned: true });

    return NextResponse.json({
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch banned users" },
      { status: 500 }
    );
  }
}
