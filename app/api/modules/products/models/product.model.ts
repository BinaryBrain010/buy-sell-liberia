import mongoose, { Schema, type Document } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category_id: mongoose.Types.ObjectId;
  subcategory_id?: mongoose.Types.ObjectId;
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
  seller: mongoose.Types.ObjectId;
  status: "active" | "sold" | "inactive" | "pending";
  tags: string[];
  specifications: {
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
  negotiable: boolean;
  showPhoneNumber: boolean;
  views: number;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  slug: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      minlength: [5, "Title must be at least 5 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      minlength: [20, "Description must be at least 20 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
      max: [10000000, "Price is too high"],
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    subcategory_id: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      index: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["new", "like-new", "good", "fair", "poor"],
      default: "good",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    titleImageIndex: {
      type: Number,
      required: [true, "Title image index is required"],
      min: [0, "Title image index must be non-negative"],
      default: 0,
    },
    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      whatsapp: {
        type: String,
        trim: true,
      },
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    status: {
      type: String,
      enum: ["active", "sold", "inactive", "pending"],
      default: "active",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    specifications: {
      brand: { type: String, trim: true },
      model: { type: String, trim: true },
      year: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },
      color: { type: String, trim: true },
      size: { type: String, trim: true },
      weight: { type: String, trim: true },
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    showPhoneNumber: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ProductSchema.index({ seller: 1, status: 1 });
ProductSchema.index({ category_id: 1, status: 1 });
ProductSchema.index({ "location.city": 1, "location.country": 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
