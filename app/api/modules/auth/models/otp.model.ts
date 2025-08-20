import mongoose, { Schema, type Document } from "mongoose"

export interface IOTP extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  otp: string
  type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  createdAt: Date
  expiresAt: Date
  used: boolean
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      length: [6, "OTP must be 6 digits"],
    },
    type: {
      type: String,
      required: [true, "OTP type is required"],
      enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  },
)

// Indexes
OTPSchema.index({ email: 1, type: 1 })
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OTP = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema)
