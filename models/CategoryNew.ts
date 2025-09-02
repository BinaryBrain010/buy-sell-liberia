import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, required: true }, // path to icon image
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Auto-increment sortOrder before saving (always after the highest sortOrder)
categorySchema.pre('save', async function (next) {
  if (this.isNew) {
    const max = await mongoose.models.Category.findOne({}, {}, { sort: { sortOrder: -1 } });
    this.sortOrder = max && max.sortOrder ? max.sortOrder + 1 : 1;
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
