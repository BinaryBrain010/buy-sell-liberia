import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/api/modules/auth/middlewares/next-auth-middleware";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import ManualPayment from "@/models/ManualPayment";

/**
 * POST /api/monetization/manual-payment
 * Unified manual payment creation for multiple feature types.
 * Body (JSON): {
 *   featureType: 'featured_listing' | 'bump_listing' | 'account_verification' | 'subscription' | 'banner_ad' | 'paid_category_listing',
 *   plan: string, // for featured/banner: plan key in settings; for subscription: planId
 *   listing?: string, // required for featured listings and paid category per-ad flows
 *   method: 'MTN' | 'Orange' | 'Bank',
 *   transactionId: string,
 *   screenshot: string, // base64 data URL
 *   userNotes?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyToken(req);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      featureType,
      plan,
      listing,
      method,
      transactionId,
      screenshot,
      userNotes,
    } = body || {};

    if (!featureType || !plan || !method || !transactionId || !screenshot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Load settings for pricing and toggles
    const settings = await SettingsService.getAllSettings();
    if (!settings.monetizationEnabled) {
      return NextResponse.json(
        { error: "Monetization is disabled" },
        { status: 403 }
      );
    }

    const prices = settings.monetizationPrices || {};

    // Determine plan details by feature type
    let amount = 0;
    let featureDuration = 0; // days for featured/subscription or number of bumps for bump_listing
    let bumpCredits: number | undefined;

    if (featureType === "featured_listing") {
      if (!settings.isFeaturedActive) {
        return NextResponse.json(
          { error: "Featured listings are currently inactive" },
          { status: 403 }
        );
      }
      const cfg = prices.featured_listing || {};
      const p = cfg[plan];
      if (!p)
        return NextResponse.json(
          { error: "Invalid plan for featured listing" },
          { status: 400 }
        );
      amount = Number(p.price) || 0;
      featureDuration = Number(p.duration) || 0;
      if (!listing)
        return NextResponse.json(
          { error: "listing is required for featured listing" },
          { status: 400 }
        );
    } else if (featureType === "bump_listing") {
      if (!settings.isFeaturedActive && !prices.bump_listing) {
        // Allow bumps even if featured is off; check explicit bumps config
      }
      const cfg = prices.bump_listing || {};
      const p = cfg[plan];
      if (!p)
        return NextResponse.json(
          { error: "Invalid plan for bump listing" },
          { status: 400 }
        );
      amount = Number(p.price) || 0;
      bumpCredits = Number(p.credits) || 0;
      featureDuration = bumpCredits; // store credits in featureDuration for compatibility; bumpCredits is explicit too
      if (!listing)
        return NextResponse.json(
          { error: "listing is required for bump listing" },
          { status: 400 }
        );
    } else if (featureType === "account_verification") {
      const cfg = prices.account_verification || {};
      const p = cfg[plan];
      if (!p)
        return NextResponse.json(
          { error: "Invalid plan for account verification" },
          { status: 400 }
        );
      amount = Number(p.price) || 0;
      featureDuration = Number(p.duration || 1) || 1; // treat as 1 by default
    } else if (featureType === "subscription") {
      if (!settings.isSubscriptionActive) {
        return NextResponse.json(
          { error: "Subscriptions are currently inactive" },
          { status: 403 }
        );
      }
      // plan is subscription planId
      const subPlan = await SubscriptionPlan.findById(plan);
      if (!subPlan)
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 }
        );
      amount = Number(subPlan.price) || 0;
      featureDuration = Number(subPlan.duration) || 30;
    } else if (featureType === "banner_ad") {
      if (!settings.isBannerAdsActive) {
        return NextResponse.json(
          { error: "Banner ads are currently inactive" },
          { status: 403 }
        );
      }
      const cfg = prices.banner_ad || {};
      const p = cfg[plan];
      if (!p)
        return NextResponse.json(
          { error: "Invalid plan for banner ad" },
          { status: 400 }
        );
      amount = Number(p.price) || 0;
      featureDuration = Number(p.duration) || 0;
    } else if (featureType === "paid_category_listing") {
      if (!settings.isPaidCategoryActive) {
        return NextResponse.json(
          { error: "Paid category listings are disabled" },
          { status: 403 }
        );
      }
      // For paid category per listing, amount should come from the category settings (USD)
      // We rely on frontend to pass listing ID; verify and compute price from listing.category
      if (!listing)
        return NextResponse.json(
          { error: "listing is required for paid category listing" },
          { status: 400 }
        );
      const product = await Product.findOne({
        _id: listing,
        user_id: auth.userId,
      }).populate("category_id");
      if (!product)
        return NextResponse.json(
          { error: "Listing not found or you don't own it" },
          { status: 404 }
        );
      const category: any = product.category_id;
      if (!category || !category.isPaidCategory || !category.pricePerListing) {
        return NextResponse.json(
          { error: "This listing is not in a paid category" },
          { status: 400 }
        );
      }
      amount = Number(category.pricePerListing) || 0;
    } else {
      return NextResponse.json(
        { error: "Unsupported featureType" },
        { status: 400 }
      );
    }

    // For listing-bound, verify product ownership
    if (listing && featureType !== "banner_ad") {
      const product = await Product.findOne({
        _id: listing,
        user_id: auth.userId,
      });
      if (!product) {
        return NextResponse.json(
          { error: "Listing not found or you don't own it" },
          { status: 404 }
        );
      }
    }

    // Create manual payment record (store base64 screenshot as-is or later replace with a file URL)
    const payment = await ManualPayment.create({
      user: auth.userId,
      listing: listing || undefined,
      amount,
      currency: settings.platformCurrency || "LRD",
      method,
      screenshot,
      transactionId,
      userNotes,
      status: "pending",
      featureType,
      featurePlan: plan,
      featureDuration,
      bumpCredits,
    });

    return NextResponse.json(
      { success: true, paymentId: payment._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in /api/monetization/manual-payment POST:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create manual payment" },
      { status: 500 }
    );
  }
}
