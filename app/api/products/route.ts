import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "../modules/products/services/product.service";
import { verifyToken } from "../modules/auth/middlewares/next-auth-middleware";
import { parseFiles, validateFiles } from "@/lib/multer";
import { uploadProductImagesToLocal, validateImageFilesForLocal } from "@/lib/local-file-upload";
import mongoose from "mongoose";

// Force dynamic rendering for this route
// product get and post requests


export const dynamic = 'force-dynamic';

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
      formData = JSON.parse(fields.formData || '{}');
    } catch (error) {
      return NextResponse.json({ error: "Invalid form data format" }, { status: 400 });
    }
    
    // Extract form fields
    const {
      title,
      description,
      price,
      category,
      subCategory = '',
      condition,
      negotiable = true,
      showPhoneNumber = true,
      titleImageIndex = 0,
      location = {},
      contactInfo = {},
      tags = [],
      specifications = {},
    } = formData;

    // Validate required fields
    if (!title || !description || !price || !category || !location?.city) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price, category, location.city" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
    }

    if (typeof category !== 'string') {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
    }
    
    // Validate image files
    const validation = validateImageFilesForLocal(imageFiles);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: "Image validation failed", 
        details: validation.errors 
      }, { status: 400 });
    }
    
    console.log(`[PRODUCTS API] Processing ${imageFiles.length} images`);
    
    // Generate product ID for file naming
    const productId = new mongoose.Types.ObjectId().toString();
    
    // Upload images to local storage
    const imagePaths = await uploadProductImagesToLocal(
      imageFiles,
      category,
      productId,
      title
    );

    // Validate images
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    // Validate title image index
    if (titleImageIndex < 0 || titleImageIndex >= imagePaths.length) {
      return NextResponse.json({ error: "Invalid title image index" }, { status: 400 });
    }

    // Create product
    if (!authResult.userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }
    const product = await productService.createProduct(authResult.userId, {
      title,
      description,
      price,
      category,
      subCategory,
      condition,
      images: imagePaths, // Only store string URLs
      titleImageIndex,
      location,
      contactInfo: { ...contactInfo, phone: showPhoneNumber ? contactInfo.phone : undefined },
      tags,
      specifications,
      showPhoneNumber,
    });

    console.log("[PRODUCTS API] Product created successfully:", product._id);

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          condition: product.condition,
          images: product.images,
          status: product.status,
          createdAt: product.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PRODUCTS API] Create product error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[PRODUCTS API] Getting products");

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: any = {};
    if (searchParams.get("category")) filters.category = searchParams.get("category");
    if (searchParams.get("subCategory")) filters.subCategory = searchParams.get("subCategory");
    if (searchParams.get("minPrice")) filters.minPrice = Number(searchParams.get("minPrice"));
    if (searchParams.get("maxPrice")) filters.maxPrice = Number(searchParams.get("maxPrice"));
    if (searchParams.get("condition")) filters.condition = searchParams.get("condition")?.split(",");
    if (searchParams.get("search")) filters.search = searchParams.get("search");
    if (searchParams.get("seller")) filters.seller = searchParams.get("seller");
    if (searchParams.get("status")) filters.status = searchParams.get("status");
    if (searchParams.get("tags")) filters.tags = { $all: searchParams.get("tags")?.split(",") };
    if (searchParams.get("customField")) {
      const [fieldName, value] = searchParams.get("customField")?.split(":") || [];
      if (fieldName && value) filters.customFields = { $elemMatch: { fieldName, value } };
    }

    // Location filters
    if (searchParams.get("city") || searchParams.get("state") || searchParams.get("country")) {
      filters.location = {};
      if (searchParams.get("city")) filters.location.city = searchParams.get("city");
      if (searchParams.get("state")) filters.location.state = searchParams.get("state");
      if (searchParams.get("country")) filters.location.country = searchParams.get("country");
    }

    // Parse sort options
    const sortOptions: any = {};
    const sortBy = searchParams.get("sortBy");
    if (sortBy) {
      sortOptions[sortBy === "price" ? "price" : sortBy] = 
        searchParams.get("sortOrder") === "desc" ? -1 : 1;
    } else {
      sortOptions.featured = -1;
      sortOptions.added_at = -1;
    }

    // Parse pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await productService.getProducts(filters, sortOptions, { page, limit });

    console.log(`[PRODUCTS API] Returning ${result.products.length} products`);

    return NextResponse.json({
      message: "Products retrieved successfully",
      products: result.products,
      total: result.total,
      page: result.currentPage,
      totalPages: result.pages,
    });
  } catch (error: any) {
    console.error("[PRODUCTS API] Get products error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to get products" }, { status: 500 });
  }
}