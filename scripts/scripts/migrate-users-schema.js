"use strict";
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
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
var models_1 = require("../models");
dotenv_1.default.config();
function migrateUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var users, updatedCount, _i, users_1, user, needsUpdate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGODB_URI)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, models_1.User.find({})];
                case 2:
                    users = _a.sent();
                    updatedCount = 0;
                    _i = 0, users_1 = users;
                    _a.label = 3;
                case 3:
                    if (!(_i < users_1.length)) return [3 /*break*/, 6];
                    user = users_1[_i];
                    needsUpdate = false;
                    // Basic fields
                    if (user.isActive === undefined) {
                        user.isActive = true;
                        needsUpdate = true;
                    }
                    if (user.isBlocked === undefined) {
                        user.isBlocked = false;
                        needsUpdate = true;
                    }
                    if (user.isBanned === undefined) {
                        user.isBanned = false;
                        needsUpdate = true;
                    }
                    if (user.banReason === undefined) {
                        user.banReason = null;
                        needsUpdate = true;
                    }
                    if (user.bannedAt === undefined) {
                        user.bannedAt = null;
                        needsUpdate = true;
                    }
                    if (user.emailVerified === undefined) {
                        user.emailVerified = false;
                        needsUpdate = true;
                    }
                    if (user.phoneVerified === undefined) {
                        user.phoneVerified = false;
                        needsUpdate = true;
                    }
                    if (user.loginCount === undefined) {
                        user.loginCount = 0;
                        needsUpdate = true;
                    }
                    // Profile
                    if (!user.profile) {
                        user.profile = {
                            verificationStatus: "unverified",
                            rating: { average: 0, count: 0 },
                        };
                        needsUpdate = true;
                    }
                    if (user.profile.verificationStatus === undefined) {
                        user.profile.verificationStatus = "unverified";
                        needsUpdate = true;
                    }
                    if (!user.profile.rating) {
                        user.profile.rating = { average: 0, count: 0 };
                        needsUpdate = true;
                    }
                    if (user.profile.rating.average === undefined) {
                        user.profile.rating.average = 0;
                        needsUpdate = true;
                    }
                    if (user.profile.rating.count === undefined) {
                        user.profile.rating.count = 0;
                        needsUpdate = true;
                    }
                    // Preferences
                    if (!user.preferences) {
                        user.preferences = {
                            defaultLocation: { country: "Liberia" },
                            notifications: { emailUpdates: true, smsUpdates: false, pushNotifications: true },
                        };
                        needsUpdate = true;
                    }
                    if (!user.preferences.defaultLocation) {
                        user.preferences.defaultLocation = { country: "Liberia" };
                        needsUpdate = true;
                    }
                    if (user.preferences.notifications === undefined) {
                        user.preferences.notifications = { emailUpdates: true, smsUpdates: false, pushNotifications: true };
                        needsUpdate = true;
                    }
                    // Activity
                    if (!user.activity) {
                        user.activity = {
                            totalListings: 0,
                            activeListings: 0,
                            soldItems: 0,
                            joinedDate: new Date(),
                            lastActive: new Date(),
                        };
                        needsUpdate = true;
                    }
                    if (user.activity.totalListings === undefined) {
                        user.activity.totalListings = 0;
                        needsUpdate = true;
                    }
                    if (user.activity.activeListings === undefined) {
                        user.activity.activeListings = 0;
                        needsUpdate = true;
                    }
                    if (user.activity.soldItems === undefined) {
                        user.activity.soldItems = 0;
                        needsUpdate = true;
                    }
                    if (user.activity.joinedDate === undefined) {
                        user.activity.joinedDate = new Date();
                        needsUpdate = true;
                    }
                    if (user.activity.lastActive === undefined) {
                        user.activity.lastActive = new Date();
                        needsUpdate = true;
                    }
                    // Arrays
                    if (!user.listedProducts) {
                        user.listedProducts = [];
                        needsUpdate = true;
                    }
                    if (!user.likedProducts) {
                        user.likedProducts = [];
                        needsUpdate = true;
                    }
                    if (!needsUpdate) return [3 /*break*/, 5];
                    return [4 /*yield*/, user.save()];
                case 4:
                    _a.sent();
                    updatedCount++;
                    console.log("Updated user ".concat(user._id));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("Migration complete. Updated ".concat(updatedCount, " users."));
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
migrateUsers().catch(function (err) {
    console.error("Migration failed:", err);
    process.exit(1);
});
