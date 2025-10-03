import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import mongoose from "mongoose";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, cities, states, countries

    let locations: any;

    switch (type) {
      case "cities":
        locations = await Product.aggregate([
          { $match: { status: "active", "location.city": { $exists: true, $ne: null, $nin: [""] } } },
          { $group: { _id: "$location.city", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
        ]);
        break;

      case "states":
        locations = await Product.aggregate([
          { $match: { status: "active", "location.state": { $exists: true, $ne: null, $nin: [""] } } },
          { $group: { _id: "$location.state", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
        ]);
        break;

      case "countries":
        locations = await Product.aggregate([
          { $match: { status: "active", "location.country": { $exists: true, $ne: null, $nin: [""] } } },
          { $group: { _id: "$location.country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { name: "$_id", count: 1, _id: 0 } },
        ]);
        break;

      default: // all
        const [cities, states, countries] = await Promise.all([
          Product.aggregate([
            { $match: { status: "active", "location.city": { $exists: true, $ne: null, $nin: [""] } } },
            { $group: { _id: "$location.city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 },
            { $project: { name: "$_id", count: 1, _id: 0 } },
          ]),
          Product.aggregate([
            { $match: { status: "active", "location.state": { $exists: true, $ne: null, $nin: [""] } } },
            { $group: { _id: "$location.state", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { name: "$_id", count: 1, _id: 0 } },
          ]),
          Product.aggregate([
            { $match: { status: "active", "location.country": { $exists: true, $ne: null, $nin: [""] } } },
            { $group: { _id: "$location.country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { name: "$_id", count: 1, _id: 0 } },
          ]),
        ]);

        locations = {
          cities,
          states,
          countries,
        };
        break;
    }

    return NextResponse.json({
      message: "Locations retrieved successfully",
      type,
      locations,
    });
  } catch (error: any) {
    console.error("[PRODUCTS LOCATIONS API] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to get locations" },
      { status: 500 }
    );
  }
}
