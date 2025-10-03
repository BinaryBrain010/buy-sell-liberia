import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../../../models/User";
import { createAdminAuditLogger, extractUserInfoFromPayload } from '../../../../../../lib/admin-audit-middleware';
import { OperationType, ModuleType } from "../../../../../../lib/audit-logger";

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

    const userInfo = extractUserInfoFromPayload(payload);
    const adminUserId = userInfo.userId;
    const adminRole = userInfo.role;
    const adminEmail = userInfo.email;
    const adminName = userInfo.name;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminUserId, adminRole, adminEmail, adminName);

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

    const previousBlocked = user.isBlocked;
    const previousActive = user.isActive;

    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    // Log user block operation
    await logger.logUserOperation(OperationType.USER_BLOCK, id, {
      adminUserId,
      adminRole,
      adminEmail,
      adminName,
      userEmail: user.email,
      userName: user.fullName,
      previousBlocked,
      newBlocked: true,
      previousActive,
      newActive: false,
      summary: `Blocked user: ${user.fullName} (${user.email}) by ${adminName} (${adminRole})`
    });

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Allow all admin roles (same as POST)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);

    const allowedRoles = [
      "super_admin",
      "admin",
      "moderator",
      "payment_officer",
      "support_agent",
      "custom",
    ];
    if (!payload || typeof payload !== "object" || !allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userInfo = extractUserInfoFromPayload(payload);
    const adminUserId = userInfo.userId;
    const adminRole = userInfo.role;
    const adminEmail = userInfo.email;
    const adminName = userInfo.name;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminUserId, adminRole, adminEmail, adminName);

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

    const previousBlocked = user.isBlocked;
    const previousActive = user.isActive;

    // Unsuspend/unblock: enable account activity
    user.isBlocked = false;
    user.isActive = true;
    await user.save();

    // Log user unblock operation
    await logger.logUserOperation(OperationType.USER_UNBLOCK, id, {
      adminUserId,
      adminRole,
      adminEmail,
      adminName,
      userEmail: user.email,
      userName: user.fullName,
      previousBlocked,
      newBlocked: false,
      previousActive,
      newActive: true,
      summary: `Unblocked user: ${user.fullName} (${user.email}) by ${adminName} (${adminRole})`
    });

    return NextResponse.json({
      success: true,
      message: "User unsuspended successfully",
    });
  } catch (error: any) {
    console.error("Error unsuspending user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to unsuspend user",
      },
      { status: 500 }
    );
  }
}
