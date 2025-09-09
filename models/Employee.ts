import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  department?: string;
  role:
    | "super_admin"
    | "manager"
    | "listings_moderator"
    | "payment_officer"
    | "support_agent"
    | "analytics_assistant";
  createdAt: Date;
}

const employeeSchema = new Schema<IEmployee>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  department: { type: String },
  role: {
    type: String,
    enum: [
      "super_admin",
      "manager",
      "listings_moderator",
      "payment_officer",
      "support_agent",
      "analytics_assistant",
    ],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Employee: Model<IEmployee> =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", employeeSchema);
export default Employee;
