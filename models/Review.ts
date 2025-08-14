import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  reviewer_id: mongoose.Types.ObjectId;
  reviewed_user_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  transactionType: "purchase" | "sale" | "service";
  isVerified: boolean;
  isReported: boolean;
  reportReason?: "spam" | "inappropriate" | "fake" | "other";
  isHidden: boolean;
  adminNotes?: string;
  created_at?: Date;
  updated_at?: Date;
  report(reason: IReview["reportReason"]): Promise<IReview>;
  verify(): Promise<IReview>;
  hide(adminNotes?: string): Promise<IReview>;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewed_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    transactionType: {
      type: String,
      enum: ["purchase", "sale", "service"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      enum: ["spam", "inappropriate", "fake", "other"],
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    adminNotes: String,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Create indexes
reviewSchema.index({ reviewer_id: 1 });
reviewSchema.index({ reviewed_user_id: 1 });
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ created_at: -1 });
reviewSchema.index({ reviewer_id: 1, product_id: 1 }, { unique: true });

// Instance methods
reviewSchema.methods.report = function (
  reason: IReview["reportReason"]
): Promise<IReview> {
  this.isReported = true;
  this.reportReason = reason;
  return this.save();
};

reviewSchema.methods.verify = function (): Promise<IReview> {
  this.isVerified = true;
  return this.save();
};

reviewSchema.methods.hide = function (adminNotes?: string): Promise<IReview> {
  this.isHidden = true;
  this.adminNotes = adminNotes;
  return this.save();
};

// Static methods
reviewSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ reviewed_user_id: userId, isHidden: false })
    .populate(
      "reviewer_id",
      "firstName lastName profile.displayName profile.avatar"
    )
    .populate("product_id", "title slug images")
    .sort({ created_at: -1 });
};

reviewSchema.statics.findByReviewer = function (
  reviewerId: mongoose.Types.ObjectId
) {
  return this.find({ reviewer_id: reviewerId, isHidden: false })
    .populate(
      "reviewed_user_id",
      "firstName lastName profile.displayName profile.avatar"
    )
    .populate("product_id", "title slug images")
    .sort({ created_at: -1 });
};

reviewSchema.statics.getAverageRating = async function (
  userId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    {
      $match: {
        reviewed_user_id: new mongoose.Types.ObjectId(userId),
        isHidden: false,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

reviewSchema.statics.findReportedReviews = function () {
  return this.find({ isReported: true, isHidden: false })
    .populate("reviewer_id", "firstName lastName email")
    .populate("reviewed_user_id", "firstName lastName email")
    .populate("product_id", "title")
    .sort({ created_at: -1 });
};

// Use the existing model if it exists, otherwise create a new one
const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
export default Review;
