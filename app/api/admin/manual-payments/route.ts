import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../../models/ManualPayment";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import "../../../../models";
import {
  createAdminAuditLogger,
  ModuleType,
  OperationType,
} from "../../../../lib/admin-audit-middleware";

export async function GET(request: NextRequest) {
  try {
    // Auth: Allow all admin/employee roles (centralized helper)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check (super_admin only):
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to DB if needed
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || process.env.MONGODB_URI!
      );
    }

    // Pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (status) filter.status = status;

    const total = await ManualPayment.countDocuments(filter);
    const payments = await ManualPayment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("user", "fullName username email")
      .populate("listing", "title featured")
      .lean();

    // Add all required details for the panel
    const result = payments.map((payment) => ({
      _id: payment._id,
      user: payment.user,
      listing: payment.listing,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId,
      screenshot: payment.screenshot,
      status: payment.status,
      adminNotes: payment.adminNotes,
      userNotes: payment.userNotes,
      createdAt: payment.createdAt,
      reviewedBy: payment.reviewedBy,
      reviewedAt: payment.reviewedAt,
      // Feature-specific details
      featureType: (payment as any).featureType || "featured_listing",
      featurePlan: (payment as any).featurePlan || null,
      featureDuration: (payment as any).featureDuration || null,
    }));

    return NextResponse.json({
      payments: result,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Manual payments GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch manual payments" },
      { status: 500 }
    );
  }
}

// PATCH: Approve/reject a manual payment and apply side effects (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Auth: Allow all admin/employee roles (centralized helper)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, action, adminNotes } = body || {};
    if (!paymentId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "paymentId and action (approve|reject) are required" },
        { status: 400 }
      );
    }

    // Connect DB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || process.env.MONGODB_URI!
      );
    }

    // Load payment
    const payment = await ManualPayment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: `Payment already ${payment.status}` },
        { status: 400 }
      );
    }

    // Handle rejection
    if (action === "reject") {
      payment.status = "rejected";
      if (adminNotes) payment.adminNotes = adminNotes;
      const reviewerRaw = (payload as any)._id || (payload as any).id || null;
      if (reviewerRaw && mongoose.Types.ObjectId.isValid(String(reviewerRaw))) {
        payment.reviewedBy = reviewerRaw as any;
      }
      payment.reviewedAt = new Date();
      await payment.save();

      // Audit log: payment reject
      try {
        const logger = createAdminAuditLogger(
          request,
          (payload as any)._id ||
            (payload as any).id ||
            (payload as any).email ||
            "unknown",
          (payload as any).role,
          (payload as any).email,
          (payload as any).name
        );
        await logger.logPaymentOperation(
          OperationType.PAYMENT_REJECT,
          String(payment._id),
          {
            adminNotes: adminNotes || undefined,
            featureType: (payment as any).featureType,
            featurePlan: (payment as any).featurePlan,
            amount: payment.amount,
            currency: (payment as any).currency,
            listing: payment.listing ? String(payment.listing) : undefined,
            status: "rejected",
          }
        );
      } catch (e) {
        console.error("Audit log (reject) failed:", e);
      }
      return NextResponse.json({ success: true, status: payment.status });
    }

    // Approve: apply feature-specific side effects
    const featureType = (payment as any).featureType;
    const bumpCredits =
      (payment as any).bumpCredits || (payment as any).featureDuration || 0;
    const featureDuration = (payment as any).featureDuration || 0;

    if (featureType === "bump_listing") {
      // Account-level bumps: credit to user.bumpCount
      if (bumpCredits > 0) {
        await User.findByIdAndUpdate(payment.user, {
          $inc: { bumpCount: bumpCredits },
        });
      }
    } else if (featureType === "featured_listing") {
      // Listing must exist; set featured and expiry
      if (!payment.listing) {
        return NextResponse.json(
          { error: "Payment has no listing to feature" },
          { status: 400 }
        );
      }
      const product = await Product.findById(payment.listing);
      if (!product) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      const now = new Date();
      const expires = new Date(
        now.getTime() + Math.max(1, featureDuration) * 24 * 60 * 60 * 1000
      );
      product.featured = true;
      (product as any).featuredStartedAt = now;
      (product as any).featuredExpiresAt = expires;
      (product as any).featuredDuration = Math.max(1, featureDuration);
      await product.save();
    } else if (featureType === "paid_category_listing") {
      // No-op beyond approval today; price already verified. Optionally mark a flag if needed.
    } else if (featureType === "account_verification") {
      // Elevate user verification status to fully_verified
      await User.findByIdAndUpdate(payment.user, {
        $set: { "profile.verificationStatus": "fully_verified" },
      });
    } else if (featureType === "banner_ad") {
      // No-op placeholder: real implementation would schedule a banner slot
    }

    // Mark payment approved
    payment.status = "approved";
    if (adminNotes) payment.adminNotes = adminNotes;
    const reviewerRaw2 = (payload as any)._id || (payload as any).id || null;
    if (reviewerRaw2 && mongoose.Types.ObjectId.isValid(String(reviewerRaw2))) {
      payment.reviewedBy = reviewerRaw2 as any;
    }
    payment.reviewedAt = new Date();
    await payment.save();

    // Audit logs for approval and any listing change
    try {
      const logger = createAdminAuditLogger(
        request,
        (payload as any)._id ||
          (payload as any).id ||
          (payload as any).email ||
          "unknown",
        (payload as any).role,
        (payload as any).email,
        (payload as any).name
      );
      await logger.logPaymentOperation(
        OperationType.PAYMENT_APPROVE,
        String(payment._id),
        {
          adminNotes: adminNotes || undefined,
          featureType,
          featurePlan: (payment as any).featurePlan,
          amount: payment.amount,
          currency: (payment as any).currency,
          listing: payment.listing ? String(payment.listing) : undefined,
          status: "approved",
          bumpCredits: bumpCredits || undefined,
          featureDuration: featureDuration || undefined,
        }
      );
      if (featureType === "featured_listing" && payment.listing) {
        await logger.logListingOperation(
          OperationType.LISTING_FEATURE,
          String(payment.listing),
          {
            paymentId: String(payment._id),
            featureDuration: featureDuration || undefined,
          }
        );
      }
    } catch (e) {
      console.error("Audit log (approve) failed:", e);
    }

    return NextResponse.json({ success: true, status: payment.status });
  } catch (error: any) {
    console.error("Manual payments PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment" },
      { status: 500 }
    );
  }
}
