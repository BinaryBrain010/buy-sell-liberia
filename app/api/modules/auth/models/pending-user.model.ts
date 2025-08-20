import mongoose, { Schema, type Document } from "mongoose"

export interface IPendingUser extends Document {
  _id: mongoose.Types.ObjectId
  fullName: string
  username: string
  email: string
  phone?: string
  password: string
  country: string
  createdAt: Date
  expiresAt: Date
}

const PendingUserSchema = new Schema<IPendingUser>(
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
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: false,
  },
)

// Indexes
PendingUserSchema.index({ email: 1 })
PendingUserSchema.index({ username: 1 })
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PendingUser = mongoose.models.PendingUser || mongoose.model<IPendingUser>("PendingUser", PendingUserSchema)
