import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import { Admin } from "../../../../modules/auth/models/admin.model";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";

// PATCH: Reset an admin's password (super_admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only super_admin can reset other admins
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object" || (payload as any).role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { newPassword } = await request.json();
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "A valid newPassword (min 6 chars) is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await Admin.findByIdAndUpdate(
      params.id,
      { password: hashed },
      { new: true, select: "-password" }
    );
    if (!updated) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin password reset successfully", admin: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reset admin password" },
      { status: 500 }
    );
  }
}


