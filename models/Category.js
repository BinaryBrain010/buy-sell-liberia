const mongoose = require('mongoose');

// Custom field schema for category-specific fields
const customFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'select', 'boolean', 'textarea', 'date']
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String
  }], // For select fields
  placeholder: String,
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    minLength: Number,
    maxLength: Number
  }
}, { _id: true });

// Subcategory schema
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  customFields: [customFieldSchema]
}, { _id: true });

// Main category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  subcategories: [subcategorySchema]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ 'subcategories.slug': 1 });
categorySchema.index({ sortOrder: 1 });

// Methods
categorySchema.methods.getSubcategory = function(subcategoryId) {
  return this.subcategories.id(subcategoryId);
};

categorySchema.methods.getSubcategoryBySlug = function(slug) {
  return this.subcategories.find(sub => sub.slug === slug);
};

// Static methods
categorySchema.statics.findActiveCategories = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, isActive: true });
};

module.exports = mongoose.model('Category', categorySchema);
