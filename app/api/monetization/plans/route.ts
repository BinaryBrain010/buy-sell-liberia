import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";
import dbConnect from "@/lib/mongoose";
import { ensureModelsRegistered } from "@/lib/ensure-models";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import BumpPlan from "@/models/BumpPlan";

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
    // Connect only if we need to read plan models
    await dbConnect();
    ensureModelsRegistered();

    const prices = settings.monetizationPrices || {};
    // Primary source: settings.monetizationPrices
    let bumpPricing: Record<string, any> = prices.bump_listing || {};
    let featuredPricing: Record<string, any> = prices.featured_listing || {};

    // Fallback for bump plans: BumpPlan collection
    if (!bumpPricing || Object.keys(bumpPricing).length === 0) {
      try {
        const bumpPlans = await BumpPlan.findActive();
        if (bumpPlans && bumpPlans.length > 0) {
          bumpPricing = bumpPlans.reduce((acc: any, p: any) => {
            acc[p._id.toString()] = {
              price: Number(p.price) || 0,
              credits: Number(p.bumps) || 0,
              label: p.title,
              description: p.description || undefined,
            };
            return acc;
          }, {} as Record<string, any>);
        }
      } catch (e) {
        // no-op fallback
      }
    }

    // Fallback for featured plans: SubscriptionPlan collection
    if (!featuredPricing || Object.keys(featuredPricing).length === 0) {
      try {
        const subs = await SubscriptionPlan.findActivePlans();
        if (subs && subs.length > 0) {
          featuredPricing = subs.reduce((acc: any, p: any) => {
            acc[p._id.toString()] = {
              price: Number(p.price) || 0,
              duration: Number(p.duration) || 0,
              label: p.name,
              description: p.description || undefined,
            };
            return acc;
          }, {} as Record<string, any>);
        }
      } catch (e) {
        // no-op fallback
      }
    }

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
