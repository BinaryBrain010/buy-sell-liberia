import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../modules/products/services/product.service";
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware";
import { parseFiles, validateFiles } from "@/lib/multer";
import {
  uploadProductImagesToLocal,
  validateImageFilesForLocal,
} from "@/lib/local-file-upload";
import { SettingsService } from "../modules/shared/services/settings.service";
import Category from "../../../models/Category";
import UserSubscription from "../../../models/UserSubscription";
import Product from "../../../models/Product";
import mongoose from "mongoose";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const productService = new ProductService();

export async function POST(request: NextRequest) {
  try {
    console.log("[PRODUCTS API] Creating new product");

    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse files and fields using multer
    const { files: imageFiles, fields } = await parseFiles(request);

    // Parse form data from JSON string
    let formData;
    try {
      formData = JSON.parse(fields.formData || "{}");
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid form data format" },
        { status: 400 }
      );
    }

    // Extract form fields
    const {
      title,
      description,
      price: priceField,
      category_id,
      subcategory_id = "",
      condition,
      negotiable,
      showPhoneNumber,
      titleImageIndex = 0,
      location = {},
      contactInfo = {},
      tags = [],
      specifications = {},
    } = formData;

    // Get platform currency from settings
    const settings = await SettingsService.getAllSettings();
    const platformCurrency = settings.platformCurrency;

    // Handle price field - it can be either a number or an object
    let amount: number;
    let currency: string = platformCurrency;

    if (typeof priceField === "number") {
      amount = priceField;
    } else if (
      priceField &&
      typeof priceField === "object" &&
      "amount" in priceField
    ) {
      amount = priceField.amount;
      currency = priceField.currency || platformCurrency;
    } else {
      return NextResponse.json(
        { error: "Invalid price format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      amount == null ||
      !category_id ||
      !location?.city
    ) {
      // Enforce paid category requirements: if active, block publishing until payment
      if (settings.isPaidCategoryActive) {
        const cat = await Category.findById(category_id).select(
          "isPaidCategory pricePerListing"
        );
        if (cat && cat.isPaidCategory && (cat.pricePerListing ?? 0) > 0) {
          return NextResponse.json(
            {
              error: "This category requires a payment per listing.",
              paymentRequired: true,
              feature: "paid_category",
              amount: Number(cat.pricePerListing),
              currency: "USD",
            },
            { status: 402 }
          );
        }
      }
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, price, category_id, location.city",
        },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: "Price must be positive" },
        { status: 400 }
      );
    }

    if (typeof category_id !== "string") {
      return NextResponse.json(
        { error: "Valid category_id is required" },
        { status: 400 }
      );
    }

    // Validate image files
    const validation = validateImageFilesForLocal(imageFiles);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Image validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log(`[PRODUCTS API] Processing ${imageFiles.length} images`);

    // Generate product ID for file naming
    const productId = new mongoose.Types.ObjectId().toString();

    // Upload images to local storage
    const imagePaths = await uploadProductImagesToLocal(
      imageFiles,
      category_id,
      productId,
      title
    );

    // Validate images
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Validate title image index
    if (titleImageIndex < 0 || titleImageIndex >= imagePaths.length) {
      return NextResponse.json(
        { error: "Invalid title image index" },
        { status: 400 }
      );
    }

    if (!authResult.userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Check subscription limits before creating product
    const userId = authResult.userId;
    const subscription = await (UserSubscription as any).findActiveByUser(
      new mongoose.Types.ObjectId(userId)
    );

    if (subscription) {
      // User has active subscription - check limits
      if (!subscription.canPostAd()) {
        return NextResponse.json(
          {
            error: `You have reached your ad limit for the current subscription period. You have used ${
              subscription.adsUsed
            } out of ${
              subscription.planType === "basic"
                ? 20
                : subscription.planType === "pro"
                ? 60
                : "unlimited"
            } ads.`,
            subscriptionInfo: {
              planType: subscription.planType,
              adsUsed: subscription.adsUsed,
              remainingAds: subscription.getRemainingAds(),
              canUpgrade: subscription.planType !== "vip",
            },
          },
          { status: 403 }
        );
      }
    } else {
      // User has no subscription - check default limit of 5 ads per month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const adsThisMonth = await Product.countDocuments({
        user_id: userId,
        created_at: { $gte: currentMonth, $lt: nextMonth },
        status: { $ne: "removed" },
      });

      if (adsThisMonth >= 5) {
        return NextResponse.json(
          {
            error:
              "You have reached the limit of 5 ads per month. Please subscribe to a plan to post more ads.",
            subscriptionInfo: {
              adsUsed: adsThisMonth,
              maxAds: 5,
              remainingAds: 0,
              canUpgrade: true,
            },
          },
          { status: 403 }
        );
      }
    }

    // Construct full price object with negotiable inside
    const price = {
      amount,
      currency: currency as "USD" | "LRD" | "EUR" | "GBP", // Use dynamic currency from settings
      negotiable: negotiable ?? true, // Fallback to true if undefined
    };

    // Transform imagePaths to the expected format
    const images = imagePaths.map((url, index) => ({
      url,
      alt: `${title} - Image ${index + 1}`,
      isPrimary: index === titleImageIndex,
      order: index,
    }));

    // Create product
    const product = await productService.createProduct(authResult.userId, {
      title,
      description,
      price,
      category_id,
      subcategory_id,
      condition,
      images,
      location,
      contact: {
        ...contactInfo,
        phone: showPhoneNumber ? contactInfo.phone : undefined,
      },
      tags,
      customFields: specifications
        ? Object.entries(specifications).map(([fieldName, value]) => ({
            fieldName,
            value,
          }))
        : undefined,
    } as any); // Using 'as any' to bypass TypeScript interface limitations

    console.log("[PRODUCTS API] Product created successfully:", product._id);

    // Increment subscription usage if user has active subscription
    if (subscription) {
      await subscription.incrementAdUsage();
    }

    // Populate user information for the response
    const populatedProduct = await product.populate(
      "user_id",
      "fullName username email profile.avatar profile.location"
    );

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          id: populatedProduct._id,
          title: populatedProduct.title,
          description: populatedProduct.description,
          price: populatedProduct.price,
          category_id: populatedProduct.category_id,
          subcategory_id: populatedProduct.subcategory_id,
          condition: populatedProduct.details.condition,
          images: populatedProduct.images,
          status: populatedProduct.status,
          createdAt: populatedProduct.created_at,
          featured: (populatedProduct as any).featured ?? false,
          user: populatedProduct.user_id, // Include populated user object
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PRODUCTS API] Create product error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[PRODUCTS API] Getting products");

    // Ensure database connection (in case this endpoint hit before any other)
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("[PRODUCTS API] MongoDB connected for GET");
      }
    } catch (connErr: any) {
      console.error("[PRODUCTS API] DB connection error:", connErr?.message);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: any = {};
    const categoryIdParam = searchParams.get("category_id");
    if (categoryIdParam) {
      if (!mongoose.Types.ObjectId.isValid(categoryIdParam)) {
        return NextResponse.json(
          {
            message: "Invalid category_id",
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
          },
          { status: 200 }
        );
      }
      filters.category_id = new mongoose.Types.ObjectId(categoryIdParam);
    }
    if (searchParams.get("subcategory_id"))
      filters.subcategory_id = searchParams.get("subcategory_id");
    if (searchParams.get("minPrice")) {
      const v = Number(searchParams.get("minPrice"));
      if (!isNaN(v) && isFinite(v)) filters.minPrice = v;
    }
    if (searchParams.get("maxPrice")) {
      const v = Number(searchParams.get("maxPrice"));
      if (!isNaN(v) && isFinite(v)) filters.maxPrice = v;
    }
    if (searchParams.get("condition")) {
      const cond =
        searchParams.get("condition")?.split(",").filter(Boolean) || [];
      if (cond.length) filters.condition = cond;
    }
    if (searchParams.get("search")) {
      const search = searchParams.get("search") as string;
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (searchParams.get("seller")) filters.seller = searchParams.get("seller");
    if (searchParams.get("status")) filters.status = searchParams.get("status");
    if (searchParams.get("tags"))
      filters.tags = { $all: searchParams.get("tags")?.split(",") };
    if (searchParams.get("customField")) {
      const [fieldName, value] =
        searchParams.get("customField")?.split(":") || [];
      if (fieldName && value)
        filters.customFields = { $elemMatch: { fieldName, value } };
    }

    // Featured-only filter
    const featuredOnly = searchParams.get("featuredOnly");
    const featuredParam = searchParams.get("featured");
    if (featuredOnly === "true" || featuredParam === "true") {
      filters.featured = true;
    }

    // Location filters
    if (
      searchParams.get("city") ||
      searchParams.get("state") ||
      searchParams.get("country")
    ) {
      filters.location = {};
      if (searchParams.get("city"))
        filters.location.city = searchParams.get("city");
      if (searchParams.get("state"))
        filters.location.state = searchParams.get("state");
      if (searchParams.get("country"))
        filters.location.country = searchParams.get("country");
    }

    // Parse sort options
    const sortOptions: any = {};
    const sortBy = searchParams.get("sortBy");
    if (sortBy) {
      const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;
      if (sortBy === "price") {
        // sort against nested price.amount field
        sortOptions["price.amount"] = sortOrder;
      } else {
        sortOptions[sortBy] = sortOrder;
      }
    } else {
      // Default sort: featured first, then by added_at (bumped products will appear first)
      sortOptions.featured = -1;
      sortOptions.added_at = -1;
    }

    // Parse pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    console.log("[PRODUCTS API] Filters:", JSON.stringify(filters));
    console.log("[PRODUCTS API] Sort:", sortOptions, "Pagination:", {
      page,
      limit,
    });

    const result = await productService.getProducts(filters, sortOptions, {
      page,
      limit,
    });

    console.log(`[PRODUCTS API] Returning ${result.products.length} products`);

    // Populate user information for all products
    const productsWithUsers = await Promise.all(
      result.products.map(async (product) => {
        const populatedProduct = await product.populate(
          "user_id",
          "fullName username email profile.avatar profile.location profile.verificationStatus verificationPaidUntil"
        );
        const obj = populatedProduct.toObject();
        return {
          ...obj,
          // Expose condition at top-level for frontend convenience (backwards compatible)
          condition: obj.details?.condition || undefined,
          user: populatedProduct.user_id, // Include populated user object
        };
      })
    );

    const res = NextResponse.json({
      message: "Products retrieved successfully",
      products: productsWithUsers,
      total: result.total,
      page: result.currentPage,
      totalPages: result.pages,
    });
    // Avoid caching so badges and dynamic states are always current
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (error: any) {
    console.error(
      "[PRODUCTS API] Get products error:",
      error?.message,
      error?.stack
    );
    return NextResponse.json(
      { error: error?.message || "Failed to get products" },
      { status: 500 }
    );
  }
}
