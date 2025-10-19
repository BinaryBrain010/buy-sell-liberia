import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

// Ensure this route always executes dynamically and is never cached
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/monetization/plans
 * Returns all plan groups in one response to drive a single UI:
 * {
 *   enabled: boolean,
 *   currency: string,
 *   paymentDetails: { mtn?, orange?, bank? },
 *   plans: {
 *     bump_listing: Record<string,{ price:number, credits:number, label:string }>,
 *     featured_listing: Record<string,{ price:number, duration:number, label:string }>,
 *     account_verification?: Record<string,{ price:number, label:string }>,
 *     banner_ad?: Record<string,{ price:number, duration:number, label:string }>,
 *     paid_category_listing?: Record<string,{ price:number, label:string }>
 *   },
 *   paidCategoriesEnabled?: boolean,
 *   paidCategories?: {
 *     enabled: boolean,
 *     enforceActive: boolean
 *   }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const settings = await SettingsService.getAllSettings();
    const prices = settings.monetizationPrices || {};

    const paymentDetails = settings.monetizationPaymentDetails || {};
    const contact: any = (settings as any).paymentContactInfo || {};
    const normalizedPaymentDetails = {
      mtn:
        paymentDetails.mtn ||
        (contact.mtnNumber
          ? { number: contact.mtnNumber, name: contact.mtnName || undefined }
          : null),
      orange:
        paymentDetails.orange ||
        (contact.orangeNumber
          ? {
              number: contact.orangeNumber,
              name: contact.orangeName || undefined,
            }
          : null),
      bank:
        paymentDetails.bank ||
        (contact.bankName ||
        contact.bankAccountNumber ||
        contact.bankAccountName
          ? {
              bankName: contact.bankName || undefined,
              accountName: contact.bankAccountName || undefined,
              accountNumber: contact.bankAccountNumber || undefined,
            }
          : null),
    };

    return NextResponse.json(
      {
        enabled: !!settings.monetizationEnabled,
        // granular toggles for UI gating
        isFeaturedActive: !!settings.isFeaturedActive,
        isSubscriptionActive: !!settings.isSubscriptionActive,
        isBannerAdsActive: !!settings.isBannerAdsActive,
        isPaidCategoryActive: !!(settings as any).isPaidCategoryActive,
        currency: settings.platformCurrency || "LRD",
        paymentDetails: normalizedPaymentDetails,
        // Return plans exactly as configured in settings to ensure admin/public parity
        plans: prices,
        // Backward compat flag
        paidCategoriesEnabled: !!(settings as any).paidCategoriesEnabled,
        // Normalized object for clients moving forward
        paidCategories: {
          enabled: !!(settings as any).paidCategoriesEnabled,
          enforceActive: !!(settings as any).isPaidCategoryActive,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("Error in /api/monetization/plans GET:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
