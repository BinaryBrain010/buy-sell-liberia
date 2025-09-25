import { NextRequest, NextResponse } from "next/server";
import Employee from "@/models/Employee";
import dbConnect from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";

// POST: Add new employee
export async function POST(req: NextRequest) {
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

    const {
      userId: adminUserId,
      role: adminRole,
      email: adminEmail,
      name: adminName,
    } = extractUserInfoFromPayload(payload);

    await dbConnect();
    const { fullName, email, password, role, phone, country, department } =
      await req.json();
    if (!fullName || !email || !password || !role || !phone || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await Employee.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Create audit logger with user information
    const logger = createAdminAuditLogger(
      req,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );

    const hash = await bcrypt.hash(password, 10);
    const employee = await Employee.create({
      fullName,
      email,
      password: hash,
      role,
      phone,
      country,
      department,
    });

    // Log employee creation operation
    await logger.logCustomOperation(
      ModuleType.USER_MANAGEMENT,
      OperationType.EMPLOYEE_CREATE,
      (employee._id as any).toString(),
      "Employee",
      {
        adminUserId,
        adminRole,
        adminEmail,
        adminName,
        employeeEmail: employee.email,
        employeeName: employee.fullName,
        employeeRole: employee.role,
        employeePhone: employee.phone,
        employeeCountry: employee.country,
        employeeDepartment: employee.department,
        createdBy: adminUserId,
        summary: `Created new employee: ${employee.fullName} (${employee.email}) with role: ${employee.role} by ${adminName} (${adminRole})`,
      }
    );

    // Omit sensitive fields before responding
    const created = employee.toObject();
    const { password: _pw, __v, ...safeEmployee } = created as any;
    return NextResponse.json({ employee: safeEmployee });
  } catch (error: any) {
    console.error("Employee creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: List all employees
export async function GET() {
  await dbConnect();
  // Return complete schema fields except sensitive ones
  const employees = await Employee.find()
    .sort({ createdAt: -1 })
    .select("-password -__v")
    .lean();
  return NextResponse.json({ employees });
}

// DELETE: Remove an employee
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    // Allow id via query (?id=...) or JSON body { id }
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json().catch(() => null);
        if (body && typeof body === "object" && body.id) id = String(body.id);
      } catch {
        // ignore body parse errors; we'll validate below
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Employee id is required (query ?id= or body { id })" },
        { status: 400 }
      );
    }

    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Employee delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
