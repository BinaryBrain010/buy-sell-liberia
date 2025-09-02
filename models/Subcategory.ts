import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  icon: { type: String, required: true }, // path to icon image
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  customFields: [
    {
      fieldName: String,
      fieldType: String,
      label: String,
      required: Boolean,
      options: [String],
      placeholder: String,
      validation: Object,
    },
  ],
}, {
  timestamps: true,
});

// Auto-increment sortOrder before saving
subcategorySchema.pre('save', async function (next) {
  if (this.isNew && this.categoryId) {
    const count = await mongoose.models.Subcategory.countDocuments({ categoryId: this.categoryId });
    this.sortOrder = count + 1;
  }
  next();
});

export default mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
