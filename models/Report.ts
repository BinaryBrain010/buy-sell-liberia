import mongoose, { Document, Model, Schema } from "mongoose";

export type ReportReason = "scam" | "fake" | "duplicate" | "inappropriate";
export type ReportStatus = "pending" | "approved" | "removed" | "resolved";

export interface IReport extends Document {
  product_id: mongoose.Types.ObjectId;
  reported_by: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminAction?: "approve" | "remove" | "warn" | "ban";
  adminNotes?: string;
  created_at: Date;
  updated_at: Date;
}

const reportSchema = new Schema<IReport>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  reported_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, enum: ["scam", "fake", "duplicate", "inappropriate"], required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "approved", "removed", "resolved"], default: "pending" },
  adminAction: { type: String, enum: ["approve", "remove", "warn", "ban"] },
  adminNotes: { type: String },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);
export default Report;
