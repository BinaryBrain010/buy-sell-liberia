import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/app/api/modules/auth/services/admin-auth.service";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";
import { createAdminAuditLogger } from "@/lib/admin-audit-middleware";
import { ModuleType, OperationType } from "@/lib/audit-logger";

type PlanGroup =
  | "bump_listing"
  | "featured_listing"
  | "account_verification"
  | "banner_ad"
  | "paid_category_listing";

function assertAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { error: "No token", status: 401 } as const;
  const token = authHeader.split(" ")[1];
  const payload = AdminAuthService.verifyAccessToken(token);
  if (
    !payload ||
    typeof payload !== "object" ||
    (payload.role !== "admin" && payload.role !== "super_admin")
  ) {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { payload } as const;
}

// GET: return current monetizationPrices map
export async function GET(req: NextRequest) {
  const gate = assertAdmin(req);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const settings = await SettingsService.getAllSettings();
  return NextResponse.json({ prices: settings.monetizationPrices || {} });
}

// POST: add or replace a plan in a group
// Body: { group: PlanGroup, key: string, data: { price:number, label?:string, description?:string, duration?:number, credits?:number } }
export async function POST(req: NextRequest) {
  const gate = assertAdmin(req);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const body = await req.json();
  const { group, key, data } = body || {};
  if (!group || !key || !data) {
    return NextResponse.json(
      { error: "group, key and data are required" },
      { status: 400 }
    );
  }

  const settings = await SettingsService.getAllSettings();
  const current = { ...(settings.monetizationPrices || {}) } as Record<
    string,
    any
  >;
  const groupObj = { ...(current[group] || {}) };
  groupObj[key] = data;
  current[group] = groupObj;

  await SettingsService.updateSettings({ monetizationPrices: current } as any);

  const logger = createAdminAuditLogger(
    req,
    (gate as any).payload._id || (gate as any).payload.email || "admin"
  );
  await logger.logCustomOperation(
    ModuleType.SETTINGS_MANAGEMENT,
    OperationType.MONETIZATION_PRICES_UPDATE,
    "monetization_prices",
    "Settings",
    {
      changes: { [group]: { [key]: data } },
      summary: `Upsert plan '${key}' in '${group}'`,
    }
  );

  return NextResponse.json({ success: true, prices: current });
}

// PATCH: rename a plan key or update fields partially
// Body: { group: PlanGroup, key: string, renameTo?: string, update?: Record<string, any> }
export async function PATCH(req: NextRequest) {
  const gate = assertAdmin(req);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const body = await req.json();
  const { group, key, renameTo, update } = body || {};
  if (!group || !key) {
    return NextResponse.json(
      { error: "group and key are required" },
      { status: 400 }
    );
  }
  const settings = await SettingsService.getAllSettings();
  const current = { ...(settings.monetizationPrices || {}) } as Record<
    string,
    any
  >;
  const groupObj = { ...(current[group] || {}) };
  if (!(key in groupObj)) {
    return NextResponse.json(
      { error: `Plan '${key}' not found in '${group}'` },
      { status: 404 }
    );
  }
  const existing = groupObj[key];
  const updated = { ...existing, ...(update || {}) };
  const finalKey = renameTo || key;
  if (renameTo && renameTo !== key) {
    delete groupObj[key];
  }
  groupObj[finalKey] = updated;
  current[group] = groupObj;
  await SettingsService.updateSettings({ monetizationPrices: current } as any);

  const logger = createAdminAuditLogger(
    req,
    (gate as any).payload._id || (gate as any).payload.email || "admin"
  );
  await logger.logCustomOperation(
    ModuleType.SETTINGS_MANAGEMENT,
    OperationType.MONETIZATION_PRICES_UPDATE,
    "monetization_prices",
    "Settings",
    {
      changes: { [group]: { [finalKey]: updated } },
      summary: `${
        renameTo
          ? `Renamed plan '${key}' to '${renameTo}'`
          : `Updated plan '${key}'`
      } in '${group}'`,
    }
  );

  return NextResponse.json({ success: true, prices: current });
}

// DELETE: remove a plan key from a group
// Body: { group: PlanGroup, key: string }
export async function DELETE(req: NextRequest) {
  const gate = assertAdmin(req);
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const body = await req.json();
  const { group, key } = body || {};
  if (!group || !key) {
    return NextResponse.json(
      { error: "group and key are required" },
      { status: 400 }
    );
  }
  const settings = await SettingsService.getAllSettings();
  const current = { ...(settings.monetizationPrices || {}) } as Record<
    string,
    any
  >;
  const groupObj = { ...(current[group] || {}) };
  if (!(key in groupObj)) {
    return NextResponse.json(
      { error: `Plan '${key}' not found in '${group}'` },
      { status: 404 }
    );
  }
  delete groupObj[key];
  current[group] = groupObj;
  await SettingsService.updateSettings({ monetizationPrices: current } as any);

  const logger = createAdminAuditLogger(
    req,
    (gate as any).payload._id || (gate as any).payload.email || "admin"
  );
  await logger.logCustomOperation(
    ModuleType.SETTINGS_MANAGEMENT,
    OperationType.MONETIZATION_PRICES_UPDATE,
    "monetization_prices",
    "Settings",
    {
      changes: { [group]: { [key]: null } },
      summary: `Deleted plan '${key}' from '${group}'`,
    }
  );

  return NextResponse.json({ success: true, prices: current });
}
