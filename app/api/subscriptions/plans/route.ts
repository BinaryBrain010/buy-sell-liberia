import { NextRequest, NextResponse } from "next/server";
import SubscriptionPlan from "../../../../models/SubscriptionPlan";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// GET: Get all active subscription plans (public)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    ensureModelsRegistered();

    const plans = await SubscriptionPlan.findActivePlans();
    
    return NextResponse.json({
      success: true,
      plans: plans.map((plan: any) => ({
        id: plan._id,
        name: plan.name,
        type: plan.type,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        maxAds: plan.maxAds,
        featuredAds: plan.featuredAds,
        homepageBanner: plan.homepageBanner,
        features: plan.features,
        isPopular: plan.isPopular,
        priority: plan.priority,
      }))
    });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/plans GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create or update subscription plans (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (!payload || typeof payload !== "object" || (payload.role !== "admin" && payload.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    ensureModelsRegistered();

    const { plans } = await request.json();

    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: "Plans must be an array" }, { status: 400 });
    }

    const results = [];
    for (const planData of plans) {
      const { type, name, description, price, maxAds, featuredAds, homepageBanner, features, isPopular } = planData;

      if (!type || !name || !description || price === undefined || maxAds === undefined) {
        return NextResponse.json({ error: "Missing required fields for plan" }, { status: 400 });
      }

      const priority = type === "basic" ? 1 : type === "pro" ? 2 : 3;

      const plan = await SubscriptionPlan.findOneAndUpdate(
        { type },
        {
          name,
          description,
          price,
          maxAds,
          featuredAds: featuredAds || 0,
          homepageBanner: homepageBanner || false,
          features: features || [],
          isPopular: isPopular || false,
          priority,
          status: "active",
        },
        { upsert: true, new: true }
      );

      results.push(plan);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plans updated successfully",
      plans: results,
    });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/plans POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
