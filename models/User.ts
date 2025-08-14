import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Product listing schema
type ProductListing = {
  product_id: mongoose.Types.ObjectId;
  listed_at: Date;
  status: "active" | "sold" | "draft" | "archived";
};

const productListingSchema = new Schema<ProductListing>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    listed_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "sold", "draft", "archived"],
      default: "active",
    },
  },
  { _id: false }
);

// Liked product schema
type LikedProduct = {
  product_id: mongoose.Types.ObjectId;
  liked_at: Date;
};

const likedProductSchema = new Schema<LikedProduct>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    liked_at: {
      type: Date,
      default: Date.now,
    },
  }, 
  { _id: false }
);

// User profile schema
type Rating = {
  average: number;
  count: number;
};

type Profile = {
  displayName?: string;
  bio?: string;
  avatar?: string | null;
  verificationStatus:
    | "unverified"
    | "phone_verified"
    | "email_verified"
    | "fully_verified";
  rating: Rating;
};

const profileSchema = new Schema<Profile>(
  {
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: [
        "unverified",
        "phone_verified",
        "email_verified",
        "fully_verified",
      ],
      default: "unverified",
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { _id: false }
);

// User preferences schema
type Preferences = {
  defaultLocation?: {
    city?: string;
    state?: string;
    country?: string;
  };
  notifications?: {
    emailUpdates?: boolean;
    smsUpdates?: boolean;
    pushNotifications?: boolean;
  };
};

const preferencesSchema = new Schema<Preferences>(
  {
    defaultLocation: {
      city: String,
      state: String,
      country: {
        type: String,
        default: "Pakistan",
      },
    },
    notifications: {
      emailUpdates: {
        type: Boolean,
        default: true,
      },
      smsUpdates: {
        type: Boolean,
        default: false,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { _id: false }
);

// Activity tracking schema
type Activity = {
  totalListings: number;
  activeListings: number;
  soldItems: number;
  joinedDate: Date;
  lastActive: Date;
};

const activitySchema = new Schema<Activity>(
  {
    totalListings: {
      type: Number,
      default: 0,
    },
    activeListings: {
      type: Number,
      default: 0,
    },
    soldItems: {
      type: Number,
      default: 0,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main user schema interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  profile: Profile;
  preferences: Preferences;
  activity: Activity;
  listedProducts: ProductListing[];
  likedProducts: LikedProduct[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  isActive: boolean;
  isBlocked: boolean;
  emailVerificationToken?: string;
  emailVerified: boolean;
  phoneVerificationToken?: string;
  phoneVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  loginCount: number;
  fullName?: string;
  displayName?: string;
  stats?: any;
  comparePassword(candidatePassword: string): Promise<boolean>;
  addProductListing(productId: mongoose.Types.ObjectId, status?: ProductListing["status"]): Promise<IUser>;
  updateProductListingStatus(productId: mongoose.Types.ObjectId, status: ProductListing["status"]): Promise<IUser>;
  likeProduct(productId: mongoose.Types.ObjectId): Promise<IUser>;
  unlikeProduct(productId: mongoose.Types.ObjectId): Promise<IUser>;
  hasLikedProduct(productId: mongoose.Types.ObjectId): boolean;
  followUser(userId: mongoose.Types.ObjectId): Promise<IUser>;
  unfollowUser(userId: mongoose.Types.ObjectId): Promise<IUser>;
  addFollower(userId: mongoose.Types.ObjectId): Promise<IUser>;
  removeFollower(userId: mongoose.Types.ObjectId): Promise<IUser>;
  updateActivity(activityData: Partial<Activity>): Promise<IUser>;
  updateRating(newRating: number): Promise<IUser>;
  generatePasswordResetToken(): string;
  createEmailVerificationToken(): string;
  createPhoneVerificationToken(): string;
  recordLogin(): Promise<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    // Basic Information
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    // Marketplace specific fields
    profile: {
      type: profileSchema,
      default: () => ({}),
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    activity: {
      type: activitySchema,
      default: () => ({}),
    },
    // Listed products
    listedProducts: {
      type: [productListingSchema],
      default: [],
    },
    // Liked products
    likedProducts: {
      type: [likedProductSchema],
      default: [],
    },
    // Social features
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Verification tokens
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationToken: String,
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Login tracking
    lastLoginAt: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ "listedProducts.product_id": 1 });
userSchema.index({ "likedProducts.product_id": 1 });
userSchema.index({ "activity.lastActive": -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (uses profile.displayName if available, otherwise fullName)
userSchema.virtual("displayName").get(function (this: IUser) {
  return this.profile.displayName || this.fullName;
});

// Virtual for user stats
userSchema.virtual("stats").get(function (this: IUser) {
  return {
    totalListings: this.activity.totalListings,
    activeListings: this.activity.activeListings,
    soldItems: this.activity.soldItems,
    rating: this.profile.rating.average,
    reviewCount: this.profile.rating.count,
    joinedDate: this.activity.joinedDate,
    followerCount: this.followers.length,
    followingCount: this.following.length,
  };
});

// Pre-save middleware to hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update verification status
userSchema.pre<IUser>("save", function (next) {
  if (this.emailVerified && this.phoneVerified) {
    this.profile.verificationStatus = "fully_verified";
  } else if (this.emailVerified) {
    this.profile.verificationStatus = "email_verified";
  } else if (this.phoneVerified) {
    this.profile.verificationStatus = "phone_verified";
  }
  next();
});

// Pre-save middleware to update activity counts
userSchema.pre<IUser>("save", function (next) {
  this.activity.totalListings = this.listedProducts.length;
  this.activity.activeListings = this.listedProducts.filter(
    (listing: ProductListing) => listing.status === "active"
  ).length;
  this.activity.soldItems = this.listedProducts.filter(
    (listing: ProductListing) => listing.status === "sold"
  ).length;
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addProductListing = function (
  productId: mongoose.Types.ObjectId,
  status: ProductListing["status"] = "active"
): Promise<IUser> {
  const alreadyListed = this.listedProducts.some(
    (listing: ProductListing) => listing.product_id.toString() === productId.toString()
  );
  if (!alreadyListed) {
    this.listedProducts.push({
      product_id: productId,
      listed_at: new Date(),
      status,
    });
  }
  return this.save();
};

userSchema.methods.updateProductListingStatus = function (
  productId: mongoose.Types.ObjectId,
  status: ProductListing["status"]
): Promise<IUser> {
  const listing = this.listedProducts.find(
    (listing: ProductListing) => listing.product_id.toString() === productId.toString()
  );
  if (listing) {
    listing.status = status;
  }
  return this.save();
};

userSchema.methods.likeProduct = function (
  productId: mongoose.Types.ObjectId
): Promise<IUser> {
  const alreadyLiked = this.likedProducts.some(
    (like: LikedProduct) => like.product_id.toString() === productId.toString()
  );
  if (!alreadyLiked) {
    this.likedProducts.push({
      product_id: productId,
      liked_at: new Date(),
    });
  }
  return this.save();
};

userSchema.methods.unlikeProduct = function (
  productId: mongoose.Types.ObjectId
): Promise<IUser> {
  this.likedProducts = this.likedProducts.filter(
    (like: LikedProduct) => like.product_id.toString() !== productId.toString()
  );
  return this.save();
};

userSchema.methods.hasLikedProduct = function (
  productId: mongoose.Types.ObjectId
): boolean {
  return this.likedProducts.some(
    (like: LikedProduct) => like.product_id.toString() === productId.toString()
  );
};

userSchema.methods.followUser = function (
  userId: mongoose.Types.ObjectId
): Promise<IUser> {
  const alreadyFollowing = this.following.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );
  if (!alreadyFollowing) {
    this.following.push(userId);
  }
  return this.save();
};

userSchema.methods.unfollowUser = function (
  userId: mongoose.Types.ObjectId
): Promise<IUser> {
  this.following = this.following.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
  );
  return this.save();
};

userSchema.methods.addFollower = function (
  userId: mongoose.Types.ObjectId
): Promise<IUser> {
  const alreadyFollower = this.followers.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
  );
  if (!alreadyFollower) {
    this.followers.push(userId);
  }
  return this.save();
};

userSchema.methods.removeFollower = function (
  userId: mongoose.Types.ObjectId
): Promise<IUser> {
  this.followers = this.followers.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
  );
  return this.save();
};

userSchema.methods.updateActivity = function (
  activityData: Partial<Activity>
): Promise<IUser> {
  Object.assign(this.activity, activityData);
  this.activity.lastActive = new Date();
  return this.save();
};

userSchema.methods.updateRating = function (newRating: number): Promise<IUser> {
  const currentTotal = this.profile.rating.average * this.profile.rating.count;
  this.profile.rating.count += 1;
  this.profile.rating.average =
    (currentTotal + newRating) / this.profile.rating.count;
  return this.save();
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  return verificationToken;
};

userSchema.methods.createPhoneVerificationToken = function (): string {
  // Generate 6-digit code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationToken = token;
  return token;
};

userSchema.methods.recordLogin = function (): Promise<IUser> {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  this.activity.lastActive = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByPhone = function (phone: string) {
  return this.findOne({ phone });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isBlocked: false });
};

userSchema.statics.findTopRatedUsers = function (limit: number = 10) {
  return this.find({
    isActive: true,
    isBlocked: false,
    "profile.rating.count": { $gt: 0 },
  })
    .sort({ "profile.rating.average": -1, "profile.rating.count": -1 })
    .limit(limit);
};

userSchema.statics.findMostActiveUsers = function (limit: number = 10) {
  return this.find({
    isActive: true,
    isBlocked: false,
  })
    .sort({
      "activity.totalListings": -1,
      "activity.soldItems": -1,
    })
    .limit(limit);
};

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as Partial<typeof ret>).password;
    delete (ret as Partial<typeof ret>).passwordResetToken;
    delete (ret as Partial<typeof ret>).emailVerificationToken;
    delete (ret as Partial<typeof ret>).phoneVerificationToken;
    return ret;
  },
});

// Use the existing model if it exists, otherwise create a new one
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;