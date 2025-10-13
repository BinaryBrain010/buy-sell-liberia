import { NextResponse } from "next/server";
import mongoose from "mongoose";
import BumpPlan from "@/models/BumpPlan";

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const plans = await BumpPlan.findActive();
    // Return trimmed public-friendly fields
    const publicPlans = plans.map((p: any) => ({
      id: p._id.toString(),
      bumps: p.bumps,
      price: p.price,
      currency: p.currency,
      title: p.title,
      description: p.description,
    }));
    return NextResponse.json({ plans: publicPlans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bump plans" },
      { status: 500 }
    );
  }
}
