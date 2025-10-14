import mongoose, { Document, Model, Schema } from "mongoose";

export type UserSubscriptionStatus =
  | "pending"
  | "active"
  | "expired"
  | "cancelled"
  | "suspended";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IUserSubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  planType: "basic" | "pro" | "vip";
  status: UserSubscriptionStatus;
  paymentStatus: PaymentStatus;

  // Subscription period
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;

  // Usage tracking
  adsUsed: number; // Number of ads posted in current period
  featuredAdsUsed: number; // Number of featured ads used
  homepageBannerUsed: boolean; // Whether homepage banner has been used

  // Payment information
  amount: number;
  currency: "USD";
  paymentMethod: "MTN" | "Orange" | "Bank" | "manual";
  transactionId?: string;
  paymentScreenshot?: string;
  paymentNotes?: string;

  // Admin approval
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  adminNotes?: string;

  // Cancellation
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;

  // Renewal tracking
  renewalCount: number;
  lastRenewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isActive(): boolean;
  isExpired(): boolean;
  canPostAd(): boolean;
  canUseFeaturedAd(): boolean;
  canUseHomepageBanner(): boolean;
  getRemainingAds(): number;
  getRemainingFeaturedAds(): number;
  incrementAdUsage(): Promise<IUserSubscription>;
  incrementFeaturedAdUsage(): Promise<IUserSubscription>;
  useHomepageBanner(): Promise<IUserSubscription>;
  renew(): Promise<IUserSubscription>;
  cancel(
    cancelledBy: mongoose.Types.ObjectId,
    reason?: string
  ): Promise<IUserSubscription>;
}

export interface IUserSubscriptionModel extends Model<IUserSubscription> {
  findActiveByUser(
    userId: mongoose.Types.ObjectId
  ): Promise<IUserSubscription | null>;
  findPendingByUser(
    userId: mongoose.Types.ObjectId
  ): Promise<IUserSubscription[]>;
  findExpiredSubscriptions(): Promise<IUserSubscription[]>;
  findSubscriptionsNeedingRenewal(): Promise<IUserSubscription[]>;
}

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planType: {
      type: String,
      enum: ["basic", "pro", "vip"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled", "suspended"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Subscription period
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // Usage tracking
    adsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    featuredAdsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    homepageBannerUsed: {
      type: Boolean,
      default: false,
    },

    // Payment information
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["USD"],
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["MTN", "Orange", "Bank", "manual"],
      required: true,
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    paymentScreenshot: {
      type: String,
      sparse: true,
    },
    paymentNotes: {
      type: String,
      maxlength: 500,
    },

    // Admin approval
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Admin user
      sparse: true,
    },
    approvedAt: {
      type: Date,
      sparse: true,
    },
    adminNotes: {
      type: String,
      maxlength: 500,
    },

    // Cancellation
    cancelledAt: {
      type: Date,
      sparse: true,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },

    // Renewal tracking
    renewalCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRenewedAt: {
      type: Date,
      sparse: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Create indexes
userSubscriptionSchema.index({ user: 1, status: 1 });
userSubscriptionSchema.index({ plan: 1 });
userSubscriptionSchema.index({ status: 1, endDate: 1 });
userSubscriptionSchema.index({ paymentStatus: 1 });
userSubscriptionSchema.index({ startDate: 1, endDate: 1 });

// Instance methods
userSubscriptionSchema.methods.isActive = function (): boolean {
  const now = new Date();
  return (
    this.status === "active" && this.startDate <= now && this.endDate > now
  );
};

userSubscriptionSchema.methods.isExpired = function (): boolean {
  return this.endDate < new Date();
};

userSubscriptionSchema.methods.canPostAd = function (): boolean {
  if (!this.isActive()) return false;

  // Get plan details from populated plan or use planType to determine limits
  const maxAds =
    this.planType === "basic"
      ? 20
      : this.planType === "pro"
      ? 60
      : Number.MAX_SAFE_INTEGER; // VIP has unlimited

  return this.adsUsed < maxAds;
};

userSubscriptionSchema.methods.canUseFeaturedAd = function (): boolean {
  if (!this.isActive()) return false;

  const maxFeaturedAds =
    this.planType === "basic"
      ? 0
      : this.planType === "pro"
      ? 5
      : Number.MAX_SAFE_INTEGER; // VIP has unlimited

  return this.featuredAdsUsed < maxFeaturedAds;
};

userSubscriptionSchema.methods.canUseHomepageBanner = function (): boolean {
  if (!this.isActive()) return false;
  return this.planType === "vip" && !this.homepageBannerUsed;
};

userSubscriptionSchema.methods.getRemainingAds = function (): number {
  if (!this.isActive()) return 0;

  const maxAds =
    this.planType === "basic"
      ? 20
      : this.planType === "pro"
      ? 60
      : Number.MAX_SAFE_INTEGER; // VIP has unlimited

  return Math.max(0, maxAds - this.adsUsed);
};

userSubscriptionSchema.methods.getRemainingFeaturedAds = function (): number {
  if (!this.isActive()) return 0;

  const maxFeaturedAds =
    this.planType === "basic"
      ? 0
      : this.planType === "pro"
      ? 5
      : Number.MAX_SAFE_INTEGER; // VIP has unlimited

  return Math.max(0, maxFeaturedAds - this.featuredAdsUsed);
};

userSubscriptionSchema.methods.incrementAdUsage =
  function (): Promise<IUserSubscription> {
    this.adsUsed += 1;
    return this.save();
  };

userSubscriptionSchema.methods.incrementFeaturedAdUsage =
  function (): Promise<IUserSubscription> {
    this.featuredAdsUsed += 1;
    return this.save();
  };

userSubscriptionSchema.methods.useHomepageBanner =
  function (): Promise<IUserSubscription> {
    this.homepageBannerUsed = true;
    return this.save();
  };

userSubscriptionSchema.methods.renew = function (): Promise<IUserSubscription> {
  const now = new Date();
  const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  this.startDate = now;
  this.endDate = new Date(now.getTime() + durationMs);
  this.status = "active";
  this.renewalCount += 1;
  this.lastRenewedAt = now;

  // Reset usage counters for new period
  this.adsUsed = 0;
  this.featuredAdsUsed = 0;
  this.homepageBannerUsed = false;

  return this.save();
};

userSubscriptionSchema.methods.cancel = function (
  cancelledBy: mongoose.Types.ObjectId,
  reason?: string
): Promise<IUserSubscription> {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.autoRenew = false;

  return this.save();
};

// Static methods
userSubscriptionSchema.statics.findActiveByUser = function (
  userId: mongoose.Types.ObjectId
) {
  const now = new Date();
  return this.findOne({
    user: userId,
    status: "active",
    startDate: { $lte: now },
    endDate: { $gt: now },
  }).populate("plan");
};

userSubscriptionSchema.statics.findPendingByUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    user: userId,
    status: "pending",
  }).populate("plan");
};

userSubscriptionSchema.statics.findExpiredSubscriptions = function () {
  const now = new Date();
  return this.find({
    status: "active",
    endDate: { $lt: now },
  });
};

userSubscriptionSchema.statics.findSubscriptionsNeedingRenewal = function () {
  const now = new Date();
  const renewalDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  return this.find({
    status: "active",
    autoRenew: true,
    endDate: { $lte: renewalDate, $gt: now },
  });
};

// Clear any existing model to force schema update
if (mongoose.models.UserSubscription) {
  delete mongoose.models.UserSubscription;
}

const UserSubscription: IUserSubscriptionModel = mongoose.model<
  IUserSubscription,
  IUserSubscriptionModel
>("UserSubscription", userSubscriptionSchema);
export default UserSubscription;
