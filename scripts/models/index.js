"use strict";
/**
 * Database Models Index
 *
 * This file exports all the database models and provides
 * utility functions for the marketplace system.
 */
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
exports.utils = exports.models = exports.Chat = exports.Review = exports.Category = exports.ManualPayment = exports.Product = exports.User = void 0;
var User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
var Product_1 = __importDefault(require("./Product"));
exports.Product = Product_1.default;
var ManualPayment_1 = __importDefault(require("./ManualPayment"));
exports.ManualPayment = ManualPayment_1.default;
var Category_1 = __importDefault(require("./Category"));
exports.Category = Category_1.default;
var Review_1 = __importDefault(require("./Review"));
exports.Review = Review_1.default;
var Chat_1 = __importDefault(require("./Chat"));
exports.Chat = Chat_1.default;
exports.models = {
    User: User_1.default,
    Category: Category_1.default,
    Product: Product_1.default,
    Review: Review_1.default,
    Chat: Chat_1.default,
    ManualPayment: ManualPayment_1.default,
};
exports.utils = {
    /**
     * Initialize database with indexes
     */
    initializeDatabase: function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("🔧 Initializing database indexes...");
                        return [4 /*yield*/, Promise.all([
                                User_1.default.createIndexes(),
                                Category_1.default.createIndexes(),
                                Product_1.default.createIndexes(),
                                Review_1.default.createIndexes(),
                            ])];
                    case 1:
                        _a.sent();
                        console.log("✅ Database indexes initialized successfully");
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("❌ Error initializing database indexes:", error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Clean up expired products
     */
    cleanupExpiredProducts: function () {
        return __awaiter(this, void 0, void 0, function () {
            var expiredCount, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Product_1.default.autoExpireProducts()];
                    case 1:
                        expiredCount = _a.sent();
                        console.log("\uD83E\uDDF9 Cleaned up ".concat(expiredCount, " expired products"));
                        return [2 /*return*/, expiredCount];
                    case 2:
                        error_2 = _a.sent();
                        console.error("❌ Error cleaning up expired products:", error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Update user statistics
     */
    updateUserStats: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, totalListings, activeListings, soldItems, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, User_1.default.findById(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new Error("User not found");
                        return [4 /*yield*/, Product_1.default.countDocuments({ user_id: userId })];
                    case 2:
                        totalListings = _a.sent();
                        return [4 /*yield*/, Product_1.default.countDocuments({
                                user_id: userId,
                                status: "active",
                                expires_at: { $gt: new Date() },
                            })];
                    case 3:
                        activeListings = _a.sent();
                        return [4 /*yield*/, Product_1.default.countDocuments({
                                user_id: userId,
                                status: "sold",
                            })];
                    case 4:
                        soldItems = _a.sent();
                        return [4 /*yield*/, user.updateActivity({
                                totalListings: totalListings,
                                activeListings: activeListings,
                                soldItems: soldItems,
                            })];
                    case 5:
                        _a.sent();
                        console.log("\uD83D\uDCCA Updated stats for user ".concat(userId));
                        return [2 /*return*/, { totalListings: totalListings, activeListings: activeListings, soldItems: soldItems }];
                    case 6:
                        error_3 = _a.sent();
                        console.error("❌ Error updating user stats:", error_3);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get marketplace statistics
     */
    getMarketplaceStats: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, totalUsers, totalProducts, activeProducts, totalCategories, totalReviews, topCategories, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                User_1.default.countDocuments({ isActive: true }),
                                Product_1.default.countDocuments(),
                                Product_1.default.countDocuments({
                                    status: "active",
                                    expires_at: { $gt: new Date() },
                                }),
                                Category_1.default.countDocuments({ isActive: true }),
                                Review_1.default.countDocuments(),
                            ])];
                    case 1:
                        _a = _b.sent(), totalUsers = _a[0], totalProducts = _a[1], activeProducts = _a[2], totalCategories = _a[3], totalReviews = _a[4];
                        return [4 /*yield*/, Product_1.default.aggregate([
                                {
                                    $match: {
                                        status: "active",
                                        expires_at: { $gt: new Date() },
                                    },
                                },
                                {
                                    $group: {
                                        _id: "$category_id",
                                        count: { $sum: 1 },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: "categories",
                                        localField: "_id",
                                        foreignField: "_id",
                                        as: "category",
                                    },
                                },
                                { $unwind: "$category" },
                                {
                                    $project: {
                                        name: "$category.name",
                                        icon: "$category.icon",
                                        count: 1,
                                    },
                                },
                                { $sort: { count: -1 } },
                                { $limit: 5 },
                            ])];
                    case 2:
                        topCategories = _b.sent();
                        return [2 /*return*/, {
                                totalUsers: totalUsers,
                                totalProducts: totalProducts,
                                activeProducts: activeProducts,
                                totalCategories: totalCategories,
                                totalReviews: totalReviews,
                                topCategories: topCategories,
                            }];
                    case 3:
                        error_4 = _b.sent();
                        console.error("❌ Error getting marketplace stats:", error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Search products with advanced filters
     */
    advancedProductSearch: function (searchParams) {
        return __awaiter(this, void 0, void 0, function () {
            var query, category_id, subcategory_id, location_1, priceMin, priceMax, customFilters, _a, sortBy, _b, sortOrder, _c, page, _d, limit, searchCriteria_1, skip, sort, _e, products, totalCount, error_5;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        query = searchParams.query, category_id = searchParams.category_id, subcategory_id = searchParams.subcategory_id, location_1 = searchParams.location, priceMin = searchParams.priceMin, priceMax = searchParams.priceMax, customFilters = searchParams.customFilters, _a = searchParams.sortBy, sortBy = _a === void 0 ? "created_at" : _a, _b = searchParams.sortOrder, sortOrder = _b === void 0 ? -1 : _b, _c = searchParams.page, page = _c === void 0 ? 1 : _c, _d = searchParams.limit, limit = _d === void 0 ? 20 : _d;
                        searchCriteria_1 = {
                            status: "active",
                            expires_at: { $gt: new Date() },
                        };
                        if (query) {
                            searchCriteria_1.$text = { $search: query };
                        }
                        if (category_id) {
                            searchCriteria_1.category_id = category_id;
                        }
                        if (subcategory_id) {
                            searchCriteria_1.subcategory_id = subcategory_id;
                        }
                        if (location_1) {
                            searchCriteria_1["location.city"] = new RegExp(location_1, "i");
                        }
                        if (priceMin !== undefined || priceMax !== undefined) {
                            searchCriteria_1["price.amount"] = {};
                            if (priceMin !== undefined)
                                searchCriteria_1["price.amount"].$gte = priceMin;
                            if (priceMax !== undefined)
                                searchCriteria_1["price.amount"].$lte = priceMax;
                        }
                        if (customFilters && Object.keys(customFilters).length > 0) {
                            Object.entries(customFilters).forEach(function (_a) {
                                var fieldName = _a[0], value = _a[1];
                                if (value !== undefined && value !== "") {
                                    searchCriteria_1["customFields.fieldName"] = fieldName;
                                    searchCriteria_1["customFields.value"] = value;
                                }
                            });
                        }
                        skip = (page - 1) * limit;
                        sort = {};
                        sort[sortBy] = sortOrder;
                        if (query) {
                            sort.score = { $meta: "textScore" };
                        }
                        return [4 /*yield*/, Promise.all([
                                Product_1.default.find(searchCriteria_1)
                                    .populate("user_id", "firstName lastName profile.displayName profile.avatar profile.rating")
                                    .populate("category_id", "name slug icon")
                                    .sort(sort)
                                    .skip(skip)
                                    .limit(limit),
                                Product_1.default.countDocuments(searchCriteria_1),
                            ])];
                    case 1:
                        _e = _f.sent(), products = _e[0], totalCount = _e[1];
                        return [2 /*return*/, {
                                products: products,
                                pagination: {
                                    currentPage: page,
                                    totalPages: Math.ceil(totalCount / limit),
                                    totalItems: totalCount,
                                    itemsPerPage: limit,
                                    hasNext: page < Math.ceil(totalCount / limit),
                                    hasPrev: page > 1,
                                },
                            }];
                    case 2:
                        error_5 = _f.sent();
                        console.error("❌ Error in advanced product search:", error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
};
