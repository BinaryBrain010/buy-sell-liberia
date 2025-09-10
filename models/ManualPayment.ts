import mongoose, { Document, Model, Schema } from "mongoose";

export type ManualPaymentStatus = "pending" | "approved" | "rejected";
export type ManualPaymentMethod = "MTN" | "Orange" | "Bank";

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
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
});

const ManualPayment: Model<IManualPayment> = mongoose.models.ManualPayment || mongoose.model<IManualPayment>("ManualPayment", manualPaymentSchema);
export default ManualPayment;
