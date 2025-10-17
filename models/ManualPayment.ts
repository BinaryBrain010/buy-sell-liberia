import mongoose, { Document, Model, Schema } from "mongoose";

export type ManualPaymentStatus = "pending" | "approved" | "rejected";
export type ManualPaymentMethod = "MTN" | "Orange" | "Bank";
export type FeatureType =
  | "featured_listing"
  | "bump_listing"
  | "account_verification"
  | "banner_ad"
  | "paid_category_listing";
// Allow flexible plan keys per feature type (e.g., 1_bump, 7_days, verify_basic, banner_week, etc.)
export type FeaturePlan = string;

export interface IManualPayment extends Document {
  user: mongoose.Types.ObjectId;
  listing?: mongoose.Types.ObjectId; // optional for non-listing features
  amount: number;
  currency?: "USD" | "LRD" | string;
  method?: ManualPaymentMethod; // optional – UI may omit explicit method selection
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

const manualPaymentSchema = new Schema<IManualPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: function (this: any) {
        // Required only for features bound to a specific listing
        return ["featured_listing", "paid_category_listing"].includes(
          this.featureType
        );
      },
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "LRD"], default: "LRD" },
    method: { type: String, enum: ["MTN", "Orange", "Bank"], required: false },
    screenshot: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
    userNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },

    // Feature-specific fields
    featureType: {
      type: String,
      enum: [
        "featured_listing",
        "bump_listing",
        "account_verification",
        "banner_ad",
        "paid_category_listing",
      ],
      required: true,
      default: "featured_listing",
    },
    featurePlan: { type: String, required: true },
    featureDuration: { type: Number, required: true, min: 1 }, // Days or number of bumps
    bumpCredits: { type: Number, min: 0 }, // Number of bump credits for bump_listing type
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// If the model was previously compiled with an older schema (e.g., method/listing required),
// delete it so we can recompile with the relaxed constraints during hot reload in Next.js.
if (mongoose.models.ManualPayment) {
  // @ts-ignore
  delete mongoose.models.ManualPayment;
}
const ManualPayment: Model<IManualPayment> = mongoose.model<IManualPayment>(
  "ManualPayment",
  manualPaymentSchema
);
export default ManualPayment;
