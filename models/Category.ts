import mongoose, { Document, Model, Schema } from "mongoose";

// ====================== Custom Field ======================
export interface ICustomField {
  fieldName: string;
  fieldType: "text" | "number" | "select" | "boolean" | "textarea" | "date";
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  _id?: mongoose.Types.ObjectId;
}

const customFieldSchema = new Schema<ICustomField>(
  {
    fieldName: { type: String, required: true, trim: true },
    fieldType: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "boolean", "textarea", "date"],
    },
    label: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: [{ type: String, trim: true }],
    placeholder: String,
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      minLength: Number,
      maxLength: Number,
    },
  },
  { _id: true }
);

// ====================== Subcategory ======================
export interface ISubcategory {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  customFields?: ICustomField[];
  products?: any[];
  _id?: mongoose.Types.ObjectId;
}

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    customFields: [customFieldSchema],
  },
  { _id: true }
);

// ====================== Category ======================
export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  subcategories: ISubcategory[];
  created_at?: Date;
  updated_at?: Date;
  getSubcategory(subcategoryId: mongoose.Types.ObjectId): ISubcategory | undefined;
  getSubcategoryBySlug(slug: string): ISubcategory | undefined;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, trim: true, index: true },
    icon: { type: String, required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    subcategories: [subcategorySchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
categorySchema.index({ "subcategories.slug": 1 });
categorySchema.index({ sortOrder: 1 });

// Middleware: Unique subcategory slugs
categorySchema.pre<ICategory>("save", function (next) {
  const slugs = this.subcategories.map((sub) => sub.slug);
  if (new Set(slugs).size !== slugs.length) {
    return next(new Error("Subcategory slugs must be unique within a category"));
  }
  next();
});

// Instance methods
categorySchema.methods.getSubcategory = function (
  subcategoryId: mongoose.Types.ObjectId
): ISubcategory | undefined {
  return this.subcategories.find(
    (sub: ISubcategory) => sub._id?.toString() === subcategoryId.toString()
  );
};

categorySchema.methods.getSubcategoryBySlug = function (
  slug: string
): ISubcategory | undefined {
  return this.subcategories.find((sub: ISubcategory) => sub.slug === slug);
};

// Static methods
categorySchema.statics.findActiveCategories = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

// Serialize virtuals
categorySchema.set("toJSON", { virtuals: true });

// ✅ Prevent model overwrite (critical for Next.js dev)
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
