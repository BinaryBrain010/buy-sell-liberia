import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  fullName: string
  username: string
  email: string
  phone?: string
  password: string
  country: string
  isEmailVerified: boolean
  refreshToken?: string
  role: "user" | "admin"
  status: "active" | "inactive" | "suspended"
  createdAt: Date
  updatedAt: Date
  chatRooms?: string[] // Array of room IDs the user is part of
  recentContacts?: mongoose.Types.ObjectId[] // Array of user IDs
  favorites: mongoose.Types.ObjectId[] // Array of product ObjectIds
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    chatRooms: [{ type: String }],
    recentContacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Product', default: [] }],
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ username: 1 })
UserSchema.index({ createdAt: -1 })

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
