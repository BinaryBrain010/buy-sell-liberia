import mongoose, { Schema, Document, Model } from "mongoose";

export type VerificationType = "individual" | "business";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface IVerificationApplication extends Document {
  user: mongoose.Types.ObjectId;
  type: VerificationType;
  governmentId: string;
  businessDocuments?: string[];
  phone: string;
  email?: string;
  profilePicture: string;
  logo?: string;
  businessAddress?: string;
  socialLinks?: string[];
  status: VerificationStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationApplicationSchema = new Schema<IVerificationApplication>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["individual", "business"], required: true },
    governmentId: { type: String, required: true },
    businessDocuments: [{ type: String }],
    phone: { type: String, required: true },
    email: { type: String },
    profilePicture: { type: String, required: true },
    logo: { type: String },
    businessAddress: { type: String },
    socialLinks: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export default (mongoose.models
  .VerificationApplication as Model<IVerificationApplication>) ||
  mongoose.model<IVerificationApplication>(
    "VerificationApplication",
    VerificationApplicationSchema
  );
