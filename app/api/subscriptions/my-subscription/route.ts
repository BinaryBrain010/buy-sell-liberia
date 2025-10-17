import { NextRequest, NextResponse } from "next/server";
import UserSubscription from "../../../../models/UserSubscription";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// GET: Get user's current subscription
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
    const activeSubscription = await (UserSubscription as any).findActiveByUser(userId);
    
    // Get pending subscriptions
    const pendingSubscriptions = await (UserSubscription as any).findPendingByUser(userId);

    // Get subscription history (last 10)
    const subscriptionHistory = await UserSubscription.find({
      user: userId,
      status: { $in: ["expired", "cancelled"] },
    })
      .populate("plan", "name type description features")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      activeSubscription: activeSubscription ? {
        id: activeSubscription._id,
        planType: activeSubscription.planType,
        status: activeSubscription.status,
        paymentStatus: activeSubscription.paymentStatus,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        autoRenew: activeSubscription.autoRenew,
        adsUsed: activeSubscription.adsUsed,
        featuredAdsUsed: activeSubscription.featuredAdsUsed,
        homepageBannerUsed: activeSubscription.homepageBannerUsed,
        remainingAds: activeSubscription.getRemainingAds(),
        remainingFeaturedAds: activeSubscription.getRemainingFeaturedAds(),
        canPostAd: activeSubscription.canPostAd(),
        canUseFeaturedAd: activeSubscription.canUseFeaturedAd(),
        canUseHomepageBanner: activeSubscription.canUseHomepageBanner(),
        plan: activeSubscription.plan,
      } : null,
      pendingSubscriptions: pendingSubscriptions.map((sub: any) => ({
        id: sub._id,
        planType: sub.planType,
        status: sub.status,
        paymentStatus: sub.paymentStatus,
        amount: sub.amount,
        createdAt: sub.createdAt,
        plan: sub.plan,
      })),
      subscriptionHistory: subscriptionHistory.map(sub => ({
        id: sub._id,
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        createdAt: sub.createdAt,
        plan: sub.plan,
      })),
    });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/my-subscription GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
