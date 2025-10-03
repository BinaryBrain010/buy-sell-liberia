import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongoose";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import { createAdminAuditLogger } from "@/lib/admin-audit-middleware";
import { ModuleType, OperationType } from "@/lib/audit-logger";

// PATCH: Reset an employee's password (super_admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only super_admin can access
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing employee id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const newPassword = body?.newPassword as string | undefined;
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.trim().length < 8
    ) {
      return NextResponse.json(
        { error: "A valid 'newPassword' of at least 8 characters is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const hash = await bcrypt.hash(newPassword.trim(), 10);
    employee.password = hash;
    await employee.save();

    // Audit log: use EMPLOYEE_UPDATE with password_reset flag
    const adminUserId =
      (payload as any)._id || (payload as any).id || "unknown";
    const logger = createAdminAuditLogger(
      req,
      adminUserId,
      (payload as any).role,
      (payload as any).email,
      (payload as any).name
    );
    await logger.logCustomOperation(
      ModuleType.USER_MANAGEMENT,
      OperationType.EMPLOYEE_UPDATE,
      id,
      "Employee",
      {
        adminUserId,
        employeeEmail: employee.email,
        employeeName: employee.fullName,
        action: "password_reset",
        summary: `Reset password for employee ${employee.fullName} (${employee.email})`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("Employee password reset error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
