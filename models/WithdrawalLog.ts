import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWithdrawalLog extends Document {
  amount: number;
  date: Date;
  destination: string;
  note?: string;
  admin: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalLogSchema = new Schema<IWithdrawalLog>({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  destination: { type: String, required: true },
  note: { type: String },
  admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
}, {
  timestamps: true,
});

const WithdrawalLog: Model<IWithdrawalLog> = mongoose.models.WithdrawalLog || mongoose.model<IWithdrawalLog>("WithdrawalLog", withdrawalLogSchema);
export default WithdrawalLog;
