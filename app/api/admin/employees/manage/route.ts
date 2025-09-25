import { NextRequest, NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongoose";
import { createAdminAuditLogger } from "../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../lib/audit-logger";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";

// PATCH: Update employee role/permissions
export async function PATCH(req: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminUserId = payload._id || payload.id || 'unknown';

    await dbConnect();
    const { employeeId, role, permissions, action, banReason } = await req.json();
    if (!employeeId)
      return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    // Create audit logger
    const logger = createAdminAuditLogger(req, adminUserId);

    // Ban employee
    if (action === 'ban') {
      if (employee.isBanned) {
        return NextResponse.json({ error: "Employee already banned" }, { status: 400 });
      }
  employee.isBanned = true;
  employee.banReason = banReason || undefined;
      await employee.save();
      await logger.logCustomOperation(ModuleType.USER_MANAGEMENT, OperationType.EMPLOYEE_BAN, employeeId, 'Employee', {
        adminUserId,
        employeeEmail: employee.email,
        employeeName: employee.fullName,
        banReason,
        summary: `Banned employee: ${employee.fullName} (${employee.email})`,
      });
      return NextResponse.json({ employee });
    }

    // Unban employee (only super_admin)
    if (action === 'unban') {
      if (!employee.isBanned) {
        return NextResponse.json({ error: "Employee is not banned" }, { status: 400 });
      }
      if (payload.role !== 'super_admin') {
        return NextResponse.json({ error: "Only super_admin can unban employees" }, { status: 403 });
      }
  employee.isBanned = false;
  employee.banReason = undefined;
      await employee.save();
      await logger.logCustomOperation(ModuleType.USER_MANAGEMENT, OperationType.EMPLOYEE_UNBAN, employeeId, 'Employee', {
        adminUserId,
        employeeEmail: employee.email,
        employeeName: employee.fullName,
        summary: `Unbanned employee: ${employee.fullName} (${employee.email})`,
      });
      return NextResponse.json({ employee });
    }

    // Update employee role
    const previousRole = employee.role;
    if (role) employee.role = role;
    await employee.save();
    await logger.logCustomOperation(ModuleType.USER_MANAGEMENT, OperationType.EMPLOYEE_UPDATE, employeeId, 'Employee', {
      adminUserId,
      employeeEmail: employee.email,
      employeeName: employee.fullName,
      previousRole,
      newRole: role,
      updatedBy: adminUserId,
      summary: `Updated employee role: ${employee.fullName} (${employee.email}) from ${previousRole} to ${role}`
    });
    return NextResponse.json({ employee });
  } catch (error: any) {
    console.error("Employee update error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove employee
export async function DELETE(req: NextRequest) {
  try {
    // Auth: Only super_admin can access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminUserId = payload._id || payload.id || 'unknown';

    await dbConnect();
    const { employeeId } = await req.json();
    if (!employeeId)
      return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
    
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    // Create audit logger
    const logger = createAdminAuditLogger(req, adminUserId);

    // Log employee deletion operation before deleting
    await logger.logCustomOperation(ModuleType.USER_MANAGEMENT, OperationType.EMPLOYEE_DELETE, employeeId, 'Employee', {
      adminUserId,
      employeeEmail: employee.email,
      employeeName: employee.fullName,
      employeeRole: employee.role,
      deletedBy: adminUserId,
      summary: `Deleted employee: ${employee.fullName} (${employee.email}) with role: ${employee.role}`
    });

    await Employee.findByIdAndDelete(employeeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Employee deletion error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
