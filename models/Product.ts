import mongoose, { type Document, type Model, Schema } from "mongoose"

// Custom field value schema
export interface ICustomFieldValue {
  fieldName: string
  value: any
}

const customFieldValueSchema = new Schema<ICustomFieldValue>(
  {
    fieldName: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false },
)

// Image schema
export interface IImage {
  url: string
  alt?: string
  isPrimary?: boolean
  order?: number
  _id?: mongoose.Types.ObjectId
}

const imageSchema = new Schema<IImage>(
  {
    url: {
      type: String,
      required: true,
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
)

// View history schema
export interface IViewHistory {
  user_id?: mongoose.Types.ObjectId
  viewed_at?: Date
  ip_address?: string
}

const viewHistorySchema = new Schema<IViewHistory>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    viewed_at: {
      type: Date,
      default: Date.now,
    },
    ip_address: String,
  },
  { _id: false },
)

// Price schema
export interface IPrice {
  amount: number
  currency: "USD"
  negotiable?: boolean
}

// Location schema
export interface ILocation {
  city: string
  state?: string
  country?: string
  coordinates?: {
    latitude?: number
    longitude?: number
  }
}

// Contact schema
export interface IContact {
  phone?: string
  whatsapp?: string
  email?: string
  preferredMethod?: "phone" | "whatsapp" | "email"
}

// Product details schema
export interface IProductDetails {
  condition?: "new" | "used" | "refurbished"
  brand?: string
  model?: string
  year?: number
  warranty?: boolean
  warrantyPeriod?: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }
  weight?: {
    value?: number
    unit?: string
  }
}

const productDetailsSchema = new Schema<IProductDetails>(
  {
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
    },
    brand: String,
    model: String,
    year: Number,
    warranty: Boolean,
    warrantyPeriod: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String,
    },
    weight: {
      value: Number,
      unit: String,
    },
  },
  { _id: false },
)

export interface IProduct extends Document {
  user_id: mongoose.Types.ObjectId
  title: string
  description: string
  category_id: mongoose.Types.ObjectId
  subcategory_id: mongoose.Types.ObjectId
  price: IPrice
  location: ILocation
  contact: IContact
  details: IProductDetails
  images: IImage[]
  customFields: ICustomFieldValue[]
  status: "active" | "sold" | "expired" | "removed" | "pending"
  listingType: "sale" | "rent" | "service" | "job"
  featured: boolean
  views: number
  added_at: Date
  expires_at: Date
  renewed_at?: Date
  tags: string[]
  slug?: string
  viewHistory: IViewHistory[]
  searchText?: string
  created_at?: Date
  updated_at?: Date
  formattedPrice?: string
  timeAgo?: string
  isExpired(): boolean
  renew(): Promise<IProduct>
  addView(userId?: mongoose.Types.ObjectId, ipAddress?: string): Promise<IProduct>
  markAsSold(): Promise<IProduct>
  getCustomField(fieldName: string): any
  setCustomField(fieldName: string, value: any): void
  markAsFeatured(): Promise<IProduct>
  unmarkAsFeatured(): Promise<IProduct>
  toggleFeatured(): Promise<IProduct>
}

const productSchema = new Schema<IProduct>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["PKR", "USD", "EUR", "GBP"],
      },
      negotiable: {
        type: Boolean,
        default: true,
      },
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: String,
      country: {
        type: String,
        default: "Liberia",
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: String,
      whatsapp: String,
      email: String,
      preferredMethod: {
        type: String,
        enum: ["phone", "whatsapp", "email"],
        default: "phone",
      },
    },
    details: {
      type: productDetailsSchema,
      default: () => ({}),
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (images: IImage[]) => images.length <= 10 && images.length > 0,
        message: "Product must have 1-10 images",
      },
    },
    customFields: [customFieldValueSchema],
    status: {
      type: String,
      enum: ["active", "sold", "expired", "removed", "pending"],
      default: "active",
    },
    listingType: {
      type: String,
      enum: ["sale", "rent", "service", "job"],
      default: "sale",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    renewed_at: Date,
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    viewHistory: {
      type: [viewHistorySchema],
      default: [],
    },
    searchText: String,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
)

// Create indexes for efficient queries
productSchema.index({ user_id: 1 })
productSchema.index({ category_id: 1, subcategory_id: 1 })
productSchema.index({ "location.city": 1, "location.state": 1 })
productSchema.index({ "price.amount": 1 })
productSchema.index({ status: 1, expires_at: 1 })
productSchema.index({ added_at: -1 })
productSchema.index({ searchText: "text", title: "text", description: "text" })
productSchema.index({ featured: -1, added_at: -1 })

// Pre-save middleware to generate slug and search text
productSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now()
  }
  const customFieldsText = this.customFields.map((field) => field.value).join(" ")
  this.searchText = [
    this.title,
    this.description,
    this.tags.join(" "),
    customFieldsText,
    this.location.city,
    this.location.state,
    this.details.brand || "",
    this.details.model || "",
  ]
    .join(" ")
    .toLowerCase()
  next()
})

// Instance methods
productSchema.methods.isExpired = function (): boolean {
  return this.expires_at < new Date()
}

productSchema.methods.renew = function (): Promise<IProduct> {
  this.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  this.renewed_at = new Date()
  this.status = "active"
  return this.save()
}

productSchema.methods.addView = function (userId?: mongoose.Types.ObjectId, ipAddress?: string): Promise<IProduct> {
  this.views += 1
  this.viewHistory.unshift({
    user_id: userId,
    viewed_at: new Date(),
    ip_address: ipAddress,
  })
  if (this.viewHistory.length > 100) {
    this.viewHistory = this.viewHistory.slice(0, 100)
  }
  return this.save()
}

productSchema.methods.markAsSold = function (): Promise<IProduct> {
  this.status = "sold"
  return this.save()
}

productSchema.methods.getCustomField = function (fieldName: string): any {
  const field = this.customFields.find((f: ICustomFieldValue) => f.fieldName === fieldName)
  return field ? field.value : null
}

productSchema.methods.setCustomField = function (fieldName: string, value: any): void {
  const existingField = this.customFields.find((f: ICustomFieldValue) => f.fieldName === fieldName)
  if (existingField) {
    existingField.value = value
  } else {
    this.customFields.push({ fieldName, value })
  }
}

productSchema.methods.markAsFeatured = function (): Promise<IProduct> {
  this.featured = true
  return this.save()
}

productSchema.methods.unmarkAsFeatured = function (): Promise<IProduct> {
  this.featured = false
  return this.save()
}

productSchema.methods.toggleFeatured = function (): Promise<IProduct> {
  this.featured = !this.featured
  return this.save()
}

// Static methods
productSchema.statics.findActiveProducts = function (filters: Record<string, any> = {}) {
  return this.find({
    ...filters,
    status: "active",
    expires_at: { $gt: new Date() },
  }).sort({ featured: -1, added_at: -1 })
}

productSchema.statics.findByCategory = function (
  categoryId: mongoose.Types.ObjectId,
  subcategoryId: mongoose.Types.ObjectId | null = null,
) {
  const query: Record<string, any> = {
    category_id: categoryId,
    status: "active",
    expires_at: { $gt: new Date() },
  }
  if (subcategoryId) {
    query.subcategory_id = subcategoryId
  }
  return this.find(query).sort({ featured: -1, added_at: -1 })
}

productSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId, includeExpired = false) {
  const query: Record<string, any> = { user_id: userId }
  if (!includeExpired) {
    query.status = { $ne: "removed" }
  }
  return this.find(query).sort({ added_at: -1 })
}

productSchema.statics.searchProducts = function (searchTerm: string, filters: Record<string, any> = {}) {
  const query: Record<string, any> = {
    $text: { $search: searchTerm },
    status: "active",
    expires_at: { $gt: new Date() },
    ...filters,
  }
  return this.find(query, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
    featured: -1,
    added_at: -1,
  })
}

productSchema.statics.findExpiredProducts = function () {
  return this.find({
    status: "active",
    expires_at: { $lt: new Date() },
  })
}

productSchema.statics.autoExpireProducts = async function () {
  const expiredProducts = await (this as Model<IProduct>).find({
    status: "active",
    expires_at: { $lt: new Date() },
  })
  for (const product of expiredProducts) {
    product.status = "expired"
    await product.save()
  }
  return expiredProducts.length
}

productSchema.statics.findFeaturedProducts = function (limit = 10, filters: Record<string, any> = {}) {
  return this.find({
    ...filters,
    featured: true,
    status: "active",
    expires_at: { $gt: new Date() },
  })
    .sort({ added_at: -1 })
    .limit(limit)
}

productSchema.statics.findFeaturedByCategory = function (
  categoryId: mongoose.Types.ObjectId,
  limit = 5,
  subcategoryId: mongoose.Types.ObjectId | null = null,
) {
  const query: Record<string, any> = {
    category_id: categoryId,
    featured: true,
    status: "active",
    expires_at: { $gt: new Date() },
  }
  if (subcategoryId) {
    query.subcategory_id = subcategoryId
  }
  return this.find(query).sort({ added_at: -1 }).limit(limit)
}

productSchema.statics.findRelatedProducts = function (
  productId: mongoose.Types.ObjectId,
  categoryId: mongoose.Types.ObjectId,
  limit = 6,
) {
  return this.find({
    _id: { $ne: productId },
    category_id: categoryId,
    status: "active",
    expires_at: { $gt: new Date() },
  })
    .sort({ featured: -1, added_at: -1 })
    .limit(limit)
}

productSchema.statics.getFeaturedCount = function () {
  return this.countDocuments({
    featured: true,
    status: "active",
    expires_at: { $gt: new Date() },
  })
}

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function (this: IProduct) {
  const currency = this.price.currency === "USD" ? "Rs." : this.price.currency
  return `${currency} ${this.price.amount.toLocaleString()}${this.price.negotiable ? " (Negotiable)" : ""}`
})

// Virtual for time ago
productSchema.virtual("timeAgo").get(function (this: IProduct) {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - (this.added_at?.getTime() ?? now.getTime()))
  const diffSeconds = Math.floor(diffTime / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds === 1 ? "" : "s"} ago`
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }
  if (diffDays === 1) {
    return "1 day ago"
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`
  }
  return `${Math.floor(diffDays / 30)} months ago`
})

// Ensure virtual fields are serialized
productSchema.set("toJSON", {
  virtuals: true,
})

// Use the existing model if it exists, otherwise create a new one
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema)
export default Product
