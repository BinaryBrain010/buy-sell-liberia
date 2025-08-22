import mongoose, { Document, Schema } from 'mongoose';

export type AdminRole =
  | 'super_admin'
  | 'moderator'
  | 'payment_officer'
  | 'support_agent'
  | 'custom';

export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'moderator', 'payment_officer', 'support_agent', 'custom'],
      required: true,
      default: 'custom',
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
