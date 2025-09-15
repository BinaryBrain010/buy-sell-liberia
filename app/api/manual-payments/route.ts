import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../models/ManualPayment";
import Product from "../../../models/Product";
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware";
import { parseFiles } from "@/lib/multer";
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload";
import { getSetting } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    // Check if monetization is enabled
    const monetizationEnabled = await getSetting('monetization_enabled');
    if (!monetizationEnabled) {
      return NextResponse.json({ error: "Payment features are currently unavailable" }, { status: 403 });
    }

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
    const { listing, amount, method, transactionId, userNotes = "" } = fields;

    // Validate required fields
    if (!listing || !amount || !method || !transactionId || files.length === 0) {
      return NextResponse.json({ error: "All fields are required and screenshot must be uploaded." }, { status: 400 });
    }

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
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit manual payment." }, { status: 500 });
  }
}
