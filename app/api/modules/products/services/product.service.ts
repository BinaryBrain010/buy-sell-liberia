import Product, { type IProduct } from "@/models/Product";
import User from "@/models/User";
import {
  BaseService,
  type PaginationOptions,
  type SortOptions,
} from "../../shared/services/base.service";
import mongoose from "mongoose";
import slugify from "slugify";

// Use the Price interface from the main Product model
import { IPrice } from "@/models/Product";

export interface CreateProductData {
  title: string;
  description: string;
  price: IPrice;
  category_id: string;
  subcategory_id: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
    order?: number;
  }>;
  location: {
    city: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    preferredMethod?: "phone" | "whatsapp" | "email";
  };
  tags?: string[];
  customFields?: Array<{
    fieldName: string;
    value: any;
  }>;
  featured?: boolean;
  status?: "active" | "sold" | "expired" | "removed" | "pending";
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: "active" | "sold" | "expired" | "removed" | "pending";
  featured?: boolean;
}

export interface ProductFilters {
  category?: string;
  category_id?: string | mongoose.Types.ObjectId;
  subcategory_id?: string | mongoose.Types.ObjectId;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  locationSearch?: string; // For regex search across location fields
  search?: string;
  seller?: string;
  status?: string;
  negotiable?: boolean;
  featured?: boolean;
}

export interface ProductSortOptions extends SortOptions {
  sortBy?: "createdAt" | "added_at" | "price" | "views" | "title" | "updatedAt";
}

export class ProductService extends BaseService<IProduct> {
  constructor() {
    super(Product, "PRODUCT");
  }

  /**
   * Create a new product with a unique slug
   */
  async createProduct(
    sellerId: string,
    productData: CreateProductData
  ): Promise<IProduct> {
    try {
      console.log("[PRODUCT SERVICE] Creating product for seller:", sellerId);
      await this.ensureConnection();

      // Verify seller exists
      const seller = await User.findById(sellerId);
      if (!seller) {
        throw new Error("Seller not found");
      }

      // Generate unique slug
      let slug = slugify(productData.title, { lower: true, strict: true });
      let counter = 1;
      while (await this.findOne({ slug })) {
        slug = `${slugify(productData.title, {
          lower: true,
          strict: true,
        })}-${counter}`;
        counter++;
      }

      // Convert category_id and subcategory_id to ObjectId
      // Ensure condition is stored under details.condition (schema expects details)
      const detailsPayload = {
        ...(productData as any).details,
        // Only set condition if present
        ...(productData.condition ? { condition: productData.condition } : {}),
      };

      const payloadToCreate: any = {
        // copy all fields except condition (we've moved it into details)
        ...productData,
        category_id: new mongoose.Types.ObjectId(productData.category_id),
        subcategory_id: productData.subcategory_id
          ? new mongoose.Types.ObjectId(productData.subcategory_id)
          : undefined,
        slug,
        user_id: this.createObjectId(sellerId),
        status: productData.status || "active",
        views: 0,
        featured: productData.featured ?? false,
        details: detailsPayload,
      };

      // Remove top-level condition from payload to avoid stray field
      if (payloadToCreate.condition) delete payloadToCreate.condition;

      const product = await this.create(payloadToCreate);

      // Update seller: push listing entry and update statistics in one atomic op
      try {
        const isActive = product.status === "active";
        await User.findByIdAndUpdate(sellerId, {
          $push: {
            listedProducts: {
              product_id: product._id,
              listed_at: new Date(),
              status: product.status,
            },
          },
          $inc: {
            "activity.totalListings": 1,
            ...(isActive ? { "activity.activeListings": 1 } : {}),
          },
        });
      } catch (uErr) {
        // Log and continue - product is created but user's list update failed
        console.error(
          "[PRODUCT SERVICE] Failed to update seller listedProducts:",
          uErr
        );
      }

      // Populate seller information on the product for convenient responses
      try {
        await product.populate(
          "user_id",
          "fullName username email profile.avatar profile.location"
        );
      } catch (pErr) {
        // Non-fatal: log and continue
        console.error(
          "[PRODUCT SERVICE] Failed to populate product.user_id:",
          pErr
        );
      }

      console.log(
        "[PRODUCT SERVICE] Product created successfully:",
        product._id
      );
      return product;
    } catch (error: any) {
      this.handleError(error, "create");
    }
  }

  /**
   * Get product by ID with optional view increment
   */
  async getProductById(
    productId: string,
    incrementViews = false
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Getting product by ID:", productId);
      // Always convert to ObjectId if needed
      const objectId =
        typeof productId === "string" && productId.length === 24
          ? new mongoose.Types.ObjectId(productId)
          : productId;
      const idStr =
        typeof objectId === "string" ? objectId : objectId.toString();
      const product = await this.findById(idStr, "user_id");
      if (!product) {
        return null;
      }
      // Increment views if requested
      if (incrementViews) {
        await this.updateById(idStr, { $inc: { views: 1 } });
        await User.findByIdAndUpdate(product.user_id, {
          $inc: { "activity.totalViews": 1 },
        });
      }
      return product;
    } catch (error: any) {
      this.handleError(error, "get by ID");
    }
  }

  /**
   * Get product by slug with optional view increment
   */
  async getProductBySlug(
    slug: string,
    incrementViews = false
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Getting product by slug:", slug);

      const product = await this.findOne({ slug }, "user_id");

      if (!product) {
        return null;
      }

      // Increment views if requested
      if (incrementViews) {
        await this.updateById(
          (product._id as mongoose.Types.ObjectId).toString(),
          { $inc: { views: 1 } }
        );
        await User.findByIdAndUpdate(product.user_id, {
          $inc: { "activity.totalViews": 1 },
        });
      }

      return product;
    } catch (error: any) {
      this.handleError(error, "get by slug");
    }
  }

  /**
   * Get products with advanced filtering and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    sortOptions: ProductSortOptions = {},
    pagination: PaginationOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting products with filters:", filters);

      // Build query filters
      const queryFilters: any = { status: "active" };

      if (filters.category_id) {
        queryFilters.category_id = filters.category_id;
      }
      if (filters.subcategory_id) {
        queryFilters.subcategory_id = filters.subcategory_id;
      }

      // Price range (use nested path price.amount)
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const priceAmount: any = queryFilters["price.amount"] || {};
        if (filters.minPrice !== undefined) priceAmount.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) priceAmount.$lte = filters.maxPrice;
        queryFilters["price.amount"] = priceAmount;
      }

      if (filters.condition && filters.condition.length > 0) {
        // condition is stored under details.condition in the Product schema
        queryFilters["details.condition"] = { $in: filters.condition };
      }

      if (filters.location) {
        if (filters.location.city)
          queryFilters["location.city"] = new RegExp(
            filters.location.city,
            "i"
          );
        if (filters.location.state)
          queryFilters["location.state"] = new RegExp(
            filters.location.state,
            "i"
          );
        if (filters.location.country)
          queryFilters["location.country"] = filters.location.country;
      }

      // Handle location search with regex across all location fields
      if (filters.locationSearch) {
        const locationRegex = new RegExp(filters.locationSearch, "i");
        // If there's already an $or clause, we need to combine them
        if (queryFilters.$or) {
          queryFilters.$and = [
            { $or: queryFilters.$or },
            {
              $or: [
                { "location.city": locationRegex },
                { "location.state": locationRegex },
                { "location.country": locationRegex },
              ],
            },
          ];
          delete queryFilters.$or;
        } else {
          queryFilters.$or = [
            { "location.city": locationRegex },
            { "location.state": locationRegex },
            { "location.country": locationRegex },
          ];
        }
      }

      if (filters.seller) {
        queryFilters.user_id = this.createObjectId(filters.seller);
      }

      if (filters.status) {
        queryFilters.status = filters.status;
      }

      if (filters.negotiable !== undefined) {
        queryFilters["price.negotiable"] = filters.negotiable;
      }

      if (filters.featured !== undefined) {
        queryFilters.featured = filters.featured;
      }

      if (filters.search) {
        // Prefer $text if index present; fallback to regex OR
        queryFilters.$text = { $search: filters.search };
      }
      // Preserve any pre-built $or (e.g., regex search from API layer) if provided
      if ((filters as any).$or) {
        (queryFilters as any).$or = (filters as any).$or;
      }

      // Use base service find method
      const result = await this.find(
        queryFilters,
        pagination,
        sortOptions,
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get products");
    }
  }

  /**
   * Get products by user (alias for getSellerProducts)
   */
  async getProductsByUser(
    userId: string,
    status?: string,
    pagination: PaginationOptions = {},
    additionalFilters: any = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    return this.getSellerProducts(
      userId,
      status,
      pagination,
      additionalFilters
    );
  }

  /**
   * Update product with ownership verification
   */
  async updateProduct(
    productId: string,
    sellerId: string,
    updateData: UpdateProductData
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Updating product:", productId);

      // Find product and verify ownership
      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to update it"
        );
      }

      // Handle status change for statistics
      if (updateData.status && updateData.status !== product.status) {
        const statusChanges: any = {};

        if (product.status === "active" && updateData.status !== "active") {
          statusChanges["statistics.activeListings"] = -1;
        } else if (
          product.status !== "active" &&
          updateData.status === "active"
        ) {
          statusChanges["statistics.activeListings"] = 1;
        }

        if (updateData.status === "sold") {
          statusChanges["statistics.soldItems"] = 1;
        }

        if (Object.keys(statusChanges).length > 0) {
          // translate statistics.* keys to activity.*
          const incUpdate: any = {};
          Object.entries(statusChanges).forEach(([k, v]) => {
            const newKey = k.replace(/^statistics\./, "activity.");
            incUpdate[newKey] = v;
          });
          await User.findByIdAndUpdate(sellerId, { $inc: incUpdate });
        }
        // Also update the listedProducts entry for the user so admin / profile sees correct status
        try {
          await User.updateOne(
            { _id: sellerId, "listedProducts.product_id": product._id },
            { $set: { "listedProducts.$.status": updateData.status } }
          );
        } catch (lpErr) {
          console.error(
            "[PRODUCT SERVICE] Failed to sync listedProducts status:",
            lpErr
          );
        }
      }

      // If condition provided in updateData, move it into details.condition
      const updatePayload: any = { ...updateData };
      if ((updatePayload as any).condition) {
        updatePayload.details = {
          ...(product.details as any),
          ...(updatePayload.details || {}),
          condition: updatePayload.condition,
        };
        delete updatePayload.condition;
      }

      // Update product using base service
      const updatedProduct = await this.updateById(productId, {
        $set: updatePayload,
      });

      // Populate seller information
      if (updatedProduct) {
        await updatedProduct.populate(
          "user_id",
          "fullName username email profile.avatar profile.location"
        );
      }

      console.log("[PRODUCT SERVICE] Product updated successfully");
      return updatedProduct;
    } catch (error: any) {
      this.handleError(error, "update");
    }
  }

  /**
   * Delete product with ownership verification
   */
  async deleteProduct(productId: string, sellerId: string): Promise<void> {
    try {
      console.log("[PRODUCT SERVICE] Deleting product:", productId);

      // Find product and verify ownership
      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to delete it"
        );
      }

      // Delete product using base service
      await this.deleteById(productId);

      // Update seller statistics
      const statisticsUpdate: any = { "activity.totalListings": -1 };
      if (product.status === "active") {
        statisticsUpdate["activity.activeListings"] = -1;
      }
      if (product.status === "sold") {
        statisticsUpdate["activity.soldItems"] = -1;
      }

      await User.findByIdAndUpdate(sellerId, { $inc: statisticsUpdate });

      // Remove the product entry from the user's listedProducts array
      try {
        await User.updateOne(
          { _id: sellerId },
          { $pull: { listedProducts: { product_id: product._id } } }
        );
      } catch (pullErr) {
        console.error(
          "[PRODUCT SERVICE] Failed to remove listedProducts entry:",
          pullErr
        );
      }

      console.log("[PRODUCT SERVICE] Product deleted successfully");
    } catch (error: any) {
      this.handleError(error, "delete");
    }
  }

  /**
   * Toggle favorite status for a product
   */
  async toggleFavorite(
    productId: string,
    userId: string
  ): Promise<{ isFavorite: boolean }> {
    try {
      console.log(
        "[PRODUCT SERVICE] Toggling favorite for product:",
        productId,
        "user:",
        userId
      );

      const product = await this.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const userObjectId = this.createObjectId(userId);
      const isFavorite = false; // favorites field doesn't exist in main model

      // TODO: Implement favorites functionality with main model
      // The main model doesn't have a favorites field, so this needs to be implemented differently

      console.log(
        `[PRODUCT SERVICE] Product ${
          isFavorite ? "removed from" : "added to"
        } favorites`
      );
      return { isFavorite: !isFavorite };
    } catch (error: any) {
      this.handleError(error, "toggle favorite");
    }
  }

  /**
   * Get user's favorite products
   */
  async getUserFavorites(
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting user favorites:", userId);

      const userObjectId = this.createObjectId(userId);
      const result = await this.find(
        { status: "active" }, // TODO: Implement favorites filtering
        pagination,
        { sortBy: "added_at", sortOrder: "desc" },
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get user favorites");
    }
  }

  /**
   * Get seller's products
   */
  async getSellerProducts(
    sellerId: string,
    status?: string,
    pagination: PaginationOptions = {},
    additionalFilters: any = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting seller products:", sellerId);

      const queryFilters: any = { user_id: this.createObjectId(sellerId) };
      if (status) {
        queryFilters.status = status;
      }

      // Apply additional filters (like location)
      Object.assign(queryFilters, additionalFilters);

      const result = await this.find(queryFilters, pagination, {
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get seller products");
    }
  }

  /**
   * Get product categories with counts
   */
  async getProductCategories(): Promise<
    Array<{ category: string; count: number }>
  > {
    try {
      console.log("[PRODUCT SERVICE] Getting product categories");

      const pipeline = [
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ];

      return await this.aggregate(pipeline);
    } catch (error: any) {
      this.handleError(error, "get product categories");
    }
  }

  /**
   * Search products with text search
   */
  async searchProducts(
    searchTerm: string,
    filters: ProductFilters = {},
    pagination: PaginationOptions = {},
    sortOptions: ProductSortOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Searching products:", searchTerm);

      // Normalize filters for IDs
      const queryFilters: any = { status: "active" };
      if (filters.category_id) {
        queryFilters.category_id =
          typeof filters.category_id === "string"
            ? new mongoose.Types.ObjectId(filters.category_id)
            : filters.category_id;
      }
      if (filters.subcategory_id) {
        queryFilters.subcategory_id =
          typeof filters.subcategory_id === "string"
            ? new mongoose.Types.ObjectId(filters.subcategory_id)
            : filters.subcategory_id;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        queryFilters["price.amount"] = {} as any;
        if (filters.minPrice !== undefined)
          queryFilters["price.amount"].$gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
          queryFilters["price.amount"].$lte = filters.maxPrice;
      }
      if (filters.condition && filters.condition.length) {
        queryFilters["details.condition"] = { $in: filters.condition };
      }

      // Handle location filters
      if (filters.location) {
        if (filters.location.city)
          queryFilters["location.city"] = new RegExp(
            filters.location.city,
            "i"
          );
        if (filters.location.state)
          queryFilters["location.state"] = new RegExp(
            filters.location.state,
            "i"
          );
        if (filters.location.country)
          queryFilters["location.country"] = filters.location.country;
      }

      // Handle location search with regex across all location fields
      if (filters.locationSearch) {
        const locationRegex = new RegExp(filters.locationSearch, "i");
        queryFilters.$or = [
          { "location.city": locationRegex },
          { "location.state": locationRegex },
          { "location.country": locationRegex },
        ];
      }

      if (filters.seller) {
        queryFilters.user_id = this.createObjectId(filters.seller);
      }
      if (filters.status) queryFilters.status = filters.status;
      if (typeof filters.negotiable === "boolean")
        queryFilters["price.negotiable"] = filters.negotiable;
      if (typeof filters.featured === "boolean")
        queryFilters.featured = filters.featured;

      const raw = (searchTerm || "").trim();
      if (raw) {
        // Token-based AND search with safe regexes
        const escapeRegExp = (input: string) =>
          input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const tokens = raw
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 1)
          .map(escapeRegExp);

        if (tokens.length) {
          const andClauses = tokens.map((t) => ({
            $or: [
              { title: new RegExp(`\\b${t}`, "i") },
              { description: new RegExp(`\\b${t}`, "i") },
              { tags: new RegExp(t, "i") },
            ],
          }));
          queryFilters.$and = andClauses;
        } else {
          // Fallback to text search if tokenization yields nothing
          queryFilters.$text = { $search: raw };
        }
      }

      const result = await this.find(
        queryFilters as any,
        pagination,
        {
          ...sortOptions,
          // When searching, default sort to relevance (score) or added_at for bumped products
          sortBy: sortOptions.sortBy || (raw ? "score" : "added_at"),
        },
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "search products");
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(pagination: PaginationOptions = {}): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting featured products");

      const result = await this.find(
        { featured: true, status: "active" },
        pagination,
        { sortBy: "added_at", sortOrder: "desc" },
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get featured products");
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    subCategory?: string,
    pagination: PaginationOptions = {},
    sortOptions: ProductSortOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log(
        "[PRODUCT SERVICE] Getting products by category:",
        category,
        subCategory
      );

      const queryFilters: any = { category, status: "active" };
      if (subCategory) {
        queryFilters.subCategory = subCategory;
      }

      const result = await this.find(
        queryFilters,
        pagination,
        sortOptions,
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get products by category");
    }
  }

  /**
   * Get products by location
   */
  async getProductsByLocation(
    city?: string,
    state?: string,
    country?: string,
    pagination: PaginationOptions = {},
    sortOptions: ProductSortOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting products by location:", {
        city,
        state,
        country,
      });

      const queryFilters: any = { status: "active" };

      if (city) queryFilters["location.city"] = new RegExp(city, "i");
      if (state) queryFilters["location.state"] = new RegExp(state, "i");
      if (country) queryFilters["location.country"] = country;

      const result = await this.find(
        queryFilters,
        pagination,
        sortOptions,
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get products by location");
    }
  }

  /**
   * Mark product as sold
   */
  async markAsSold(
    productId: string,
    sellerId: string
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Marking product as sold:", productId);

      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to update it"
        );
      }

      const updatedProduct = await this.updateById(productId, {
        status: "sold",
      });

      // Update seller activity counts
      await User.findByIdAndUpdate(sellerId, {
        $inc: {
          "activity.activeListings": -1,
          "activity.soldItems": 1,
        },
      });

      return updatedProduct;
    } catch (error: any) {
      this.handleError(error, "mark as sold");
    }
  }

  /**
   * Renew product (extend expiration)
   */
  async renewProduct(
    productId: string,
    sellerId: string
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Renewing product:", productId);

      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to update it"
        );
      }

      const newExpiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

      const updatedProduct = await this.updateById(productId, {
        status: "active",
        expiresAt: newExpiryDate,
      });

      return updatedProduct;
    } catch (error: any) {
      this.handleError(error, "renew product");
    }
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    soldProducts: number;
    expiredProducts: number;
    totalViews: number;
    averagePrice: number;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting product statistics");

      const pipeline = [
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            soldProducts: {
              $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] },
            },
            expiredProducts: {
              $sum: { $cond: [{ $lt: ["$expiresAt", new Date()] }, 1, 0] },
            },
            totalViews: { $sum: "$views" },
            averagePrice: { $avg: "$price" },
          },
        },
        {
          $project: {
            _id: 0,
            totalProducts: 1,
            activeProducts: 1,
            soldProducts: 1,
            expiredProducts: 1,
            totalViews: 1,
            averagePrice: { $round: ["$averagePrice", 2] },
          },
        },
      ];

      const result = await this.aggregate(pipeline);
      return (
        result[0] || {
          totalProducts: 0,
          activeProducts: 0,
          soldProducts: 0,
          expiredProducts: 0,
          totalViews: 0,
          averagePrice: 0,
        }
      );
    } catch (error: any) {
      this.handleError(error, "get product statistics");
    }
  }

  /**
   * Get recent products
   */
  async getRecentProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      console.log("[PRODUCT SERVICE] Getting recent products");

      const result = await this.find(
        { status: "active" },
        { page: 1, limit },
        { sortBy: "added_at", sortOrder: "desc" },
        "user_id"
      );

      return result.data;
    } catch (error: any) {
      this.handleError(error, "get recent products");
    }
  }

  /**
   * Get trending products (most viewed)
   */
  async getTrendingProducts(limit: number = 10): Promise<IProduct[]> {
    try {
      console.log("[PRODUCT SERVICE] Getting trending products");

      const result = await this.find(
        { status: "active" },
        { page: 1, limit },
        { sortBy: "views", sortOrder: "desc" },
        "user_id"
      );

      return result.data;
    } catch (error: any) {
      this.handleError(error, "get trending products");
    }
  }

  /**
   * Get similar products
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 6
  ): Promise<IProduct[]> {
    try {
      console.log("[PRODUCT SERVICE] Getting similar products for:", productId);

      const product = await this.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const result = await this.find(
        {
          _id: { $ne: productId },
          category_id: product.category_id,
          status: "active",
        },
        { page: 1, limit },
        { sortBy: "added_at", sortOrder: "desc" },
        "user_id"
      );

      return result.data;
    } catch (error: any) {
      this.handleError(error, "get similar products");
    }
  }

  /**
   * Bulk update products (admin function)
   */
  async bulkUpdateProducts(
    filters: ProductFilters,
    updateData: UpdateProductData
  ): Promise<{ modifiedCount: number }> {
    try {
      console.log("[PRODUCT SERVICE] Bulk updating products");

      const result = await this.updateMany(filters, { $set: updateData });
      return result;
    } catch (error: any) {
      this.handleError(error, "bulk update products");
    }
  }

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    pagination: PaginationOptions = {},
    sortOptions: ProductSortOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting products by price range:", {
        minPrice,
        maxPrice,
      });

      const result = await this.find(
        {
          status: "active",
          price: { $gte: minPrice, $lte: maxPrice },
        },
        pagination,
        sortOptions,
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get products by price range");
    }
  }

  /**
   * Get products by condition
   */
  async getProductsByCondition(
    condition: string,
    pagination: PaginationOptions = {},
    sortOptions: ProductSortOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      console.log(
        "[PRODUCT SERVICE] Getting products by condition:",
        condition
      );

      const result = await this.find(
        { "details.condition": condition, status: "active" },
        pagination,
        sortOptions,
        "user_id"
      );

      return {
        products: result.data,
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error: any) {
      this.handleError(error, "get products by condition");
    }
  }

  /**
   * Increment product views
   */
  async incrementViews(productId: string): Promise<IProduct | null> {
    try {
      await this.ensureConnection();
      const updatedProduct = await this.updateById(productId, {
        $inc: { views: 1 },
      });
      return updatedProduct;
    } catch (error: any) {
      this.handleError(error, "increment views");
    }
  }

  /**
   * Bump product to top of listings
   */
  async bumpProduct(
    productId: string,
    userId: string
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Bumping product:", productId);
      await this.ensureConnection();

      // Find product and verify ownership
      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(userId),
      });

      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to bump it"
        );
      }

      // Check if product has bump credits; if not, try consuming from user account-level bumpCount
      if (product.bumpCredits <= 0) {
        const user = await User.findById(userId);
        const available = Number((user as any)?.bumpCount ?? 0);
        if (!user || available <= 0) {
          throw new Error(
            "No bump credits available for this product or account"
          );
        }
        // consume one from user and then proceed with bump
        await User.findByIdAndUpdate(userId, { $inc: { bumpCount: -1 } });
        // Ensure the product has a consumable credit in-memory for bumpListing's check
        // This avoids a throw from model.bumpListing() when bumpCredits === 0
        product.bumpCredits = (product.bumpCredits || 0) + 1;
        const bumped = await product.bumpListing(this.createObjectId(userId));
        return bumped;
      }

      // Use product's own bump credit path
      const bumpedProduct = await product.bumpListing(
        this.createObjectId(userId)
      );

      return bumpedProduct;
    } catch (error: any) {
      this.handleError(error, "bump product");
    }
  }

  /**
   * Add bump credits to a product
   */
  async addBumpCredits(
    productId: string,
    userId: string,
    credits: number
  ): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Adding bump credits:", productId, credits);
      await this.ensureConnection();

      // Find product and verify ownership
      const product = await this.findOne({
        _id: productId,
        user_id: this.createObjectId(userId),
      });

      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to add credits"
        );
      }

      // Add credits using the model method
      const updatedProduct = await product.addBumpCredits(credits);

      return updatedProduct;
    } catch (error: any) {
      this.handleError(error, "add bump credits");
    }
  }
}
