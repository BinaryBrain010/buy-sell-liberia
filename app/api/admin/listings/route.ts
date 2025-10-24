import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import User from "../../../../models/User";
import Product from "../../../../models/Product";
import {
  createAdminAuditLogger,
  extractUserInfoFromPayload,
} from "../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    // Auth: Allow all admin/employee roles defined in AdminAuthService.isAllowedRole
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check (super_admin only):
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build product filter
    const productFilter: any = {};
    if (searchParams.get("status")) {
      productFilter.status = searchParams.get("status");
    }
    if (searchParams.get("category")) {
      productFilter.category_id = searchParams.get("category");
    }
    if (searchParams.get("location")) {
      productFilter["location.city"] = new RegExp(
        searchParams.get("location")!,
        "i"
      );
    }
    if (searchParams.get("priceMin") || searchParams.get("priceMax")) {
      productFilter["price.amount"] = {};
      if (searchParams.get("priceMin")) {
        productFilter["price.amount"].$gte = parseFloat(
          searchParams.get("priceMin")!
        );
      }
      if (searchParams.get("priceMax")) {
        productFilter["price.amount"].$lte = parseFloat(
          searchParams.get("priceMax")!
        );
      }
    }
    if (searchParams.get("dateFrom") || searchParams.get("dateTo")) {
      productFilter.added_at = {};
      if (searchParams.get("dateFrom")) {
        productFilter.added_at.$gte = new Date(searchParams.get("dateFrom")!);
      }
      if (searchParams.get("dateTo")) {
        productFilter.added_at.$lte = new Date(searchParams.get("dateTo")!);
      }
    }
    if (searchParams.get("condition")) {
      productFilter["details.condition"] = searchParams.get("condition");
    }

    // Find products with filters and pagination
    const products = await Product.find(productFilter)
      .skip(skip)
      .limit(limit)
      .sort({ added_at: -1 })
      .lean();

    // Get user IDs from products
    const userIds = products.map((product) => product.user_id);
    const users = await User.find(
      { _id: { $in: userIds } },
      "-password -passwordResetToken -emailVerificationToken -phoneVerificationToken"
    ).lean();
    const usersById = new Map(users.map((user) => [user._id.toString(), user]));

    // Group products by user
    const usersWithListings = users.map((user) => {
      const userId = user._id.toString();
      const userProducts = products.filter((product) => {
        const ownerId =
          typeof (product as any).user_id === "string"
            ? (product as any).user_id
            : (product as any).user_id?.toString?.();
        return ownerId === userId;
      });
      return {
        ...user,
        listings: userProducts,
      };
    });

    // Get total count for pagination
    const total = await Product.countDocuments(productFilter);

    // Ensure flat product list includes a top-level 'condition' for frontend compatibility
    const productsWithCondition = products.map((p: any) => ({
      ...p,
      condition: p.details?.condition || undefined,
    }));

    // Return both grouped and flat product list for admin convenience
    return NextResponse.json({
      success: true,
      users: usersWithListings,
      products: productsWithCondition, // flat list of all products matching the filter
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users with listings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch users with listings",
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint for admin actions
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    // Previous restrictive check (super_admin only):
    // if (!payload || typeof payload !== 'object' || payload.role !== 'super_admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }
    if (
      !payload ||
      typeof payload !== "object" ||
      !AdminAuthService.isAllowedRole((payload as any).role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      userId: adminUserId,
      role: adminRole,
      email: adminEmail,
      name: adminName,
    } = extractUserInfoFromPayload(payload);

    // Safely parse JSON body; also allow query params as fallback
    let body: any = undefined;
    try {
      body = await request.json();
    } catch {
      // ignore parse errors; may be no body
    }

    const url = new URL(request.url);
    const productId = body?.productId ?? url.searchParams.get("productId");
    const action = body?.action ?? url.searchParams.get("action");
    const reason = body?.reason ?? url.searchParams.get("reason") ?? undefined;

    if (!productId || !action) {
      return NextResponse.json(
        { error: "productId and action are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId to avoid CastError 500s
    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create audit logger
    const logger = createAdminAuditLogger(
      request,
      adminUserId,
      adminRole,
      adminEmail,
      adminName
    );

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousStatus = product.status;
    const previousFeatured = product.featured;
    // Normalize IDs to safe strings for logging
    const productOwner =
      typeof (product as any).user_id === "string"
        ? ((product as any).user_id as string)
        : (product as any).user_id?.toString?.() || "unknown";
    const productCategory = (product as any).category_id?.toString?.();
    const productSubcategory = (product as any).subcategory_id?.toString?.();

    switch (action) {
      case "approve":
        product.status = "active";
        // Log listing approval
        await logger.logListingOperation(
          OperationType.LISTING_APPROVE,
          productId,
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            newStatus: "active",
            productCategory: productCategory,
            productSubcategory: productSubcategory,
          }
        );
        break;
      case "reject":
        product.status = "removed";
        // Log listing rejection
        await logger.logListingOperation(
          OperationType.LISTING_REJECT,
          productId,
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            newStatus: "removed",
            productCategory: productCategory,
            productSubcategory: productSubcategory,
            ...(reason ? { reason } : {}),
          }
        );
        break;
      case "delete":
        // Log listing deletion before deleting
        await logger.logListingOperation(
          OperationType.LISTING_DELETE,
          productId,
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            productCategory: productCategory,
            productSubcategory: productSubcategory,
          }
        );
        await product.deleteOne();
        return NextResponse.json({ success: true, message: "Product deleted" });
      case "hide":
        product.status = "removed";
        // Log listing hide action
        await logger.logCustomOperation(
          ModuleType.LISTING_MANAGEMENT,
          OperationType.LISTING_REJECT,
          productId,
          "Product",
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            newStatus: "removed",
            action: "hide",
            productCategory: productCategory,
            productSubcategory: productSubcategory,
            ...(reason ? { reason } : {}),
          }
        );
        break;
      case "unhide":
        // If a listing was previously hidden (removed), allow admin to make it active again
        product.status = "active";
        await logger.logCustomOperation(
          ModuleType.LISTING_MANAGEMENT,
          OperationType.LISTING_APPROVE,
          productId,
          "Product",
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            newStatus: "active",
            action: "unhide",
            productCategory: productCategory,
            productSubcategory: productSubcategory,
            ...(reason ? { reason } : {}),
          }
        );
        break;
      case "markAsSold":
        product.status = "sold";
        // Log mark as sold action
        await logger.logCustomOperation(
          ModuleType.LISTING_MANAGEMENT,
          OperationType.LISTING_APPROVE,
          productId,
          "Product",
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousStatus,
            newStatus: "sold",
            action: "markAsSold",
            productCategory: productCategory,
            productSubcategory: productSubcategory,
          }
        );
        break;
      case "feature":
        product.featured = true;
        // Log listing feature action
        await logger.logListingOperation(
          OperationType.LISTING_FEATURE,
          productId,
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousFeatured,
            newFeatured: true,
            productCategory: productCategory,
            productSubcategory: productSubcategory,
          }
        );
        break;
      case "unfeature":
        product.featured = false;
        // Log listing unfeature action
        await logger.logListingOperation(
          OperationType.LISTING_UNFEATURE,
          productId,
          {
            adminUserId,
            productTitle: product.title,
            productOwner: productOwner,
            previousFeatured,
            newFeatured: false,
            productCategory: productCategory,
            productSubcategory: productSubcategory,
          }
        );
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    // Perform partial update without triggering full schema validation
    await product.save({ validateBeforeSave: false });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("PATCH /api/admin/listings failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// ...existing code...
// ...existing code...
