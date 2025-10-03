import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/Product";
import mongoose from "mongoose";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Define the PaginationOptions type
interface PaginationOptions {
  page: number;
  limit: number;
}

// Define the response type for getProductsByLocation
interface LocationProductsResponse {
  products: any[];
  total: number;
  currentPage: number;
  pages: number;
}

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);

    // Parse location parameters
    const city = searchParams.get("city") || undefined;
    const state = searchParams.get("state") || undefined;
    const country = searchParams.get("country") || undefined;

    // Parse pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Build query filters - support both old and new schema
    const queryFilters: any = {};

    // Handle location filters with regex for partial matching
    if (city) {
      queryFilters["location.city"] = new RegExp(city, "i");
    }
    if (state) {
      queryFilters["location.state"] = new RegExp(state, "i");
    }
    if (country) {
      queryFilters["location.country"] = new RegExp(country, "i");
    }

    // Handle status - support both old and new schema
    const status = searchParams.get("status") || "active";
    queryFilters.status = status;

    // Build sort options
    const sortOptions: any = {};
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;
    
    // Map sort fields to support both schemas
    let sortField = sortBy;
    if (sortBy === "createdAt") {
      // Try new schema first, fallback to old
      sortField = "created_at";
    } else if (sortBy === "updatedAt") {
      sortField = "updated_at";
    }
    
    sortOptions[sortField] = sortOrder;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(queryFilters)
        .populate("user_id", "fullName username email")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(queryFilters)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      message: "Products by location retrieved successfully",
      products,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      location: {
        city: city || null,
        state: state || null,
        country: country || null,
      },
      query: queryFilters, // Debug info
    });
  } catch (error: any) {
    console.error("[PRODUCTS LOCATION API] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to get products by location" },
      { status: 500 }
    );
  }
}
