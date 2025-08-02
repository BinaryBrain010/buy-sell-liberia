const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Liked product schema
const likedProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  liked_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// User profile schema
const profileSchema = new mongoose.Schema({
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  avatar: {
    type: String,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'phone_verified', 'email_verified', 'fully_verified'],
    default: 'unverified'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, { _id: false });

// User preferences schema
const preferencesSchema = new mongoose.Schema({
  defaultLocation: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Pakistan'
    }
  },
  notifications: {
    emailUpdates: {
      type: Boolean,
      default: true
    },
    smsUpdates: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  }
}, { _id: false });

// Activity tracking schema
const activitySchema = new mongoose.Schema({
  totalListings: {
    type: Number,
    default: 0
  },
  activeListings: {
    type: Number,
    default: 0
  },
  soldItems: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Main user schema
const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Marketplace specific fields
  profile: {
    type: profileSchema,
    default: () => ({})
  },
  
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  
  activity: {
    type: activitySchema,
    default: () => ({})
  },
  
  // Liked products
  likedProducts: {
    type: [likedProductSchema],
    default: []
  },
  
  // Social features
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Verification tokens
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationToken: String,
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Login tracking
  lastLoginAt: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ 'likedProducts.product_id': 1 });
userSchema.index({ 'activity.lastActive': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (uses profile.displayName if available, otherwise fullName)
userSchema.virtual('displayName').get(function() {
  return this.profile.displayName || this.fullName;
});

// Virtual for user stats
userSchema.virtual('stats').get(function() {
  return {
    totalListings: this.activity.totalListings,
    activeListings: this.activity.activeListings,
    soldItems: this.activity.soldItems,
    rating: this.profile.rating.average,
    reviewCount: this.profile.rating.count,
    joinedDate: this.activity.joinedDate,
    followerCount: this.followers.length,
    followingCount: this.following.length
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update verification status
userSchema.pre('save', function(next) {
  if (this.emailVerified && this.phoneVerified) {
    this.profile.verificationStatus = 'fully_verified';
  } else if (this.emailVerified) {
    this.profile.verificationStatus = 'email_verified';
  } else if (this.phoneVerified) {
    this.profile.verificationStatus = 'phone_verified';
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.likeProduct = function(productId) {
  const alreadyLiked = this.likedProducts.some(
    like => like.product_id.toString() === productId.toString()
  );
  
  if (!alreadyLiked) {
    this.likedProducts.push({
      product_id: productId,
      liked_at: new Date()
    });
  }
  
  return this.save();
};

userSchema.methods.unlikeProduct = function(productId) {
  this.likedProducts = this.likedProducts.filter(
    like => like.product_id.toString() !== productId.toString()
  );
  
  return this.save();
};

userSchema.methods.hasLikedProduct = function(productId) {
  return this.likedProducts.some(
    like => like.product_id.toString() === productId.toString()
  );
};

userSchema.methods.followUser = function(userId) {
  const alreadyFollowing = this.following.some(
    id => id.toString() === userId.toString()
  );
  
  if (!alreadyFollowing) {
    this.following.push(userId);
  }
  
  return this.save();
};

userSchema.methods.unfollowUser = function(userId) {
  this.following = this.following.filter(
    id => id.toString() !== userId.toString()
  );
  
  return this.save();
};

userSchema.methods.addFollower = function(userId) {
  const alreadyFollower = this.followers.some(
    id => id.toString() === userId.toString()
  );
  
  if (!alreadyFollower) {
    this.followers.push(userId);
  }
  
  return this.save();
};

userSchema.methods.removeFollower = function(userId) {
  this.followers = this.followers.filter(
    id => id.toString() !== userId.toString()
  );
  
  return this.save();
};

userSchema.methods.updateActivity = function(activityData) {
  Object.assign(this.activity, activityData);
  this.activity.lastActive = new Date();
  return this.save();
};

userSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.profile.rating.average * this.profile.rating.count;
  this.profile.rating.count += 1;
  this.profile.rating.average = (currentTotal + newRating) / this.profile.rating.count;
  return this.save();
};

userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function() {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return verificationToken;
};

userSchema.methods.createPhoneVerificationToken = function() {
  // Generate 6-digit code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationToken = token;
  return token;
};

userSchema.methods.recordLogin = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  this.activity.lastActive = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isBlocked: false });
};

userSchema.statics.findTopRatedUsers = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isBlocked: false,
    'profile.rating.count': { $gt: 0 }
  })
  .sort({ 'profile.rating.average': -1, 'profile.rating.count': -1 })
  .limit(limit);
};

userSchema.statics.findMostActiveUsers = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isBlocked: false 
  })
  .sort({ 
    'activity.totalListings': -1, 
    'activity.soldItems': -1 
  })
  .limit(limit);
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.emailVerificationToken;
    delete ret.phoneVerificationToken;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
