import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaticPage extends Document {
  slug: string; // 'about', 'privacy', 'terms', 'faq', 'help'
  title: string;
  content: string; // HTML or markdown stored as string
  data?: any; // Optional structured JSON for page-specific layouts
  updatedAt: Date;
  createdAt: Date;
}

const StaticPageSchema = new Schema<IStaticPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

const StaticPage: Model<IStaticPage> =
  mongoose.models.StaticPage || mongoose.model<IStaticPage>("StaticPage", StaticPageSchema);

export default StaticPage;


