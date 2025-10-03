import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface INewsletterSubscription extends Document {
  email: string;
  status: "active" | "unsubscribed" | "bounced";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: string; // "website", "admin", "api", etc.
  ipAddress?: string;
  userAgent?: string;
  tags?: string[]; // For categorization: ["promotions", "updates", "news"]
  preferences?: {
    frequency: "daily" | "weekly" | "monthly";
    categories: string[]; // ["electronics", "fashion", "automotive"]
  };
  verificationToken?: string;
  verified: boolean;
  lastEmailSent?: Date;
  bounceCount: number;
  created_at?: Date;
  updated_at?: Date;
}

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed", "bounced"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      default: "website",
    },
    ipAddress: String,
    userAgent: String,
    tags: [{
      type: String,
      trim: true,
    }],
    preferences: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly",
      },
      categories: [{
        type: String,
        trim: true,
      }],
    },
    verificationToken: String,
    verified: {
      type: Boolean,
      default: false,
    },
    lastEmailSent: Date,
    bounceCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for efficient queries
newsletterSubscriptionSchema.index({ email: 1 });
newsletterSubscriptionSchema.index({ status: 1 });
newsletterSubscriptionSchema.index({ subscribedAt: -1 });
newsletterSubscriptionSchema.index({ tags: 1 });
newsletterSubscriptionSchema.index({ "preferences.categories": 1 });

// Instance methods
newsletterSubscriptionSchema.methods.unsubscribe = function(): Promise<INewsletterSubscription> {
  this.status = "unsubscribed";
  this.unsubscribedAt = new Date();
  return this.save();
};

newsletterSubscriptionSchema.methods.resubscribe = function(): Promise<INewsletterSubscription> {
  this.status = "active";
  this.unsubscribedAt = undefined;
  this.bounceCount = 0;
  return this.save();
};

newsletterSubscriptionSchema.methods.recordBounce = function(): Promise<INewsletterSubscription> {
  this.bounceCount += 1;
  if (this.bounceCount >= 3) {
    this.status = "bounced";
  }
  return this.save();
};

newsletterSubscriptionSchema.methods.updateLastEmailSent = function(): Promise<INewsletterSubscription> {
  this.lastEmailSent = new Date();
  return this.save();
};

// Static methods
newsletterSubscriptionSchema.statics.findActiveSubscribers = function(filters: any = {}) {
  return this.find({
    status: "active",
    verified: true,
    ...filters,
  });
};

newsletterSubscriptionSchema.statics.findByCategory = function(category: string) {
  return this.find({
    status: "active",
    verified: true,
    "preferences.categories": category,
  });
};

newsletterSubscriptionSchema.statics.getSubscriberStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
};

// Use the existing model if it exists, otherwise create a new one
const NewsletterSubscription: Model<INewsletterSubscription> = 
  mongoose.models.NewsletterSubscription || 
  mongoose.model<INewsletterSubscription>("NewsletterSubscription", newsletterSubscriptionSchema);

export default NewsletterSubscription;
