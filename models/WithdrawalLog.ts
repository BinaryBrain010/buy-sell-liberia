import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWithdrawalLog extends Document {
  amount: number;
  date: Date;
  destination: string;
  note?: string;
  admin?: mongoose.Types.ObjectId; // optional for super admin
  adminTitle?: string; // for super admin logs
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalLogSchema = new Schema<IWithdrawalLog>({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  destination: { type: String, required: true },
  note: { type: String },
  admin: { type: Schema.Types.ObjectId, ref: "Admin", required: false }, // optional
  adminTitle: { type: String }, // for super admin
}, {
  timestamps: true,
});

const WithdrawalLog: Model<IWithdrawalLog> = mongoose.models.WithdrawalLog || mongoose.model<IWithdrawalLog>("WithdrawalLog", withdrawalLogSchema);
export default WithdrawalLog;
