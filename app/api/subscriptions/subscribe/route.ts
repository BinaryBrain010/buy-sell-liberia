import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import SubscriptionPlan from "../../../../models/SubscriptionPlan";
import UserSubscription from "../../../../models/UserSubscription";
import { verifyToken } from "../../modules/auth/middlewares/next-auth-middleware";
import { parseFiles } from "@/lib/multer";
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload";
import dbConnect from "../../../../lib/mongoose";
import { ensureModelsRegistered } from "../../../../lib/ensure-models";

// POST: Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authResult.userId;

    // Parse files and fields
    const { files, fields } = await parseFiles(request);
    const { planType, paymentMethod, transactionId, userNotes = "" } = fields;

    // Validate required fields
    if (!planType || !paymentMethod || !transactionId || files.length === 0) {
      return NextResponse.json({ 
        error: "All fields (planType, paymentMethod, transactionId) and payment screenshot are required." 
      }, { status: 400 });
    }

    // Validate plan type
    if (!["basic", "pro", "vip"].includes(planType)) {
      return NextResponse.json({ 
        error: "Invalid plan type. Must be basic, pro, or vip." 
      }, { status: 400 });
    }

    await dbConnect();
    ensureModelsRegistered();

    // Get the subscription plan
    const plan = await (SubscriptionPlan as any).findByType(planType);
    if (!plan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await (UserSubscription as any).findActiveByUser(userId);
    if (existingSubscription) {
      return NextResponse.json({ 
        error: "You already have an active subscription. Please wait for it to expire or cancel it first." 
      }, { status: 409 });
    }

    // Check if user has a pending subscription for the same plan
    const pendingSubscription = await UserSubscription.findOne({
      user: userId,
      planType,
      status: "pending",
    });
    if (pendingSubscription) {
      return NextResponse.json({ 
        error: "You already have a pending subscription request for this plan. Please wait for admin approval." 
      }, { status: 409 });
    }

    // Validate payment screenshot
    const validation = validateImageFilesForLocal(files);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "Payment screenshot validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }

    // Upload payment screenshot
    const screenshotPaths = await uploadProductImagesToLocal(
      files, 
      "subscriptions", 
      new mongoose.Types.ObjectId().toString(), 
      `payment-${planType}`
    );
    const paymentScreenshot = screenshotPaths[0];

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // Create subscription
    const subscription = await UserSubscription.create({
      user: userId,
      plan: plan._id,
      planType: plan.type,
      status: "pending",
      paymentStatus: "pending",
      startDate: now,
      endDate,
      autoRenew: true,
      adsUsed: 0,
      featuredAdsUsed: 0,
      homepageBannerUsed: false,
      amount: plan.price,
      currency: "LD",
      paymentMethod,
      transactionId,
      paymentScreenshot,
      paymentNotes: userNotes,
      renewalCount: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription request submitted successfully. Please wait for admin approval.",
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        amount: subscription.amount,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        createdAt: subscription.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/subscriptions/subscribe POST:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}
