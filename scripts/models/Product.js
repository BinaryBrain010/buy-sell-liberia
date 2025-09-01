"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var customFieldValueSchema = new mongoose_1.Schema({
    fieldName: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
}, { _id: false });
var imageSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: true,
    },
    alt: String,
    isPrimary: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { _id: true });
var viewHistorySchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    viewed_at: {
        type: Date,
        default: Date.now,
    },
    ip_address: String,
}, { _id: false });
var productDetailsSchema = new mongoose_1.Schema({
    condition: {
        type: String,
        enum: ["new", "used", "refurbished"],
    },
    brand: String,
    model: String,
    year: Number,
    warranty: Boolean,
    warrantyPeriod: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: String,
    },
    weight: {
        value: Number,
        unit: String,
    },
}, { _id: false });
var productSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subcategory_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "USD",
            enum: ["PKR", "USD", "EUR", "GBP"],
        },
        negotiable: {
            type: Boolean,
            default: true,
        },
    },
    location: {
        city: {
            type: String,
            required: true,
        },
        state: String,
        country: {
            type: String,
            default: "Liberia",
        },
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    contact: {
        phone: String,
        whatsapp: String,
        email: String,
        preferredMethod: {
            type: String,
            enum: ["phone", "whatsapp", "email"],
            default: "phone",
        },
    },
    details: {
        type: productDetailsSchema,
        default: function () { return ({}); },
    },
    images: {
        type: [imageSchema],
        validate: {
            validator: function (images) { return images.length <= 10 && images.length > 0; },
            message: "Product must have 1-10 images",
        },
    },
    customFields: [customFieldValueSchema],
    status: {
        type: String,
        enum: ["active", "sold", "expired", "removed", "pending"],
        default: "active",
    },
    listingType: {
        type: String,
        enum: ["sale", "rent", "service", "job"],
        default: "sale",
    },
    featured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    added_at: {
        type: Date,
        default: Date.now,
    },
    expires_at: {
        type: Date,
        default: function () { return Date.now() + 30 * 24 * 60 * 60 * 1000; },
    },
    renewed_at: Date,
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    slug: {
        type: String,
        unique: true,
        sparse: true,
    },
    viewHistory: {
        type: [viewHistorySchema],
        default: [],
    },
    searchText: String,
    reportIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Report"
        }],
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
// Create indexes for efficient queries
productSchema.index({ user_id: 1 });
productSchema.index({ category_id: 1, subcategory_id: 1 });
productSchema.index({ "location.city": 1, "location.state": 1 });
productSchema.index({ "price.amount": 1 });
productSchema.index({ status: 1, expires_at: 1 });
productSchema.index({ added_at: -1 });
productSchema.index({ searchText: "text", title: "text", description: "text" });
productSchema.index({ featured: -1, added_at: -1 });
// Pre-save middleware to generate slug and search text
productSchema.pre("save", function (next) {
    if (this.isModified("title") && !this.slug) {
        this.slug =
            this.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "") +
                "-" +
                Date.now();
    }
    var customFieldsText = this.customFields.map(function (field) { return field.value; }).join(" ");
    this.searchText = [
        this.title,
        this.description,
        this.tags.join(" "),
        customFieldsText,
        this.location.city,
        this.location.state,
        this.details.brand || "",
        this.details.model || "",
    ]
        .join(" ")
        .toLowerCase();
    next();
});
// Instance methods
productSchema.methods.isExpired = function () {
    return this.expires_at < new Date();
};
productSchema.methods.renew = function () {
    this.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.renewed_at = new Date();
    this.status = "active";
    return this.save();
};
productSchema.methods.addView = function (userId, ipAddress) {
    this.views += 1;
    this.viewHistory.unshift({
        user_id: userId,
        viewed_at: new Date(),
        ip_address: ipAddress,
    });
    if (this.viewHistory.length > 100) {
        this.viewHistory = this.viewHistory.slice(0, 100);
    }
    return this.save();
};
productSchema.methods.markAsSold = function () {
    this.status = "sold";
    return this.save();
};
productSchema.methods.getCustomField = function (fieldName) {
    var field = this.customFields.find(function (f) { return f.fieldName === fieldName; });
    return field ? field.value : null;
};
productSchema.methods.setCustomField = function (fieldName, value) {
    var existingField = this.customFields.find(function (f) { return f.fieldName === fieldName; });
    if (existingField) {
        existingField.value = value;
    }
    else {
        this.customFields.push({ fieldName: fieldName, value: value });
    }
};
productSchema.methods.markAsFeatured = function () {
    this.featured = true;
    return this.save();
};
productSchema.methods.unmarkAsFeatured = function () {
    this.featured = false;
    return this.save();
};
productSchema.methods.toggleFeatured = function () {
    this.featured = !this.featured;
    return this.save();
};
// Static methods
productSchema.statics.findActiveProducts = function (filters) {
    if (filters === void 0) { filters = {}; }
    return this.find(__assign(__assign({}, filters), { status: "active", expires_at: { $gt: new Date() } })).sort({ featured: -1, added_at: -1 });
};
productSchema.statics.findByCategory = function (categoryId, subcategoryId) {
    if (subcategoryId === void 0) { subcategoryId = null; }
    var query = {
        category_id: categoryId,
        status: "active",
        expires_at: { $gt: new Date() },
    };
    if (subcategoryId) {
        query.subcategory_id = subcategoryId;
    }
    return this.find(query).sort({ featured: -1, added_at: -1 });
};
productSchema.statics.findByUser = function (userId, includeExpired) {
    if (includeExpired === void 0) { includeExpired = false; }
    var query = { user_id: userId };
    if (!includeExpired) {
        query.status = { $ne: "removed" };
    }
    return this.find(query).sort({ added_at: -1 });
};
productSchema.statics.searchProducts = function (searchTerm, filters) {
    if (filters === void 0) { filters = {}; }
    var query = __assign({ $text: { $search: searchTerm }, status: "active", expires_at: { $gt: new Date() } }, filters);
    return this.find(query, { score: { $meta: "textScore" } }).sort({
        score: { $meta: "textScore" },
        featured: -1,
        added_at: -1,
    });
};
productSchema.statics.findExpiredProducts = function () {
    return this.find({
        status: "active",
        expires_at: { $lt: new Date() },
    });
};
productSchema.statics.autoExpireProducts = function () {
    return __awaiter(this, void 0, void 0, function () {
        var expiredProducts, _i, expiredProducts_1, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.find({
                        status: "active",
                        expires_at: { $lt: new Date() },
                    })];
                case 1:
                    expiredProducts = _a.sent();
                    _i = 0, expiredProducts_1 = expiredProducts;
                    _a.label = 2;
                case 2:
                    if (!(_i < expiredProducts_1.length)) return [3 /*break*/, 5];
                    product = expiredProducts_1[_i];
                    product.status = "expired";
                    return [4 /*yield*/, product.save()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, expiredProducts.length];
            }
        });
    });
};
productSchema.statics.findFeaturedProducts = function (limit, filters) {
    if (limit === void 0) { limit = 10; }
    if (filters === void 0) { filters = {}; }
    return this.find(__assign(__assign({}, filters), { featured: true, status: "active", expires_at: { $gt: new Date() } }))
        .sort({ added_at: -1 })
        .limit(limit);
};
productSchema.statics.findFeaturedByCategory = function (categoryId, limit, subcategoryId) {
    if (limit === void 0) { limit = 5; }
    if (subcategoryId === void 0) { subcategoryId = null; }
    var query = {
        category_id: categoryId,
        featured: true,
        status: "active",
        expires_at: { $gt: new Date() },
    };
    if (subcategoryId) {
        query.subcategory_id = subcategoryId;
    }
    return this.find(query).sort({ added_at: -1 }).limit(limit);
};
productSchema.statics.findRelatedProducts = function (productId, categoryId, limit) {
    if (limit === void 0) { limit = 6; }
    return this.find({
        _id: { $ne: productId },
        category_id: categoryId,
        status: "active",
        expires_at: { $gt: new Date() },
    })
        .sort({ featured: -1, added_at: -1 })
        .limit(limit);
};
productSchema.statics.getFeaturedCount = function () {
    return this.countDocuments({
        featured: true,
        status: "active",
        expires_at: { $gt: new Date() },
    });
};
// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
    var currency = this.price.currency === "USD" ? "Rs." : this.price.currency;
    return "".concat(currency, " ").concat(this.price.amount.toLocaleString()).concat(this.price.negotiable ? " (Negotiable)" : "");
});
// Virtual for time ago
productSchema.virtual("timeAgo").get(function () {
    var _a, _b;
    var now = new Date();
    var diffTime = Math.abs(now.getTime() - ((_b = (_a = this.added_at) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : now.getTime()));
    var diffSeconds = Math.floor(diffTime / 1000);
    var diffMinutes = Math.floor(diffSeconds / 60);
    var diffHours = Math.floor(diffMinutes / 60);
    var diffDays = Math.floor(diffHours / 24);
    if (diffSeconds < 60) {
        return "".concat(diffSeconds, " second").concat(diffSeconds === 1 ? "" : "s", " ago");
    }
    if (diffMinutes < 60) {
        return "".concat(diffMinutes, " minute").concat(diffMinutes === 1 ? "" : "s", " ago");
    }
    if (diffHours < 24) {
        return "".concat(diffHours, " hour").concat(diffHours === 1 ? "" : "s", " ago");
    }
    if (diffDays === 1) {
        return "1 day ago";
    }
    if (diffDays < 7) {
        return "".concat(diffDays, " days ago");
    }
    if (diffDays < 30) {
        return "".concat(Math.floor(diffDays / 7), " weeks ago");
    }
    return "".concat(Math.floor(diffDays / 30), " months ago");
});
// Ensure virtual fields are serialized
productSchema.set("toJSON", {
    virtuals: true,
});
// Use the existing model if it exists, otherwise create a new one
var Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", productSchema);
exports.default = Product;
