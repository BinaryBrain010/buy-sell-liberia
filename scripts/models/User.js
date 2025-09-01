"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var crypto_1 = __importDefault(require("crypto"));
var productListingSchema = new mongoose_1.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { _id: false });
var likedProductSchema = new mongoose_1.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    liked_at: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
var profileSchema = new mongoose_1.Schema({
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
}, { _id: false });
var preferencesSchema = new mongoose_1.Schema({
    defaultLocation: {
        city: String,
        state: String,
        country: {
            type: String,
            default: "Liberia",
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
}, { _id: false });
var activitySchema = new mongoose_1.Schema({
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
}, { _id: false });
var userSchema = new mongoose_1.Schema({
    // Basic Information
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
        unique: true,
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
        default: function () { return ({}); },
    },
    preferences: {
        type: preferencesSchema,
        default: function () { return ({}); },
    },
    activity: {
        type: activitySchema,
        default: function () { return ({}); },
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
    // Account status
    isActive: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    // Ban management
    isBanned: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
        default: null,
    },
    bannedAt: {
        type: Date,
        default: null,
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
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ "listedProducts.product_id": 1 });
userSchema.index({ "likedProducts.product_id": 1 });
userSchema.index({ "activity.lastActive": -1 });
// Pre-save middleware to hash password
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified("password"))
                        return [2 /*return*/, next()];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                case 2:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcryptjs_1.default.hash(this.password, salt)];
                case 3:
                    _a.password = _b.sent();
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
});
// Pre-save middleware to update verification status
userSchema.pre("save", function (next) {
    if (this.emailVerified && this.phoneVerified) {
        this.profile.verificationStatus = "fully_verified";
    }
    else if (this.emailVerified) {
        this.profile.verificationStatus = "email_verified";
    }
    else if (this.phoneVerified) {
        this.profile.verificationStatus = "phone_verified";
    }
    next();
});
// Pre-save middleware to update activity counts
userSchema.pre("save", function (next) {
    this.activity.totalListings = this.listedProducts.length;
    this.activity.activeListings = this.listedProducts.filter(function (listing) { return listing.status === "active"; }).length;
    this.activity.soldItems = this.listedProducts.filter(function (listing) { return listing.status === "sold"; }).length;
    next();
});
// Instance methods
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.compare(candidatePassword, this.password)];
        });
    });
};
userSchema.methods.addProductListing = function (productId, status) {
    if (status === void 0) { status = "active"; }
    var alreadyListed = this.listedProducts.some(function (listing) { return listing.product_id.toString() === productId.toString(); });
    if (!alreadyListed) {
        this.listedProducts.push({
            product_id: productId,
            listed_at: new Date(),
            status: status,
        });
    }
    return this.save();
};
userSchema.methods.updateProductListingStatus = function (productId, status) {
    var listing = this.listedProducts.find(function (listing) { return listing.product_id.toString() === productId.toString(); });
    if (listing) {
        listing.status = status;
    }
    return this.save();
};
userSchema.methods.likeProduct = function (productId) {
    var alreadyLiked = this.likedProducts.some(function (like) { return like.product_id.toString() === productId.toString(); });
    if (!alreadyLiked) {
        this.likedProducts.push({
            product_id: productId,
            liked_at: new Date(),
        });
    }
    return this.save();
};
userSchema.methods.unlikeProduct = function (productId) {
    this.likedProducts = this.likedProducts.filter(function (like) { return like.product_id.toString() !== productId.toString(); });
    return this.save();
};
userSchema.methods.hasLikedProduct = function (productId) {
    return this.likedProducts.some(function (like) { return like.product_id.toString() === productId.toString(); });
};
userSchema.methods.updateActivity = function (activityData) {
    Object.assign(this.activity, activityData);
    this.activity.lastActive = new Date();
    return this.save();
};
userSchema.methods.updateRating = function (newRating) {
    var currentTotal = this.profile.rating.average * this.profile.rating.count;
    this.profile.rating.count += 1;
    this.profile.rating.average =
        (currentTotal + newRating) / this.profile.rating.count;
    return this.save();
};
userSchema.methods.generatePasswordResetToken = function () {
    var resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
userSchema.methods.createEmailVerificationToken = function () {
    var verificationToken = crypto_1.default.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto_1.default
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
    return verificationToken;
};
userSchema.methods.createPhoneVerificationToken = function () {
    // Generate 6-digit code
    var token = Math.floor(100000 + Math.random() * 900000).toString();
    this.phoneVerificationToken = token;
    return token;
};
userSchema.methods.recordLogin = function () {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    this.activity.lastActive = new Date();
    return this.save();
};
// Static methods
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
userSchema.statics.findByPhone = function (phone) {
    return this.findOne({ phone: phone });
};
userSchema.statics.findActiveUsers = function () {
    return this.find({ isActive: true, isBlocked: false });
};
userSchema.statics.findTopRatedUsers = function (limit) {
    if (limit === void 0) { limit = 10; }
    return this.find({
        isActive: true,
        isBlocked: false,
        "profile.rating.count": { $gt: 0 },
    })
        .sort({ "profile.rating.average": -1, "profile.rating.count": -1 })
        .limit(limit);
};
userSchema.statics.findMostActiveUsers = function (limit) {
    if (limit === void 0) { limit = 10; }
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
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        delete ret.phoneVerificationToken;
        return ret;
    },
});
// Use the existing model if it exists, otherwise create a new one
var User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = User;
