import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../models/ManualPayment";
import Product from "../../../models/Product";
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware";
import { parseFiles } from "@/lib/multer";
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload";
import { SettingsService } from "@/app/api/modules/shared/services/settings.service";

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await verifyToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authResult.userId;

    // Parse files and fields
    const { files, fields } = await parseFiles(request);
    console.log('Parsed fields:', fields);
    console.log('Parsed files:', files);
    const { listing, method, transactionId, userNotes = "", featurePlan } = fields;

    // Validate required fields
    if (!listing || !method || !transactionId || !featurePlan || files.length === 0) {
      return NextResponse.json({ error: "All fields (listing, method, transactionId, featurePlan) and screenshot are required." }, { status: 400 });
    }

    // Validate feature plan
    if (!["3_days", "7_days", "14_days"].includes(featurePlan)) {
      return NextResponse.json({ error: "Invalid feature plan. Must be 3_days, 7_days, or 14_days." }, { status: 400 });
    }

    // Check if monetization is enabled
    const settings = await SettingsService.getAllSettings();
    if (!settings.monetizationEnabled) {
      return NextResponse.json({ error: "Monetization features are currently disabled." }, { status: 403 });
    }

    // Get pricing from settings
    const prices = settings.monetizationPrices || {};
    const featuredPricing = prices.featured_listing || {
      "3_days": { price: 150, duration: 3, label: "3 Days" },
      "7_days": { price: 300, duration: 7, label: "7 Days" },
      "14_days": { price: 500, duration: 14, label: "14 Days" }
    };

    const selectedPlan = featuredPricing[featurePlan];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Selected plan not found in settings." }, { status: 400 });
    }

    // Auto-calculate amount and duration from plan
    const amount = selectedPlan.price;
    const featureDuration = selectedPlan.duration;

    // Validate screenshot file
    const validation = validateImageFilesForLocal(files);
    if (!validation.valid) {
      return NextResponse.json({ error: "Screenshot validation failed", details: validation.errors }, { status: 400 });
    }

    // Connect to DB if needed
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI!);
    }

    // Check product exists and belongs to user
    const productDoc = await Product.findById(listing);
    console.log('Product found:', productDoc);
    if (!productDoc) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    const product = productDoc.toObject ? productDoc.toObject() : productDoc;
    const ownerId = product.user_id || (product as any).seller;
    if (!ownerId) {
      console.log('Product has no owner field:', product);
      return NextResponse.json({ error: "Product has no owner field." }, { status: 500 });
    }
    if (ownerId.toString() !== userId) {
      return NextResponse.json({ error: "You can only feature your own products." }, { status: 403 });
    }

    // Prevent duplicate pending requests for the same user and listing
    const existingPending = await ManualPayment.findOne({
      user: userId,
      listing: product._id,
      status: 'pending',
    });
    if (existingPending) {
      return NextResponse.json({ error: 'You already have a pending feature request for this product. Please wait for admin response.' }, { status: 409 });
    }

    // Upload screenshot (use product category and title for folder structure)
    const screenshotPaths = await uploadProductImagesToLocal(files, String(product.category_id), String(product._id), product.title);
    const screenshot = screenshotPaths[0];

    // Create manual payment request
    const payment = await ManualPayment.create({
      user: userId,
      listing: product._id,
      amount,
      method,
      transactionId,
      screenshot,
      userNotes,
      status: "pending",
      featureType: "featured_listing",
      featurePlan,
      featureDuration,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit manual payment." }, { status: 500 });
  }
}
