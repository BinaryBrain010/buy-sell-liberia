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
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var reviewSchema = new mongoose_1.Schema({
    reviewer_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reviewed_user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    transactionType: {
        type: String,
        enum: ["purchase", "sale", "service"],
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isReported: {
        type: Boolean,
        default: false,
    },
    reportReason: {
        type: String,
        enum: ["spam", "inappropriate", "fake", "other"],
    },
    isHidden: {
        type: Boolean,
        default: false,
    },
    adminNotes: String,
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
// Create indexes
reviewSchema.index({ reviewer_id: 1 });
reviewSchema.index({ reviewed_user_id: 1 });
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ created_at: -1 });
reviewSchema.index({ reviewer_id: 1, product_id: 1 }, { unique: true });
// Instance methods
reviewSchema.methods.report = function (reason) {
    this.isReported = true;
    this.reportReason = reason;
    return this.save();
};
reviewSchema.methods.verify = function () {
    this.isVerified = true;
    return this.save();
};
reviewSchema.methods.hide = function (adminNotes) {
    this.isHidden = true;
    this.adminNotes = adminNotes;
    return this.save();
};
// Static methods
reviewSchema.statics.findByUser = function (userId) {
    return this.find({ reviewed_user_id: userId, isHidden: false })
        .populate("reviewer_id", "firstName lastName profile.displayName profile.avatar")
        .populate("product_id", "title slug images")
        .sort({ created_at: -1 });
};
reviewSchema.statics.findByReviewer = function (reviewerId) {
    return this.find({ reviewer_id: reviewerId, isHidden: false })
        .populate("reviewed_user_id", "firstName lastName profile.displayName profile.avatar")
        .populate("product_id", "title slug images")
        .sort({ created_at: -1 });
};
reviewSchema.statics.getAverageRating = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.aggregate([
                        {
                            $match: {
                                reviewed_user_id: new mongoose_1.default.Types.ObjectId(userId),
                                isHidden: false,
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                averageRating: { $avg: "$rating" },
                                totalReviews: { $sum: 1 },
                            },
                        },
                    ])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 }];
            }
        });
    });
};
reviewSchema.statics.findReportedReviews = function () {
    return this.find({ isReported: true, isHidden: false })
        .populate("reviewer_id", "firstName lastName email")
        .populate("reviewed_user_id", "firstName lastName email")
        .populate("product_id", "title")
        .sort({ created_at: -1 });
};
// Use the existing model if it exists, otherwise create a new one
var Review = mongoose_1.default.models.Review || mongoose_1.default.model("Review", reviewSchema);
exports.default = Review;
