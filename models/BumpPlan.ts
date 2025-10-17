import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBumpPlan extends Document {
  title: string;
  bumps: number;
  price: number; // in cents / smallest currency unit
  currency: string;
  description?: string;
  priority?: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface IBumpPlanModel extends Model<IBumpPlan> {
  findActive(): Promise<IBumpPlan[]>;
}

const bumpPlanSchema = new Schema<IBumpPlan>(
  {
    title: { type: String, required: true, trim: true },
    bumps: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    description: { type: String, trim: true },
    priority: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

bumpPlanSchema.index({ status: 1, priority: 1 });

bumpPlanSchema.statics.findActive = function () {
  return this.find({ status: "active" }).sort({ priority: 1 });
};

if (mongoose.models.BumpPlan) {
  delete mongoose.models.BumpPlan;
}

const BumpPlan: IBumpPlanModel = mongoose.model<IBumpPlan, IBumpPlanModel>(
  "BumpPlan",
  bumpPlanSchema
);
export default BumpPlan;
