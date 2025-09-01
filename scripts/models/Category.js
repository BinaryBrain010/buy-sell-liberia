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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var customFieldSchema = new mongoose_1.Schema({
    fieldName: { type: String, required: true, trim: true },
    fieldType: {
        type: String,
        required: true,
        enum: ["text", "number", "select", "boolean", "textarea", "date"],
    },
    label: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: [{ type: String, trim: true }],
    placeholder: String,
    validation: {
        min: Number,
        max: Number,
        pattern: String,
        minLength: Number,
        maxLength: Number,
    },
}, { _id: true });
var subcategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    customFields: [customFieldSchema],
}, { _id: true });
var categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, trim: true, index: true },
    icon: { type: String, required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    subcategories: [subcategorySchema],
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
// Indexes
categorySchema.index({ "subcategories.slug": 1 });
categorySchema.index({ sortOrder: 1 });
// Middleware: Unique subcategory slugs
categorySchema.pre("save", function (next) {
    var slugs = this.subcategories.map(function (sub) { return sub.slug; });
    if (new Set(slugs).size !== slugs.length) {
        return next(new Error("Subcategory slugs must be unique within a category"));
    }
    next();
});
// Instance methods
categorySchema.methods.getSubcategory = function (subcategoryId) {
    return this.subcategories.find(function (sub) { var _a; return ((_a = sub._id) === null || _a === void 0 ? void 0 : _a.toString()) === subcategoryId.toString(); });
};
categorySchema.methods.getSubcategoryBySlug = function (slug) {
    return this.subcategories.find(function (sub) { return sub.slug === slug; });
};
// Static methods
categorySchema.statics.findActiveCategories = function () {
    return this.find({ isActive: true }).sort({ sortOrder: 1 });
};
categorySchema.statics.findBySlug = function (slug) {
    return this.findOne({ slug: slug, isActive: true });
};
// Serialize virtuals
categorySchema.set("toJSON", { virtuals: true });
// ✅ Prevent model overwrite (critical for Next.js dev)
var Category = mongoose_1.default.models.Category || mongoose_1.default.model("Category", categorySchema);
exports.default = Category;
