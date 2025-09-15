import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../../../models/User";
import { QuickLog } from "@/lib/admin-logger";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousStatus = user.isBlocked ? 'blocked' : 'active';
    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    // Log user block action
    await QuickLog.userBanned(
      payload, 
      id, 
      user.fullName || user.email, 
      'User blocked by admin', 
      request
    );

    return NextResponse.json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error: any) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to block user",
      },
      { status: 500 }
    );
  }
}
