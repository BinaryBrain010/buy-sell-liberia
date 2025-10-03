import { NextRequest, NextResponse } from "next/server";
import UserSubscription from "../../../../models/UserSubscription";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// GET: Get pending subscription requests (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Get pending subscriptions with user and plan details
    const [pendingSubscriptions, total] = await Promise.all([
      UserSubscription.find({ status: "pending" })
        .populate("user", "fullName username email phone")
        .populate("plan", "name type description price maxAds featuredAds homepageBanner features")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserSubscription.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      success: true,
      subscriptions: pendingSubscriptions.map(sub => ({
        id: sub._id,
        user: {
          id: sub.user._id,
          fullName: sub.user.fullName,
          username: sub.user.username,
          email: sub.user.email,
          phone: sub.user.phone,
        },
        plan: {
          id: sub.plan._id,
          name: sub.plan.name,
          type: sub.plan.type,
          description: sub.plan.description,
          price: sub.plan.price,
          maxAds: sub.plan.maxAds,
          featuredAds: sub.plan.featuredAds,
          homepageBanner: sub.plan.homepageBanner,
          features: sub.plan.features,
        },
        planType: sub.planType,
        status: sub.status,
        paymentStatus: sub.paymentStatus,
        amount: sub.amount,
        currency: sub.currency,
        paymentMethod: sub.paymentMethod,
        transactionId: sub.transactionId,
        paymentScreenshot: sub.paymentScreenshot,
        paymentNotes: sub.paymentNotes,
        startDate: sub.startDate,
        endDate: sub.endDate,
        createdAt: sub.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      stats: {
        pending: total,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/admin/subscriptions/pending GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
