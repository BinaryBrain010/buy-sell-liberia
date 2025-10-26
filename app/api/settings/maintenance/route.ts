import { NextResponse } from "next/server";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

// Lightweight endpoint to expose maintenance mode for edge middleware
export async function GET() {
  try {
    const maintenance = await SettingsService.isMaintenanceMode();
    return NextResponse.json({ maintenance });
  } catch (error: any) {
    console.error("/api/settings/maintenance error:", error?.message || error);
    // Fail closed (treat as not in maintenance) to avoid locking site due to transient error
    return NextResponse.json({ maintenance: false }, { status: 200 });
  }
}
