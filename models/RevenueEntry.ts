import mongoose, { Document, Model, Schema } from "mongoose";

export type RevenueType = "income" | "expense" | "withdrawal";

export interface IRevenueEntry extends Document {
  type: RevenueType;
  amount: number;
  currency: string; // e.g., "LRD" | "USD"
  source?: string; // e.g., "manual_payment", "bump", "featured" etc.
  referenceId?: string; // link to an external id (e.g., ManualPayment._id)
  note?: string;
  meta?: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId; // admin/user id
  createdAt: Date;
  updatedAt: Date;
}

const RevenueEntrySchema = new Schema<IRevenueEntry>(
  {
    type: {
      type: String,
      enum: ["income", "expense", "withdrawal"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "LRD" },
    source: { type: String },
    referenceId: { type: String },
    note: { type: String },
    meta: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const RevenueEntry: Model<IRevenueEntry> =
  mongoose.models.RevenueEntry ||
  mongoose.model<IRevenueEntry>("RevenueEntry", RevenueEntrySchema);

export default RevenueEntry;
