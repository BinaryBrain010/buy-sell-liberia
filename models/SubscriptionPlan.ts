import mongoose, { Document, Model, Schema } from "mongoose";

export type SubscriptionPlanType = "basic" | "pro" | "vip";
export type SubscriptionStatus = "active" | "inactive" | "archived";

export interface ISubscriptionPlan extends Document {
  name: string;
  type: SubscriptionPlanType;
  description: string;
  price: number; // Price in LD (Liberian Dollars)
  currency: "LD";
  duration: number; // Duration in days (30 for monthly)
  maxAds: number; // Maximum ads allowed per month
  featuredAds: number; // Number of featured ads included
  homepageBanner: boolean; // VIP feature
  priority: number; // For sorting plans (1 = basic, 2 = pro, 3 = vip)
  status: SubscriptionStatus;
  features: string[]; // Array of feature descriptions
  isPopular?: boolean; // For UI highlighting
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlanModel extends Model<ISubscriptionPlan> {
  findActivePlans(): Promise<ISubscriptionPlan[]>;
  findByType(type: SubscriptionPlanType): Promise<ISubscriptionPlan | null>;
  getDefaultPlan(): Promise<ISubscriptionPlan | null>;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ["basic", "pro", "vip"],
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    enum: ["LD"],
    default: "LD",
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    default: 30, // 30 days for monthly plans
  },
  maxAds: {
    type: Number,
    required: true,
    min: 0,
  },
  featuredAds: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  homepageBanner: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active",
  },
  features: [{
    type: String,
    trim: true,
  }],
  isPopular: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

// Create indexes
subscriptionPlanSchema.index({ type: 1 });
subscriptionPlanSchema.index({ status: 1, priority: 1 });
subscriptionPlanSchema.index({ price: 1 });

// Static methods
subscriptionPlanSchema.statics.findActivePlans = function() {
  return this.find({ status: "active" }).sort({ priority: 1 });
};

subscriptionPlanSchema.statics.findByType = function(type: SubscriptionPlanType) {
  return this.findOne({ type, status: "active" });
};

subscriptionPlanSchema.statics.getDefaultPlan = function() {
  return this.findOne({ type: "basic", status: "active" });
};

// Clear any existing model to force schema update
if (mongoose.models.SubscriptionPlan) {
  delete mongoose.models.SubscriptionPlan;
}

const SubscriptionPlan: ISubscriptionPlanModel = mongoose.model<ISubscriptionPlan, ISubscriptionPlanModel>("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
