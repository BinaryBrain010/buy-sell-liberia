import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

export const dynamic = "force-dynamic";

// POST: Clear and reinitialize all settings (debug only)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      (payload.role !== "admin" && payload.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await SettingsService.clearAndReinitialize();
    const settings = await SettingsService.getAllSettings();

    return NextResponse.json({
      success: true,
      message: "Settings cleared and reinitialized",
      settings,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/settings/debug POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
