import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import {
  SettingsService,
  SystemSettings,
} from "@/app/api/modules/shared/services/settings.service";
import { createAdminAuditLogger, extractUserInfoFromPayload } from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";

export const dynamic = "force-dynamic";

// GET: Get all system settings
export async function GET(req: NextRequest) {
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

    const settings = await SettingsService.getAllSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Update system settings (admin only)
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

    const { userId: adminUserId, role: adminRole, email: adminEmail, name: adminName } = extractUserInfoFromPayload(payload);
    const updates = await req.json();

    // Validate required fields
    if (
      updates.platformCurrency &&
      !["LRD", "USD"].includes(updates.platformCurrency)
    ) {
      return NextResponse.json(
        { error: "Invalid platform currency. Must be LRD or USD" },
        { status: 400 }
      );
    }

    if (
      updates.listingExpirationDays &&
      (updates.listingExpirationDays < 1 || updates.listingExpirationDays > 365)
    ) {
      return NextResponse.json(
        { error: "Listing expiration days must be between 1 and 365" },
        { status: 400 }
      );
    }

    if (
      updates.maxListingPhotos &&
      (updates.maxListingPhotos < 1 || updates.maxListingPhotos > 20)
    ) {
      return NextResponse.json(
        { error: "Max listing photos must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Get current settings before update for audit logging
    const currentSettings = await SettingsService.getAllSettings();
    
    await SettingsService.updateSettings(updates);

    const updatedSettings = await SettingsService.getAllSettings();

    // Create audit logger and log settings update
    const logger = createAdminAuditLogger(req, adminUserId, adminRole, adminEmail, adminName);
    
    // Determine specific operation type based on what was updated
    let operationType = OperationType.SETTINGS_UPDATE;
    if (updates.platformCurrency) {
      operationType = OperationType.CURRENCY_UPDATE;
    } else if (updates.monetizationEnabled !== undefined) {
      operationType = OperationType.MONETIZATION_TOGGLE;
    } else if (updates.listingExpirationDays) {
      operationType = OperationType.LISTING_EXPIRATION_UPDATE;
    } else if (updates.maxListingPhotos) {
      operationType = OperationType.MAX_PHOTOS_UPDATE;
    } else if (updates.registrationEnabled !== undefined) {
      operationType = OperationType.REGISTRATION_TOGGLE;
    } else if (updates.maintenanceMode !== undefined) {
      operationType = OperationType.MAINTENANCE_MODE_TOGGLE;
    }
    
    await logger.logCustomOperation(ModuleType.SETTINGS_MANAGEMENT, operationType, 'system_settings', 'Settings', {
      adminName,
      adminRole,
      adminEmail,
      changes: updates,
      previousSettings: currentSettings,
      newSettings: updatedSettings,
      summary: `Updated system settings: ${Object.keys(updates).join(', ')} by ${adminName} (${adminRole})`
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update individual setting (admin only)
export async function PATCH(req: NextRequest) {
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

    const adminUserId = payload._id || payload.id || payload.email || 'unknown';
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "Setting key is required" },
        { status: 400 }
      );
    }

    // Validate specific settings
    if (key === "platformCurrency" && !["LRD", "USD"].includes(value)) {
      return NextResponse.json(
        { error: "Invalid platform currency. Must be LRD or USD" },
        { status: 400 }
      );
    }

    if (key === "listingExpirationDays" && (value < 1 || value > 365)) {
      return NextResponse.json(
        { error: "Listing expiration days must be between 1 and 365" },
        { status: 400 }
      );
    }

    if (key === "maxListingPhotos" && (value < 1 || value > 20)) {
      return NextResponse.json(
        { error: "Max listing photos must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Map property name to database key
    const dbKey = SettingsService.getSettingKey(key as keyof SystemSettings);
    if (!dbKey) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    // Get current settings before update for audit logging
    const currentSettings = await SettingsService.getAllSettings();
    
    await SettingsService.updateSetting(dbKey, value);

    const updatedSettings = await SettingsService.getAllSettings();

    // Create audit logger and log settings update
    const logger = createAdminAuditLogger(req, adminUserId);
    await logger.logCustomOperation(ModuleType.SETTINGS_MANAGEMENT, OperationType.SETTINGS_UPDATE, 'system_settings', 'Settings', {
      adminName: payload.name || payload.fullName || payload.email || 'Unknown',
      adminRole: payload.role || 'Unknown',
      adminEmail: payload.email || 'Unknown',
      settingKey: key,
      settingValue: value,
      previousValue: currentSettings[key as keyof SystemSettings],
      newValue: value,
      summary: `Updated setting '${key}' from '${currentSettings[key as keyof SystemSettings]}' to '${value}' by ${payload.name || payload.fullName || payload.email || 'Unknown'} (${payload.role || 'Unknown'})`
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings PATCH:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Add or replace logo, currency, and toggles (upsert semantics)
export async function PUT(req: NextRequest) {
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

    const adminUserId = payload._id || payload.id || payload.email || 'unknown';
    const body = await req.json();
    const { platformLogo, platformCurrency, toggles } = body || {};

    // Validate inputs
    if (
      typeof platformLogo !== "undefined" &&
      typeof platformLogo !== "string"
    ) {
      return NextResponse.json(
        { error: "platformLogo must be a string URL/path" },
        { status: 400 }
      );
    }
    if (
      typeof platformCurrency !== "undefined" &&
      !["LRD", "USD"].includes(platformCurrency)
    ) {
      return NextResponse.json(
        { error: "Invalid platform currency. Must be LRD or USD" },
        { status: 400 }
      );
    }
    if (typeof toggles !== "undefined") {
      if (typeof toggles !== "object" || Array.isArray(toggles)) {
        return NextResponse.json(
          { error: "toggles must be an object with boolean fields" },
          { status: 400 }
        );
      }
      const allowedToggleKeys = [
        "monetizationEnabled",
        "registrationEnabled",
        "maintenanceMode",
      ] as const;
      for (const k of Object.keys(toggles)) {
        if (!allowedToggleKeys.includes(k as any)) {
          return NextResponse.json(
            { error: `Invalid toggle key: ${k}` },
            { status: 400 }
          );
        }
        if (typeof toggles[k] !== "boolean") {
          return NextResponse.json(
            { error: `${k} must be a boolean` },
            { status: 400 }
          );
        }
      }
    }

    const updates: Partial<SystemSettings> = {};
    if (typeof platformLogo !== "undefined")
      updates.platformLogo = platformLogo;
    if (typeof platformCurrency !== "undefined")
      updates.platformCurrency = platformCurrency;
    if (typeof toggles !== "undefined") {
      if (typeof toggles.monetizationEnabled !== "undefined")
        updates.monetizationEnabled = toggles.monetizationEnabled;
      if (typeof toggles.registrationEnabled !== "undefined")
        updates.registrationEnabled = toggles.registrationEnabled;
      if (typeof toggles.maintenanceMode !== "undefined")
        updates.maintenanceMode = toggles.maintenanceMode;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Get current settings before update for audit logging
    const currentSettings = await SettingsService.getAllSettings();
    
    await SettingsService.updateSettings(updates);
    const updatedSettings = await SettingsService.getAllSettings();

    // Create audit logger and log settings update
    const logger = createAdminAuditLogger(req, adminUserId);
    await logger.logCustomOperation(ModuleType.SETTINGS_MANAGEMENT, OperationType.SETTINGS_UPDATE, 'system_settings', 'Settings', {
      adminName: payload.name || payload.fullName || payload.email || 'Unknown',
      adminRole: payload.role || 'Unknown',
      adminEmail: payload.email || 'Unknown',
      changes: updates,
      previousSettings: currentSettings,
      newSettings: updatedSettings,
      summary: `Bulk updated settings: ${Object.keys(updates).join(', ')} by ${payload.name || payload.fullName || payload.email || 'Unknown'} (${payload.role || 'Unknown'})`
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings PUT:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Reset/delete logo, currency, and toggles to defaults
export async function DELETE(req: NextRequest) {
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

    const adminUserId = payload._id || payload.id || payload.email || 'unknown';
    const body = await req.json().catch(() => ({}));
    const { logo = false, currency = false, toggles = false } = body || {};

    const propsToReset: (keyof SystemSettings)[] = [];
    if (logo) propsToReset.push("platformLogo");
    if (currency) propsToReset.push("platformCurrency");
    if (toggles) {
      const allToggleProps: (keyof SystemSettings)[] = [
        "monetizationEnabled",
        "registrationEnabled",
        "maintenanceMode",
      ];
      if (toggles === true) {
        propsToReset.push(...allToggleProps);
      } else if (Array.isArray(toggles)) {
        for (const k of toggles) {
          if (allToggleProps.includes(k)) propsToReset.push(k);
          else
            return NextResponse.json(
              { error: `Invalid toggle key: ${k}` },
              { status: 400 }
            );
        }
      } else if (typeof toggles === "object") {
        for (const [k, v] of Object.entries(toggles)) {
          if (v) {
            if (
              (
                [
                  "monetizationEnabled",
                  "registrationEnabled",
                  "maintenanceMode",
                ] as string[]
              ).includes(k)
            ) {
              propsToReset.push(k as keyof SystemSettings);
            } else {
              return NextResponse.json(
                { error: `Invalid toggle key: ${k}` },
                { status: 400 }
              );
            }
          }
        }
      } else {
        return NextResponse.json(
          {
            error:
              "toggles must be true, an array of keys, or an object with boolean flags",
          },
          { status: 400 }
        );
      }
    }

    if (propsToReset.length === 0) {
      return NextResponse.json(
        { error: "No fields specified to reset" },
        { status: 400 }
      );
    }

    // Get current settings before reset for audit logging
    const currentSettings = await SettingsService.getAllSettings();
    
    await SettingsService.resetSettings(propsToReset);
    const updatedSettings = await SettingsService.getAllSettings();

    // Create audit logger and log settings reset
    const logger = createAdminAuditLogger(req, adminUserId);
    await logger.logCustomOperation(ModuleType.SETTINGS_MANAGEMENT, OperationType.SETTINGS_RESET, 'system_settings', 'Settings', {
      adminName: payload.name || payload.fullName || payload.email || 'Unknown',
      adminRole: payload.role || 'Unknown',
      adminEmail: payload.email || 'Unknown',
      resetFields: propsToReset,
      previousSettings: currentSettings,
      newSettings: updatedSettings,
      summary: `Reset settings to defaults: ${propsToReset.join(', ')} by ${payload.name || payload.fullName || payload.email || 'Unknown'} (${payload.role || 'Unknown'})`
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings DELETE:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
