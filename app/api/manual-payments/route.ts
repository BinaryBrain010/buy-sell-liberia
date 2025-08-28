import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ManualPayment from "../../../models/ManualPayment";
import Product from "../../../models/Product";
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware";
import { parseFiles } from "@/lib/multer";
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload";

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
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI!);
    }

    // Check product exists and belongs to user
    const product = await Product.findById(listing);
    if (!product) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    if (product.user_id.toString() !== userId) {
      return NextResponse.json({ error: "You can only feature your own products." }, { status: 403 });
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
