import { Product, type IProduct } from "../models/product.model"
import { User } from "../../auth/models/user.model"
import { connectDB } from "@/lib/mongoose"
import mongoose from "mongoose"

export interface CreateProductData {
  title: string
  description: string
  price: number
  category: string
  subCategory?: string
  condition: "new" | "like-new" | "good" | "fair" | "poor"
  images: string[]
  location: {
    city: string
    state: string
    country: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  tags?: string[]
  specifications?: {
    brand?: string
    model?: string
    year?: number
    color?: string
    size?: string
    weight?: string
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }
  negotiable?: boolean
  delivery?: {
    available: boolean
    cost?: number
    methods: ("pickup" | "delivery" | "shipping")[]
  }
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: "active" | "sold" | "inactive" | "pending"
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  location?: {
    city?: string
    state?: string
    country?: string
  }
  search?: string
  seller?: string
  status?: string
}

export interface ProductSortOptions {
  sortBy?: "createdAt" | "price" | "views" | "title"
  sortOrder?: "asc" | "desc"
}

export class ProductService {
  async createProduct(sellerId: string, productData: CreateProductData): Promise<IProduct> {
    try {
      console.log("[PRODUCT SERVICE] Creating product for seller:", sellerId)
      await connectDB()

      // Verify seller exists
      const seller = await User.findById(sellerId)
      if (!seller) {
        throw new Error("Seller not found")
      }

      // Create product
      const product = new Product({
        ...productData,
        seller: sellerId,
        status: "active",
        views: 0,
        favorites: [],
      })

      await product.save()

      // Update seller statistics
      await User.findByIdAndUpdate(sellerId, {
        $inc: {
          "statistics.totalListings": 1,
          "statistics.activeListings": 1,
        },
      })

      console.log("[PRODUCT SERVICE] Product created successfully:", product._id)
      return product
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Create product error:", error.message)
      throw new Error(error.message || "Failed to create product")
    }
  }

  async getProductById(productId: string, incrementViews = false): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Getting product by ID:", productId)
      await connectDB()

      const product = await Product.findById(productId)
        .populate("seller", "fullName username email profile.avatar profile.location")
        .exec()

      if (!product) {
        return null
      }

      // Increment views if requested
      if (incrementViews) {
        await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } })
        await User.findByIdAndUpdate(product.seller._id, {
          $inc: { "statistics.totalViews": 1 },
        })
      }

      return product
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Get product by ID error:", error.message)
      throw new Error("Failed to get product")
    }
  }

  async getProducts(
    filters: ProductFilters = {},
    sortOptions: ProductSortOptions = {},
    page = 1,
    limit = 20
  ): Promise<{
    products: IProduct[]
    total: number
    pages: number
    currentPage: number
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting products with filters:", filters)
      await connectDB()

      // Build query
      const query: any = { status: "active" }

      if (filters.category) {
        query.category = filters.category
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {}
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice
      }

      if (filters.condition && filters.condition.length > 0) {
        query.condition = { $in: filters.condition }
      }

      if (filters.location) {
        if (filters.location.city) query["location.city"] = new RegExp(filters.location.city, "i")
        if (filters.location.state) query["location.state"] = new RegExp(filters.location.state, "i")
        if (filters.location.country) query["location.country"] = filters.location.country
      }

      if (filters.seller) {
        query.seller = filters.seller
      }

      if (filters.status) {
        query.status = filters.status
      }

      if (filters.search) {
        query.$text = { $search: filters.search }
      }

      // Build sort
      const sort: any = {}
      const { sortBy = "createdAt", sortOrder = "desc" } = sortOptions
      sort[sortBy] = sortOrder === "desc" ? -1 : 1

      // Execute query
      const skip = (page - 1) * limit
      const [products, total] = await Promise.all([
        Product.find(query)
          .populate("seller", "fullName username profile.avatar profile.location")
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        Product.countDocuments(query),
      ])

      const pages = Math.ceil(total / limit)

      console.log(`[PRODUCT SERVICE] Found ${total} products, page ${page}/${pages}`)

      return {
        products,
        total,
        pages,
        currentPage: page,
      }
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Get products error:", error.message)
      throw new Error("Failed to get products")
    }
  }

  async updateProduct(productId: string, sellerId: string, updateData: UpdateProductData): Promise<IProduct | null> {
    try {
      console.log("[PRODUCT SERVICE] Updating product:", productId)
      await connectDB()

      // Find product and verify ownership
      const product = await Product.findOne({ _id: productId, seller: sellerId })
      if (!product) {
        throw new Error("Product not found or you don't have permission to update it")
      }

      // Handle status change for statistics
      if (updateData.status && updateData.status !== product.status) {
        const statusChanges: any = {}
        
        if (product.status === "active" && updateData.status !== "active") {
          statusChanges["statistics.activeListings"] = -1
        } else if (product.status !== "active" && updateData.status === "active") {
          statusChanges["statistics.activeListings"] = 1
        }
        
        if (updateData.status === "sold") {
          statusChanges["statistics.soldItems"] = 1
        }

        if (Object.keys(statusChanges).length > 0) {
          await User.findByIdAndUpdate(sellerId, { $inc: statusChanges })
        }
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("seller", "fullName username email profile.avatar profile.location")

      console.log("[PRODUCT SERVICE] Product updated successfully")
      return updatedProduct
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Update product error:", error.message)
      throw new Error(error.message || "Failed to update product")
    }
  }

  async deleteProduct(productId: string, sellerId: string): Promise<void> {
    try {
      console.log("[PRODUCT SERVICE] Deleting product:", productId)
      await connectDB()

      // Find product and verify ownership
      const product = await Product.findOne({ _id: productId, seller: sellerId })
      if (!product) {
        throw new Error("Product not found or you don't have permission to delete it")
      }

      // Delete product
      await Product.findByIdAndDelete(productId)

      // Update seller statistics
      const statisticsUpdate: any = { "statistics.totalListings": -1 }
      if (product.status === "active") {
        statisticsUpdate["statistics.activeListings"] = -1
      }
      if (product.status === "sold") {
        statisticsUpdate["statistics.soldItems"] = -1
      }

      await User.findByIdAndUpdate(sellerId, { $inc: statisticsUpdate })

      console.log("[PRODUCT SERVICE] Product deleted successfully")
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Delete product error:", error.message)
      throw new Error(error.message || "Failed to delete product")
    }
  }

  async toggleFavorite(productId: string, userId: string): Promise<{ isFavorite: boolean }> {
    try {
      console.log("[PRODUCT SERVICE] Toggling favorite for product:", productId, "user:", userId)
      await connectDB()

      const product = await Product.findById(productId)
      if (!product) {
        throw new Error("Product not found")
      }

      const userObjectId = new mongoose.Types.ObjectId(userId)
      const isFavorite = product.favorites.includes(userObjectId)

      if (isFavorite) {
        // Remove from favorites
        await Product.findByIdAndUpdate(productId, {
          $pull: { favorites: userObjectId },
        })
      } else {
        // Add to favorites
        await Product.findByIdAndUpdate(productId, {
          $addToSet: { favorites: userObjectId },
        })
      }

      console.log(`[PRODUCT SERVICE] Product ${isFavorite ? "removed from" : "added to"} favorites`)
      return { isFavorite: !isFavorite }
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Toggle favorite error:", error.message)
      throw new Error("Failed to toggle favorite")
    }
  }

  async getUserFavorites(userId: string, page = 1, limit = 20): Promise<{
    products: IProduct[]
    total: number
    pages: number
    currentPage: number
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting user favorites:", userId)
      await connectDB()

      const skip = (page - 1) * limit
      const userObjectId = new mongoose.Types.ObjectId(userId)

      const [products, total] = await Promise.all([
        Product.find({ favorites: userObjectId, status: "active" })
          .populate("seller", "fullName username profile.avatar profile.location")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Product.countDocuments({ favorites: userObjectId, status: "active" }),
      ])

      const pages = Math.ceil(total / limit)

      return {
        products,
        total,
        pages,
        currentPage: page,
      }
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Get user favorites error:", error.message)
      throw new Error("Failed to get user favorites")
    }
  }

  async getSellerProducts(
    sellerId: string,
    status?: string,
    page = 1,
    limit = 20
  ): Promise<{
    products: IProduct[]
    total: number
    pages: number
    currentPage: number
  }> {
    try {
      console.log("[PRODUCT SERVICE] Getting seller products:", sellerId)
      await connectDB()

      const query: any = { seller: sellerId }
      if (status) {
        query.status = status
      }

      const skip = (page - 1) * limit

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Product.countDocuments(query),
      ])

      const pages = Math.ceil(total / limit)

      return {
        products,
        total,
        pages,
        currentPage: page,
      }
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Get seller products error:", error.message)
      throw new Error("Failed to get seller products")
    }
  }

  async getProductCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      console.log("[PRODUCT SERVICE] Getting product categories")
      await connectDB()

      const categories = await Product.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ])

      return categories
    } catch (error: any) {
      console.error("[PRODUCT SERVICE] Get product categories error:", error.message)
      throw new Error("Failed to get product categories")
    }
  }
}
