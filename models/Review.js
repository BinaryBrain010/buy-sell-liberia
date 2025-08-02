const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewed_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Review context
  transactionType: {
    type: String,
    enum: ['purchase', 'sale', 'service'],
    required: true
  },
  
  // Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'fake', 'other']
  },
  
  // Admin actions
  isHidden: {
    type: Boolean,
    default: false
  },
  adminNotes: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
reviewSchema.index({ reviewer_id: 1 });
reviewSchema.index({ reviewed_user_id: 1 });
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ created_at: -1 });

// Prevent duplicate reviews for same product by same user
reviewSchema.index({ reviewer_id: 1, product_id: 1 }, { unique: true });

// Instance methods
reviewSchema.methods.report = function(reason) {
  this.isReported = true;
  this.reportReason = reason;
  return this.save();
};

reviewSchema.methods.verify = function() {
  this.isVerified = true;
  return this.save();
};

reviewSchema.methods.hide = function(adminNotes) {
  this.isHidden = true;
  this.adminNotes = adminNotes;
  return this.save();
};

// Static methods
reviewSchema.statics.findByUser = function(userId) {
  return this.find({ reviewed_user_id: userId, isHidden: false })
    .populate('reviewer_id', 'firstName lastName profile.displayName profile.avatar')
    .populate('product_id', 'title slug images')
    .sort({ created_at: -1 });
};

reviewSchema.statics.findByReviewer = function(reviewerId) {
  return this.find({ reviewer_id: reviewerId, isHidden: false })
    .populate('reviewed_user_id', 'firstName lastName profile.displayName profile.avatar')
    .populate('product_id', 'title slug images')
    .sort({ created_at: -1 });
};

reviewSchema.statics.getAverageRating = async function(userId) {
  const result = await this.aggregate([
    { 
      $match: { 
        reviewed_user_id: mongoose.Types.ObjectId(userId),
        isHidden: false 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

reviewSchema.statics.findReportedReviews = function() {
  return this.find({ isReported: true, isHidden: false })
    .populate('reviewer_id', 'firstName lastName email')
    .populate('reviewed_user_id', 'firstName lastName email')
    .populate('product_id', 'title')
    .sort({ created_at: -1 });
};

module.exports = mongoose.model('Review', reviewSchema);
