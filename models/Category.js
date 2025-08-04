"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var customFieldSchema = new mongoose_1.Schema({
    fieldName: {
        type: String,
        required: true,
        trim: true,
    },
    fieldType: {
        type: String,
        required: true,
        enum: ["text", "number", "select", "boolean", "textarea", "date"],
    },
    label: {
        type: String,
        required: true,
        trim: true,
    },
    required: {
        type: Boolean,
        default: false,
    },
    options: [
        {
            type: String,
            trim: true,
        },
    ],
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
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    customFields: [customFieldSchema],
}, { _id: true });
var categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    icon: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    subcategories: [subcategorySchema],
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
// Create indexes for efficient queries
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ "subcategories.slug": 1 });
categorySchema.index({ sortOrder: 1 });
// Pre-save middleware to ensure unique subcategory slugs within a category
categorySchema.pre("save", function (next) {
    var slugs = this.subcategories.map(function (sub) { return sub.slug; });
    var uniqueSlugs = new Set(slugs);
    if (slugs.length !== uniqueSlugs.size) {
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
// Ensure virtual fields are serialized
categorySchema.set("toJSON", {
    virtuals: true,
});
var Category = mongoose_1.default.model("Category", categorySchema);
exports.default = Category;
