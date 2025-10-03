import mongoose, { Document, Model, Schema } from "mongoose";

export type ManualPaymentStatus = "pending" | "approved" | "rejected";
export type ManualPaymentMethod = "MTN" | "Orange" | "Bank";
export type FeatureType = "featured_listing" | "bump_listing";
export type FeaturePlan = "3_days" | "7_days" | "14_days" | "1_bump" | "3_bumps" | "5_bumps" | "10_bumps";

export interface IManualPayment extends Document {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  amount: number;
  method: ManualPaymentMethod;
  screenshot: string; // URL or file path
  transactionId: string;
  status: ManualPaymentStatus;
  adminNotes?: string;
  userNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Feature-specific fields
  featureType: FeatureType;
  featurePlan: FeaturePlan;
  featureDuration: number; // Duration in days (3, 7, or 14) or number of bumps
  bumpCredits?: number; // Number of bump credits for bump_listing type
}

const manualPaymentSchema = new Schema<IManualPayment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["MTN", "Orange", "Bank"], required: true },
  screenshot: { type: String, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNotes: { type: String },
  userNotes: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  reviewedAt: { type: Date },
  
  // Feature-specific fields
  featureType: { type: String, enum: ["featured_listing", "bump_listing"], required: true, default: "featured_listing" },
  featurePlan: { type: String, enum: ["3_days", "7_days", "14_days", "1_bump", "3_bumps", "5_bumps", "10_bumps"], required: true },
  featureDuration: { type: Number, required: true, min: 1, max: 365 }, // Days or number of bumps
  bumpCredits: { type: Number, min: 0 }, // Number of bump credits for bump_listing type
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
});

const ManualPayment: Model<IManualPayment> = mongoose.models.ManualPayment || mongoose.model<IManualPayment>("ManualPayment", manualPaymentSchema);
export default ManualPayment;
