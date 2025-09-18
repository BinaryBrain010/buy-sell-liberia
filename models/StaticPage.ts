import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStaticPage extends Document {
  slug: string; // 'about', 'privacy', 'terms', 'faq', 'help'
  title: string;
  content: string; // HTML or markdown stored as string (optional if 'data' provided)
  data?: any; // Optional structured JSON for page-specific layouts
  updatedAt: Date;
  createdAt: Date;
}

const StaticPageSchema = new Schema<IStaticPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    // Allow content to be empty string if 'data' is provided. We'll enforce
    // "content or data" at the document level with a custom validator.
    content: { type: String, required: false, default: "" },
    data: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

// Ensure that at least one of 'content' or 'data' is provided
StaticPageSchema.pre("validate", function (next) {
  const doc = this as IStaticPage;
  const hasContent =
    typeof doc.content === "string" && doc.content.trim().length > 0;
  const hasData = doc.data !== undefined && doc.data !== null;
  if (!hasContent && !hasData) {
    // Mark validation error on 'content' path for a clear message
    (this as any).invalidate(
      "content",
      "Either 'content' (non-empty string) or 'data' (object) is required"
    );
  }
  next();
});

const StaticPage: Model<IStaticPage> =
  mongoose.models.StaticPage ||
  mongoose.model<IStaticPage>("StaticPage", StaticPageSchema);

export default StaticPage;
