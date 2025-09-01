import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models";

dotenv.config();

async function migrateUsers() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const users = await User.find({});
  let updatedCount = 0;

  for (const user of users) {
    let needsUpdate = false;

    // Basic fields
    if (user.isActive === undefined) { user.isActive = true; needsUpdate = true; }
    if (user.isBlocked === undefined) { user.isBlocked = false; needsUpdate = true; }
    if (user.isBanned === undefined) { user.isBanned = false; needsUpdate = true; }
    if (user.banReason === undefined) { user.banReason = null; needsUpdate = true; }
    if (user.bannedAt === undefined) { user.bannedAt = null; needsUpdate = true; }
    if (user.emailVerified === undefined) { user.emailVerified = false; needsUpdate = true; }
    if (user.phoneVerified === undefined) { user.phoneVerified = false; needsUpdate = true; }
    if (user.loginCount === undefined) { user.loginCount = 0; needsUpdate = true; }

    // Profile
    if (!user.profile) {
      user.profile = {
        verificationStatus: "unverified",
        rating: { average: 0, count: 0 },
      };
      needsUpdate = true;
    }
    if (user.profile.verificationStatus === undefined) { user.profile.verificationStatus = "unverified"; needsUpdate = true; }
    if (!user.profile.rating) { user.profile.rating = { average: 0, count: 0 }; needsUpdate = true; }
    if (user.profile.rating.average === undefined) { user.profile.rating.average = 0; needsUpdate = true; }
    if (user.profile.rating.count === undefined) { user.profile.rating.count = 0; needsUpdate = true; }

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
    if (user.activity.totalListings === undefined) { user.activity.totalListings = 0; needsUpdate = true; }
    if (user.activity.activeListings === undefined) { user.activity.activeListings = 0; needsUpdate = true; }
    if (user.activity.soldItems === undefined) { user.activity.soldItems = 0; needsUpdate = true; }
    if (user.activity.joinedDate === undefined) { user.activity.joinedDate = new Date(); needsUpdate = true; }
    if (user.activity.lastActive === undefined) { user.activity.lastActive = new Date(); needsUpdate = true; }

    // Arrays
    if (!user.listedProducts) { user.listedProducts = []; needsUpdate = true; }
    if (!user.likedProducts) { user.likedProducts = []; needsUpdate = true; }

    // Save if any changes
    if (needsUpdate) {
      await user.save();
      updatedCount++;
      console.log(`Updated user ${user._id}`);
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} users.`);
  await mongoose.disconnect();
}

migrateUsers().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});