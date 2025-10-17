import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";
import dbConnect from "../../../../lib/mongoose";

// GET: Get all monetization settings (prices and payment details)
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
    return NextResponse.json({
      prices: settings.monetizationPrices || {},
      paymentDetails: settings.monetizationPaymentDetails || {},
      enabled: settings.monetizationEnabled,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/monetization GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Update monetization settings (prices or payment details)
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

    const {
      userId: adminUserId,
      role: adminRole,
      email: adminEmail,
      name: adminName,
    } = extractUserInfoFromPayload(payload);

    console.log("Admin payload:", payload);
    console.log("Admin user ID:", adminUserId);
    console.log("Admin email:", adminEmail);
    console.log("Admin role:", adminRole);

    // Ensure database connection
    await dbConnect();
    console.log("Database connected");

    // Ensure all models are registered
    ensureModelsRegistered();

    const {
      prices,
      paymentDetails,
      enabled,
      paidCategoriesEnabled,
      isFeaturedActive,
      isSubscriptionActive,
      isPaidCategoryActive,
      isBannerAdsActive,
    } = await req.json();

    // Create audit logger
    const logger = createAdminAuditLogger(
      req,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );
    console.log("Logger created for user:", adminUserId);

    const updates: any = {};
    const changes: Record<string, any> = {};

    if (prices !== undefined) {
      updates.monetizationPrices = prices;
      changes.prices = prices;
    }
    if (paymentDetails !== undefined) {
      updates.monetizationPaymentDetails = paymentDetails;
      changes.paymentDetails = paymentDetails;
    }
    if (typeof enabled === "boolean") {
      updates.monetizationEnabled = enabled;
      changes.enabled = enabled;
    }
    if (typeof paidCategoriesEnabled === "boolean") {
      updates.paidCategoriesEnabled = paidCategoriesEnabled;
      changes.paidCategoriesEnabled = paidCategoriesEnabled;
    }
    if (typeof isFeaturedActive === "boolean") {
      updates.isFeaturedActive = isFeaturedActive;
      changes.isFeaturedActive = isFeaturedActive;
    }
    if (typeof isSubscriptionActive === "boolean") {
      updates.isSubscriptionActive = isSubscriptionActive;
      changes.isSubscriptionActive = isSubscriptionActive;
    }
    if (typeof isPaidCategoryActive === "boolean") {
      updates.isPaidCategoryActive = isPaidCategoryActive;
      changes.isPaidCategoryActive = isPaidCategoryActive;
    }
    if (typeof isBannerAdsActive === "boolean") {
      updates.isBannerAdsActive = isBannerAdsActive;
      changes.isBannerAdsActive = isBannerAdsActive;
    }

    await SettingsService.updateSettings(updates);

    // Log the settings update operation with specific operation types
    console.log("Attempting to log settings operation...");
    try {
      // Log each type of change separately for better tracking
      if (updates.monetizationPrices) {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_PRICES_UPDATE,
          "monetization_prices",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: {
              featured_listing: updates.monetizationPrices.featured_listing,
              premium_listing: updates.monetizationPrices.premium_listing,
              urgent_listing: updates.monetizationPrices.urgent_listing,
              bump_listing: updates.monetizationPrices.bump_listing,
            },
            summary: `Updated monetization prices by ${adminName} (${adminRole})`,
          }
        );
      }

      if (updates.monetizationPaymentDetails) {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_PAYMENT_DETAILS_UPDATE,
          "monetization_payment_details",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: updates.monetizationPaymentDetails,
            summary: `Updated monetization payment details by ${adminName} (${adminRole})`,
          }
        );
      }

      if (typeof enabled === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "monetization_enabled",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { enabled },
            summary: `${
              enabled ? "Enabled" : "Disabled"
            } monetization by ${adminName} (${adminRole})`,
          }
        );
      }
      if (typeof paidCategoriesEnabled === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "paid_categories_enabled",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { paidCategoriesEnabled },
            summary: `${
              paidCategoriesEnabled ? "Enabled" : "Disabled"
            } paid categories by ${adminName} (${adminRole})`,
          }
        );
      }
      if (typeof isFeaturedActive === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "is_featured_active",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { isFeaturedActive },
            summary: `${
              isFeaturedActive ? "Enabled" : "Disabled"
            } featured listings by ${adminName} (${adminRole})`,
          }
        );
      }
      if (typeof isSubscriptionActive === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "is_subscription_active",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { isSubscriptionActive },
            summary: `${
              isSubscriptionActive ? "Enabled" : "Disabled"
            } subscriptions by ${adminName} (${adminRole})`,
          }
        );
      }
      if (typeof isPaidCategoryActive === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "is_paid_category_active",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { isPaidCategoryActive },
            summary: `${
              isPaidCategoryActive ? "Enabled" : "Disabled"
            } paid category requirement by ${adminName} (${adminRole})`,
          }
        );
      }
      if (typeof isBannerAdsActive === "boolean") {
        await logger.logCustomOperation(
          ModuleType.SETTINGS_MANAGEMENT,
          OperationType.MONETIZATION_TOGGLE,
          "is_banner_ads_active",
          "Settings",
          {
            adminUserId,
            adminRole,
            adminEmail,
            adminName,
            changes: { isBannerAdsActive },
            summary: `${
              isBannerAdsActive ? "Enabled" : "Disabled"
            } banner ads by ${adminName} (${adminRole})`,
          }
        );
      }

      console.log("Settings operation logged successfully");
    } catch (logError) {
      console.error("Failed to log settings operation:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/admin/monetization POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
