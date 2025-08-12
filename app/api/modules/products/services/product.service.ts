import { Product, type IProduct } from "../models/product.model";
import { User } from "../../auth/models/user.model";
import {
  BaseService,
  type PaginationOptions,
  type SortOptions,
} from "../../shared/services/base.service";
import mongoose from "mongoose";
import slugify from "slugify";

export interface Price {
  amount: number;
  currency: string;
  negotiable: boolean;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: Price;
  category_id: string;
  subcategory_id: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  images: string[];
  titleImageIndex: number;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  tags?: string[];
  specifications?: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    size?: string;
    weight?: string;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  negotiable?: boolean;
  showPhoneNumber?: boolean;
  delivery?: {
    available: boolean;
    cost?: number;
    methods: ("pickup" | "delivery" | "shipping")[];
  };
  featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: "active" | "sold" | "inactive" | "pending";
  featured?: boolean;
}

export interface ProductFilters {
  category?: string;
  category_id?: string | mongoose.Types.ObjectId;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  search?: string;
  seller?: string;
  status?: string;
  negotiable?: boolean;
  featured?: boolean;
}

export interface ProductSortOptions extends SortOptions {
  sortBy?: "createdAt" | "price" | "views" | "title" | "updatedAt";
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
      const product = await this.create({
        ...productData,
        category_id: new mongoose.Types.ObjectId(productData.category_id),
        subcategory_id: productData.subcategory_id
          ? new mongoose.Types.ObjectId(productData.subcategory_id)
          : undefined,
        slug,
        seller: this.createObjectId(sellerId),
        status: "active",
        views: 0,
        favorites: [],
        featured: productData.featured ?? false,
      });

      // Update seller statistics
      await User.findByIdAndUpdate(sellerId, {
        $inc: {
          "statistics.totalListings": 1,
          "statistics.activeListings": 1,
        },
      });

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
      const product = await this.findById(idStr, "seller");
      if (!product) {
        return null;
      }
      // Increment views if requested
      if (incrementViews) {
        await this.updateById(idStr, { $inc: { views: 1 } });
        await User.findByIdAndUpdate(product.seller._id, {
          $inc: { "statistics.totalViews": 1 },
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

      const product = await this.findOne({ slug }, "seller");

      if (!product) {
        return null;
      }

      // Increment views if requested
      if (incrementViews) {
        await this.updateById(product._id.toString(), { $inc: { views: 1 } });
        await User.findByIdAndUpdate(product.seller._id, {
          $inc: { "statistics.totalViews": 1 },
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

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        queryFilters.price = {};
        if (filters.minPrice !== undefined)
          queryFilters.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
          queryFilters.price.$lte = filters.maxPrice;
      }

      if (filters.condition && filters.condition.length > 0) {
        queryFilters.condition = { $in: filters.condition };
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

      if (filters.seller) {
        queryFilters.seller = this.createObjectId(filters.seller);
      }

      if (filters.status) {
        queryFilters.status = filters.status;
      }

      if (filters.negotiable !== undefined) {
        queryFilters.negotiable = filters.negotiable;
      }

      if (filters.featured !== undefined) {
        queryFilters.featured = filters.featured;
      }

      if (filters.search) {
        queryFilters.$text = { $search: filters.search };
      }

      // Use base service find method
      const result = await this.find(
        queryFilters,
        pagination,
        sortOptions,
        "seller"
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
    pagination: PaginationOptions = {}
  ): Promise<{
    products: IProduct[];
    total: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    return this.getSellerProducts(userId, status, pagination);
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
        seller: this.createObjectId(sellerId),
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
          await User.findByIdAndUpdate(sellerId, { $inc: statusChanges });
        }
      }

      // Update product using base service
      const updatedProduct = await this.updateById(productId, {
        $set: updateData,
      });

      // Populate seller information
      if (updatedProduct) {
        await updatedProduct.populate(
          "seller",
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
        seller: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to delete it"
        );
      }

      // Delete product using base service
      await this.deleteById(productId);

      // Update seller statistics
      const statisticsUpdate: any = { "statistics.totalListings": -1 };
      if (product.status === "active") {
        statisticsUpdate["statistics.activeListings"] = -1;
      }
      if (product.status === "sold") {
        statisticsUpdate["statistics.soldItems"] = -1;
      }

      await User.findByIdAndUpdate(sellerId, { $inc: statisticsUpdate });

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
      const isFavorite = product.favorites.includes(userObjectId);

      if (isFavorite) {
        // Remove from favorites
        await this.updateById(productId, {
          $pull: { favorites: userObjectId },
        });
      } else {
        // Add to favorites
        await this.updateById(productId, {
          $addToSet: { favorites: userObjectId },
        });
      }

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
        { favorites: userObjectId, status: "active" },
        pagination,
        { sortBy: "createdAt", sortOrder: "desc" },
        "seller"
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
      console.log("[PRODUCT SERVICE] Getting seller products:", sellerId);

      const queryFilters: any = { seller: this.createObjectId(sellerId) };
      if (status) {
        queryFilters.status = status;
      }

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

      let queryFilters: any = {
        ...filters,
        status: "active",
      };
      if (searchTerm && searchTerm.trim() !== "") {
        queryFilters.$text = { $search: searchTerm };
      }

      const result = await this.find(
        queryFilters,
        pagination,
        {
          ...sortOptions,
          sortBy: sortOptions.sortBy || (searchTerm ? "score" : "createdAt"),
        },
        "seller"
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
        { sortBy: "createdAt", sortOrder: "desc" },
        "seller"
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
        "seller"
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
        "seller"
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
        seller: this.createObjectId(sellerId),
      });
      if (!product) {
        throw new Error(
          "Product not found or you don't have permission to update it"
        );
      }

      const updatedProduct = await this.updateById(productId, {
        status: "sold",
      });

      // Update seller statistics
      await User.findByIdAndUpdate(sellerId, {
        $inc: {
          "statistics.activeListings": -1,
          "statistics.soldItems": 1,
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
        seller: this.createObjectId(sellerId),
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
        { sortBy: "createdAt", sortOrder: "desc" },
        "seller"
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
        "seller"
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
        { sortBy: "createdAt", sortOrder: "desc" },
        "seller"
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
        "seller"
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
        { condition, status: "active" },
        pagination,
        sortOptions,
        "seller"
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
}
