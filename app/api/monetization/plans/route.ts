import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

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
    const bumpPricing = prices.bump_listing || {
      "1_bump": { price: 100, credits: 1, label: "1 Bump" },
      "3_bumps": { price: 250, credits: 3, label: "3 Bumps" },
      "5_bumps": { price: 400, credits: 5, label: "5 Bumps" },
      "10_bumps": { price: 750, credits: 10, label: "10 Bumps" },
    };

    const featuredPricing = prices.featured_listing || {
      "3_days": { price: 150, duration: 3, label: "3 Days" },
      "7_days": { price: 300, duration: 7, label: "7 Days" },
      "14_days": { price: 500, duration: 14, label: "14 Days" },
    };

    const verificationPricing = prices.account_verification || null;
    const bannerAdPricing = prices.banner_ad || null;
    const paidCategoryPricing = prices.paid_category_listing || null;

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

    return NextResponse.json({
      enabled: !!settings.monetizationEnabled,
      // granular toggles for UI gating
      isFeaturedActive: !!settings.isFeaturedActive,
      isSubscriptionActive: !!settings.isSubscriptionActive,
      isBannerAdsActive: !!settings.isBannerAdsActive,
      isPaidCategoryActive: !!(settings as any).isPaidCategoryActive,
      currency: settings.platformCurrency || "LRD",
      paymentDetails: normalizedPaymentDetails,
      plans: {
        bump_listing: bumpPricing,
        featured_listing: featuredPricing,
        ...(verificationPricing
          ? { account_verification: verificationPricing }
          : {}),
        ...(bannerAdPricing ? { banner_ad: bannerAdPricing } : {}),
        ...(paidCategoryPricing
          ? { paid_category_listing: paidCategoryPricing }
          : {}),
      },
      // Backward compat flag
      paidCategoriesEnabled: !!(settings as any).paidCategoriesEnabled,
      // Normalized object for clients moving forward
      paidCategories: {
        enabled: !!(settings as any).paidCategoriesEnabled,
        enforceActive: !!(settings as any).isPaidCategoryActive,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/monetization/plans GET:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
