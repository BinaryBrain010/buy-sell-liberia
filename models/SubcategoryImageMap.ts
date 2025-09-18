import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISubcategoryImage {
  slug: string;
  url: string;
  title?: string;
}

export interface ISubcategoryImageMap extends Document {
  key: string; // singleton key, e.g., "global"
  images: ISubcategoryImage[];
  created_at?: Date;
  updated_at?: Date;
}

const subcategoryImageSchema = new Schema<ISubcategoryImage>({
  slug: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
});

const subcategoryImageMapSchema = new Schema<ISubcategoryImageMap>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    images: [subcategoryImageSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Ensure unique slugs within the array at save time
subcategoryImageMapSchema.pre("save", function (next) {
  const slugs = this.images.map((i) => i.slug);
  if (new Set(slugs).size !== slugs.length) {
    return next(new Error("Duplicate slugs are not allowed in images mapping"));
  }
  next();
});

const SubcategoryImageMap: Model<ISubcategoryImageMap> =
  mongoose.models.SubcategoryImageMap ||
  mongoose.model<ISubcategoryImageMap>(
    "SubcategoryImageMap",
    subcategoryImageMapSchema
  );

export default SubcategoryImageMap;
