import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET: Count of products expiring in the next 10 days
export async function GET(req: NextRequest) {
  try {
    // Ensure DB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    // Only count products that are active and not already expired
    const count = await Product.countDocuments({
      status: "active",
      expires_at: { $gt: now, $lte: tenDaysFromNow },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get expiring products count" },
      { status: 500 }
    );
  }
}
