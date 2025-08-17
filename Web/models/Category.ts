import mongoose, { Document, Model, Schema } from "mongoose";

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
    fieldName: {
      type: String,
      required: true,
    },
    fieldType: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "boolean", "textarea", "date"],
    },
    label: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        type: String,
      },
    ],
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

export interface ISubcategory {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  customFields?: ICustomField[];
  _id?: mongoose.Types.ObjectId;
}

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    customFields: [customFieldSchema],
  },
  { _id: true }
);

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
  getSubcategory(
    subcategoryId: mongoose.Types.ObjectId
  ): ISubcategory | undefined;
  getSubcategoryBySlug(slug: string): ISubcategory | undefined;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    subcategories: [subcategorySchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ "subcategories.slug": 1 });
categorySchema.index({ sortOrder: 1 });

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

categorySchema.statics.findActiveCategories = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug: slug, isActive: true });
};

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  categorySchema
);
export default Category;
