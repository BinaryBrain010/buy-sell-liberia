import { NextRequest, NextResponse } from "next/server";
import UserSubscription from "../../../../models/UserSubscription";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// GET: Get user's subscription usage
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authResult.userId;

    await dbConnect();
    ensureModelsRegistered();

    // Get active subscription
    const subscription = await (UserSubscription as any).findActiveByUser(userId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        hasSubscription: false,
        message: "No active subscription found",
        limits: {
          maxAds: 5, // Default limit for non-subscribed users
          maxFeaturedAds: 0,
          homepageBanner: false,
        },
        usage: {
          adsUsed: 0,
          featuredAdsUsed: 0,
          homepageBannerUsed: false,
        },
        remaining: {
          ads: 5,
          featuredAds: 0,
          homepageBanner: false,
        },
        canPostAd: true, // Allow 5 ads for non-subscribed users
        canUseFeaturedAd: false,
        canUseHomepageBanner: false,
      });
    }

    return NextResponse.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
      },
      limits: {
        maxAds: subscription.planType === "basic" ? 20 : 
                subscription.planType === "pro" ? 60 : 
                Number.MAX_SAFE_INTEGER, // VIP unlimited
        maxFeaturedAds: subscription.planType === "basic" ? 0 : 
                       subscription.planType === "pro" ? 5 : 
                       Number.MAX_SAFE_INTEGER, // VIP unlimited
        homepageBanner: subscription.planType === "vip",
      },
      usage: {
        adsUsed: subscription.adsUsed,
        featuredAdsUsed: subscription.featuredAdsUsed,
        homepageBannerUsed: subscription.homepageBannerUsed,
      },
      remaining: {
        ads: subscription.getRemainingAds(),
        featuredAds: subscription.getRemainingFeaturedAds(),
        homepageBanner: subscription.canUseHomepageBanner(),
      },
      canPostAd: subscription.canPostAd(),
      canUseFeaturedAd: subscription.canUseFeaturedAd(),
      canUseHomepageBanner: subscription.canUseHomepageBanner(),
    });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/usage GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Increment usage counters
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authResult.userId;
    const { action, type } = await request.json();

    if (!action || !type) {
      return NextResponse.json({ 
        error: "Action and type are required" 
      }, { status: 400 });
    }

    await dbConnect();
    ensureModelsRegistered();

    // Get active subscription
    const subscription = await (UserSubscription as any).findActiveByUser(userId);

    if (!subscription) {
      // For non-subscribed users, check if they can still post ads (limit of 5)
      if (action === "increment" && type === "ad") {
        // This would need to be tracked separately for non-subscribed users
        // For now, we'll allow it and let the product creation handle the limit
        return NextResponse.json({
          success: true,
          message: "Usage incremented (non-subscribed user)",
          canPostAd: true,
        });
      }
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 404 });
    }

    let updatedSubscription;
    let message = "";

    switch (action) {
      case "increment":
        switch (type) {
          case "ad":
            if (!subscription.canPostAd()) {
              return NextResponse.json({ 
                error: "Ad limit reached for current subscription" 
              }, { status: 403 });
            }
            updatedSubscription = await subscription.incrementAdUsage();
            message = "Ad usage incremented";
            break;
          case "featured_ad":
            if (!subscription.canUseFeaturedAd()) {
              return NextResponse.json({ 
                error: "Featured ad limit reached for current subscription" 
              }, { status: 403 });
            }
            updatedSubscription = await subscription.incrementFeaturedAdUsage();
            message = "Featured ad usage incremented";
            break;
          case "homepage_banner":
            if (!subscription.canUseHomepageBanner()) {
              return NextResponse.json({ 
                error: "Homepage banner not available or already used" 
              }, { status: 403 });
            }
            updatedSubscription = await subscription.useHomepageBanner();
            message = "Homepage banner used";
            break;
          default:
            return NextResponse.json({ 
              error: "Invalid type" 
            }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ 
          error: "Invalid action" 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message,
      subscription: {
        id: updatedSubscription._id,
        adsUsed: updatedSubscription.adsUsed,
        featuredAdsUsed: updatedSubscription.featuredAdsUsed,
        homepageBannerUsed: updatedSubscription.homepageBannerUsed,
        remainingAds: updatedSubscription.getRemainingAds(),
        remainingFeaturedAds: updatedSubscription.getRemainingFeaturedAds(),
        canPostAd: updatedSubscription.canPostAd(),
        canUseFeaturedAd: updatedSubscription.canUseFeaturedAd(),
        canUseHomepageBanner: updatedSubscription.canUseHomepageBanner(),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/usage POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
