import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../../../../models/ManualPayment";
import Product from "../../../../../../models/Product";
import User from "../../../../../../models/User";
import Chat from "../../../../../../models/Chat";
import { AdminAuthService } from "../../../../modules/auth/services/admin-auth.service";
import { createAdminAuditLogger } from "../../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../../lib/audit-logger";
import RevenueEntry from "../../../../../../models/RevenueEntry";

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

    // Mark payment as approved
    payment.status = "approved";
    if (reviewedById) {
      payment.reviewedBy = reviewedById as any;
    }
    payment.reviewedAt = new Date();
    payment.adminNotes = adminNotes;
    await payment.save();

    // Create or update revenue entry for this manual payment (idempotent)
    const amount = Number(payment.amount || 0);
    const currency = (payment as any).currency || "LRD";
    let revenueAction: "created" | "updated" | "skipped" = "skipped";
    let revenueEntryId: string | undefined;
    try {
      if (amount > 0) {
        const refId = String(payment._id);
        const existing = await RevenueEntry.findOne({
          type: "income",
          source: "manual_payment",
          referenceId: refId,
        });
        if (!existing) {
          const rev = await RevenueEntry.create({
            type: "income",
            amount,
            currency,
            source: "manual_payment",
            referenceId: refId,
            note: `Manual payment approved for ${payment.featureType}:${
              payment.featurePlan
            }${payment.listing ? ` listing:${payment.listing}` : ""}`,
            meta: {
              featureType: payment.featureType,
              featurePlan: payment.featurePlan,
              featureDuration: payment.featureDuration,
              bumpCredits: payment.bumpCredits ?? undefined,
              approvedAt: new Date().toISOString(),
            },
            createdBy: reviewedById || undefined,
          });
          revenueAction = "created";
          revenueEntryId = String(rev._id);
        } else {
          await RevenueEntry.updateOne(
            { _id: existing._id },
            {
              $set: {
                amount, // keep latest amount
                currency,
                "meta.approvedAt": new Date().toISOString(),
              },
            }
          );
          revenueAction = "updated";
          revenueEntryId = String(existing._id);
        }
      }
    } catch (revErr) {
      console.error(
        "Revenue logging failed on manual payment approval:",
        revErr
      );
    }

    // Handle different feature types
    const now = new Date();
    let productDoc = null;
    if (
      payment.listing &&
      typeof payment.listing === "object" &&
      "featured" in payment.listing
    ) {
      productDoc = payment.listing;
    } else {
      productDoc = await Product.findById(payment.listing);
    }

    if (productDoc && typeof productDoc === "object" && productDoc !== null) {
      const productIdToUpdate = productDoc._id || payment.listing;

      if (payment.featureType === "featured_listing") {
        // Handle featured listing
        const featureDuration = payment.featureDuration || 7; // Default to 7 days if not set
        const featuredExpiresAt = new Date(
          now.getTime() + featureDuration * 24 * 60 * 60 * 1000
        );

        await Product.updateOne(
          { _id: productIdToUpdate },
          {
            $set: {
              featured: true,
              featuredExpiresAt: featuredExpiresAt,
              featuredStartedAt: now,
              featuredDuration: featureDuration,
            },
          }
        );
      } else if (payment.featureType === "bump_listing") {
        // Handle bump listing - add bump credits
        const bumpCredits = payment.bumpCredits || payment.featureDuration || 1;

        await Product.updateOne(
          { _id: productIdToUpdate },
          {
            $inc: { bumpCredits: bumpCredits },
          }
        );
      }
    }

    // If this manual payment is for account verification, persist verification on the user
    if (payment.featureType === "account_verification") {
      try {
        const now = new Date();
        const days = Math.max(1, Number(payment.featureDuration) || 1);
        const paidUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        await User.updateOne(
          { _id: payment.user._id },
          {
            $set: {
              "profile.verificationStatus": "fully_verified",
              verificationPaidAt: now,
              verificationPaidUntil: paidUntil,
            },
          }
        );
      } catch (e) {
        console.error("Failed to persist user verification on approval:", e);
      }
    }

    // Send message to user via chat
    const userId = payment.user._id;
    let senderId = reviewedById || userId; // Use reviewedById or fallback to userId for system messages
    const productTitle =
      productDoc &&
      typeof productDoc === "object" &&
      productDoc !== null &&
      "title" in productDoc
        ? productDoc.title
        : "";
    const productId = (
      productDoc &&
      typeof productDoc === "object" &&
      productDoc !== null &&
      "_id" in productDoc
        ? productDoc._id
        : payment.listing
    ) as string | mongoose.Types.ObjectId;
    let chat = await Chat.findOne({ product: productId, user2: userId });
    if (!chat) {
      chat = await Chat.create({
        product: productId,
        user1: senderId,
        user2: userId,
        messages: [],
      });
      console.log("Created new chat:", chat._id);
    }
    // Create appropriate message based on feature type
    let message = "";
    if (payment.featureType === "featured_listing") {
      const featurePlanLabel =
        payment.featurePlan === "3_days"
          ? "3 days"
          : payment.featurePlan === "7_days"
          ? "7 days"
          : "14 days";
      message = `Your manual payment for featuring the product "${productTitle}" has been approved. Your product is now featured for ${featurePlanLabel}.`;
    } else if (payment.featureType === "bump_listing") {
      const bumpCredits = payment.bumpCredits || payment.featureDuration || 1;
      const bumpText =
        bumpCredits === 1 ? "1 bump credit" : `${bumpCredits} bump credits`;
      message = `Your manual payment for bump credits has been approved. You now have ${bumpText} for the product "${productTitle}". You can use these credits to bump your listing to the top of search results.`;
    } else {
      message = `Your manual payment for the product "${productTitle}" has been approved.`;
    }

    chat.messages.push({
      sender: senderId,
      content: message,
      sentAt: new Date(),
      readBy: [],
    });
    chat.lastMessageAt = new Date();
    console.log("Pushed message to chat:", chat._id, "Sender:", senderId);
    await chat.save();

    // Log the payment approval operation
    await logger.logPaymentOperation(OperationType.PAYMENT_APPROVE, params.id, {
      adminNotes,
      productId: productId.toString(),
      productTitle,
      userId: userId.toString(),
      userEmail: (payment.user as any)?.email || "unknown@email.com",
      amount: payment.amount,
      adminUserId: adminId,
      previousStatus: "pending",
      newStatus: "approved",
      revenue: {
        action: revenueAction,
        entryId: revenueEntryId,
        currency,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment approved and user notified.",
      revenue: {
        action: revenueAction,
        entryId: revenueEntryId || null,
        amount,
        currency,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to approve manual payment." },
      { status: 500 }
    );
  }
}
