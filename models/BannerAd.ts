import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBannerAd extends Document {
  imageUrl: string;
  targetUrl: string;
  placement: string;  
  isActive: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bannerAdSchema = new Schema<IBannerAd>(
  {
    imageUrl: { type: String, required: true },
    targetUrl: { type: String, required: true },
    placement: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

bannerAdSchema.index({ placement: 1, isActive: 1 });

const BannerAd: Model<IBannerAd> =
  mongoose.models.BannerAd ||
  mongoose.model<IBannerAd>("BannerAd", bannerAdSchema);
export default BannerAd;
