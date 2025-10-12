import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import UserSubscription from "@/models/UserSubscription";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import { extractUserInfoFromPayload } from "../../../../../../lib/admin-audit-middleware";
import dbConnect from "../../../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../../../lib/ensure-models";

// PATCH: Approve a subscription request (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { userId: adminUserId, role: adminRole, email: adminEmail, name: adminName } = extractUserInfoFromPayload(payload);

    await dbConnect();
    ensureModelsRegistered();

    const { adminNotes = "" } = await request.json();

    // Find the subscription
    const subscription = await UserSubscription.findById(params.id)
      .populate("user", "fullName username email")
      .populate("plan", "name type description");

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.status !== "pending") {
      return NextResponse.json({ 
        error: "Subscription is not in pending status" 
      }, { status: 400 });
    }

    // Check if user already has an active subscription
    const existingActiveSubscription = await UserSubscription.findActiveByUser(subscription.user._id);
    if (existingActiveSubscription) {
      return NextResponse.json({ 
        error: "User already has an active subscription" 
      }, { status: 409 });
    }

    // Approve the subscription
    subscription.status = "active";
    subscription.paymentStatus = "paid";
    subscription.approvedBy = new mongoose.Types.ObjectId(adminUserId);
    subscription.approvedAt = new Date();
    subscription.adminNotes = adminNotes;

    await subscription.save();

    return NextResponse.json({
      success: true,
      message: "Subscription approved successfully",
      subscription: {
        id: subscription._id,
        user: subscription.user,
        plan: subscription.plan,
        planType: subscription.planType,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        approvedBy: adminUserId,
        approvedAt: subscription.approvedAt,
        adminNotes: subscription.adminNotes,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/admin/subscriptions/[id]/approve PATCH:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
