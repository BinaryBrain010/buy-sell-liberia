import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../../../../models/ManualPayment";
import Product from "../../../../../../models/Product";
import User from "../../../../../../models/User";
import { sendChatMessageToUsers } from "@/app/api/modules/notifications/services/chat-notification.service";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import { createAdminAuditLogger } from "../../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../../lib/audit-logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminId = payload._id || payload.id;
    const adminEmail =
      typeof (payload as any).email === "string"
        ? (payload as any).email
        : undefined;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(request, adminId);

    const payment = await ManualPayment.findById(params.id)
      .populate("user")
      .populate("listing");
    if (!payment) {
      return NextResponse.json(
        { error: "Manual payment not found" },
        { status: 404 }
      );
    }
    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    // Accept adminNotes from body
    let adminNotes = "";
    try {
      const body = await request.json();
      adminNotes = body.adminNotes || "";
    } catch (e) {
      // No body or not JSON, ignore
    }

    // Validate and set reviewedBy (only if valid ObjectId)
    let reviewedById: mongoose.Types.ObjectId | null = null;
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      reviewedById = new mongoose.Types.ObjectId(adminId);
    } else if (payload.email) {
      // Try to find admin by email if ID is not valid ObjectId
      const adminUser = await User.findOne({ email: payload.email });
      if (adminUser) {
        reviewedById = adminUser._id as mongoose.Types.ObjectId;
      }
    }

    const previousStatus = payment.status;
    payment.status = "rejected";
    payment.adminNotes = adminNotes;
    if (reviewedById) {
      payment.reviewedBy = reviewedById as any;
    }
    payment.reviewedAt = new Date();
    await payment.save();

    // Log payment rejection operation
    await logger.logPaymentOperation(OperationType.PAYMENT_REJECT, params.id, {
      adminUserId: adminId,
      paymentAmount: payment.amount,
      paymentMethod: payment.method,
      paymentTransactionId: payment.transactionId,
      userEmail: (payment.user as any)?.email || "Unknown",
      productTitle:
        payment.listing &&
        typeof payment.listing === "object" &&
        "title" in payment.listing
          ? (payment.listing as any)?.title
          : "",
      previousStatus,
      newStatus: "rejected",
      rejectionReason: adminNotes,
      adminNotes,
    });

    // Send message to user via chat using centralized notification service
    const userId = (payment.user as any)?._id?.toString();
    const productTitle =
      payment.listing &&
      typeof payment.listing === "object" &&
      "title" in payment.listing
        ? (payment.listing as any).title ?? ""
        : "";
    const productId =
      payment.listing &&
      typeof payment.listing === "object" &&
      "_id" in payment.listing
        ? (payment.listing as any)._id?.toString()
        : payment.listing
        ? String(payment.listing)
        : null;

    const message = `Your manual payment${
      productTitle ? ` for the product "${productTitle}"` : ""
    } has been rejected. Reason: ${adminNotes || "No reason provided."}`;
    if (userId) {
      await sendChatMessageToUsers({
        recipients: [userId],
        message,
        productId,
        useSystemSender: true,
        adminUserId: adminId,
        adminEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment rejected and user notified. User can resubmit.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reject manual payment." },
      { status: 500 }
    );
  }
}
