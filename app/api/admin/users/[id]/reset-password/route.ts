import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../../../models/User";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/admin-logger";

export async function PATCH(
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

    const { newPassword } = await request.json();
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return NextResponse.json(
        { error: "A valid newPassword (min 6 chars) is required" },
        { status: 400 }
      );
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(
      params.id,
      { password: hashed },
      {
        new: true,
        select:
          "-password -passwordResetToken -emailVerificationToken -phoneVerificationToken",
      }
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log password reset action
    await logAdminAction({
      adminId: (payload as any).id || (payload as any).adminId || 'unknown',
      adminName: (payload as any).name || 'Unknown Admin',
      adminEmail: (payload as any).email || 'unknown@admin.com',
      adminRole: (payload as any).role || 'unknown',
      action: 'reset_user_password',
      module: 'users',
      targetType: 'user',
      targetId: params.id,
      targetName: user.fullName || user.email,
      details: { 
        resetBy: 'admin',
        passwordLength: newPassword.length
      },
      description: `Reset password for user ${user.fullName || user.email} (ID: ${params.id})`,
      request
    });

    return NextResponse.json({ message: "Password reset successfully", user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
