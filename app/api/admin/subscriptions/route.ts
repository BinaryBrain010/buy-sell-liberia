import { NextRequest, NextResponse } from "next/server";
import UserSubscription from "../../../../models/UserSubscription";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import { extractUserInfoFromPayload } from "../../../../lib/admin-audit-middleware";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// GET: Get all subscription requests (admin only)
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get subscriptions with pagination
    const [subscriptions, total] = await Promise.all([
      UserSubscription.find(query)
        .populate("user", "fullName username email phone")
        .populate("plan", "name type description price maxAds featuredAds homepageBanner")
        .populate("approvedBy", "fullName username")
        .populate("cancelledBy", "fullName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserSubscription.countDocuments(query),
    ]);

    // Get statistics
    const stats = await UserSubscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub._id,
        user: sub.user,
        plan: sub.plan,
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
        autoRenew: sub.autoRenew,
        adsUsed: sub.adsUsed,
        featuredAdsUsed: sub.featuredAdsUsed,
        homepageBannerUsed: sub.homepageBannerUsed,
        approvedBy: sub.approvedBy,
        approvedAt: sub.approvedAt,
        adminNotes: sub.adminNotes,
        cancelledAt: sub.cancelledAt,
        cancelledBy: sub.cancelledBy,
        cancellationReason: sub.cancellationReason,
        renewalCount: sub.renewalCount,
        lastRenewedAt: sub.lastRenewedAt,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      stats: statusStats,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/subscriptions GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
