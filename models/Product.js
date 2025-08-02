const mongoose = require('mongoose');

// Custom field values schema
const customFieldValueSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can store string, number, boolean, etc.
    required: true
  }
}, { _id: false });

// Image schema
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  alt: String,
  isPrimary: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

// View history schema
const viewHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewed_at: {
    type: Date,
    default: Date.now
  },
  ip_address: String
}, { _id: false });

// Main product schema
const productSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Pricing & Location
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'PKR',
      enum: ['PKR', 'USD', 'EUR', 'GBP']
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      default: 'Pakistan'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact Information
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    preferredMethod: {
      type: String,
      enum: ['phone', 'whatsapp', 'email'],
      default: 'phone'
    }
  },
  
  // Media (Max 10 images)
  images: {
    type: [imageSchema],
    validate: {
      validator: function(images) {
        return images.length <= 10 && images.length > 0;
      },
      message: 'Product must have 1-10 images'
    }
  },
  
  // Category-specific dynamic fields
  customFields: [customFieldValueSchema],
  
  // Status & Management
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'removed', 'pending'],
    default: 'active'
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent', 'service', 'job'],
    default: 'sale'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Timing
  expires_at: {
    type: Date,
    default: function() {
      return Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  renewed_at: Date,
  
  // SEO & Search
  tags: [{
    type: String,
    trim: true
  }],
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Analytics
  viewHistory: {
    type: [viewHistorySchema],
    default: []
  },
  
  // Search text (computed field)
  searchText: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes for efficient queries
productSchema.index({ user_id: 1 });
productSchema.index({ category_id: 1, subcategory_id: 1 });
productSchema.index({ 'location.city': 1, 'location.state': 1 });
productSchema.index({ 'price.amount': 1 });
productSchema.index({ status: 1, expires_at: 1 });
productSchema.index({ created_at: -1 });
productSchema.index({ searchText: 'text', title: 'text', description: 'text' });
productSchema.index({ featured: -1, created_at: -1 });

// Pre-save middleware to generate slug and search text
productSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-') + '-' + Date.now();
  }
  
  // Generate search text
  const customFieldsText = this.customFields
    .map(field => field.value)
    .join(' ');
  
  this.searchText = [
    this.title,
    this.description,
    this.tags.join(' '),
    customFieldsText,
    this.location.city,
    this.location.state
  ].join(' ').toLowerCase();
  
  next();
});

// Instance methods
productSchema.methods.isExpired = function() {
  return this.expires_at < new Date();
};

productSchema.methods.renew = function() {
  this.expires_at = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
  this.renewed_at = new Date();
  this.status = 'active';
  return this.save();
};

productSchema.methods.addView = function(userId, ipAddress) {
  this.views += 1;
  
  // Add to view history (keep last 100 views)
  this.viewHistory.unshift({
    user_id: userId,
    viewed_at: new Date(),
    ip_address: ipAddress
  });
  
  if (this.viewHistory.length > 100) {
    this.viewHistory = this.viewHistory.slice(0, 100);
  }
  
  return this.save();
};

productSchema.methods.markAsSold = function() {
  this.status = 'sold';
  return this.save();
};

productSchema.methods.getCustomField = function(fieldName) {
  const field = this.customFields.find(f => f.fieldName === fieldName);
  return field ? field.value : null;
};

productSchema.methods.setCustomField = function(fieldName, value) {
  const existingField = this.customFields.find(f => f.fieldName === fieldName);
  if (existingField) {
    existingField.value = value;
  } else {
    this.customFields.push({ fieldName, value });
  }
};

// Static methods
productSchema.statics.findActiveProducts = function(filters = {}) {
  return this.find({
    ...filters,
    status: 'active',
    expires_at: { $gt: new Date() }
  }).sort({ featured: -1, created_at: -1 });
};

productSchema.statics.findByCategory = function(categoryId, subcategoryId = null) {
  const query = {
    category_id: categoryId,
    status: 'active',
    expires_at: { $gt: new Date() }
  };
  
  if (subcategoryId) {
    query.subcategory_id = subcategoryId;
  }
  
  return this.find(query).sort({ featured: -1, created_at: -1 });
};

productSchema.statics.findByUser = function(userId, includeExpired = false) {
  const query = { user_id: userId };
  
  if (!includeExpired) {
    query.status = { $ne: 'removed' };
  }
  
  return this.find(query).sort({ created_at: -1 });
};

productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active',
    expires_at: { $gt: new Date() },
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, featured: -1, created_at: -1 });
};

productSchema.statics.findExpiredProducts = function() {
  return this.find({
    status: 'active',
    expires_at: { $lt: new Date() }
  });
};

productSchema.statics.autoExpireProducts = async function() {
  const expiredProducts = await this.findExpiredProducts();
  
  for (const product of expiredProducts) {
    product.status = 'expired';
    await product.save();
  }
  
  return expiredProducts.length;
};

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  const currency = this.price.currency === 'PKR' ? 'Rs.' : this.price.currency;
  return `${currency} ${this.price.amount.toLocaleString()}${this.price.negotiable ? ' (Negotiable)' : ''}`;
});

// Virtual for time ago
productSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.created_at);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
});

module.exports = mongoose.model('Product', productSchema);
