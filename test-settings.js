const mongoose = require("mongoose");

// MongoDB URI
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/buysell";

// Setting schema
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const Setting = mongoose.model("Setting", SettingSchema);

async function testSettings() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Test 1: Clear existing settings for clean test
    await Setting.deleteMany({});
    console.log("Cleared existing settings");

    // Test 2: Insert a setting
    const newSetting = await Setting.findOneAndUpdate(
      { key: "platform_currency" },
      { $set: { key: "platform_currency", value: "LRD" } },
      { upsert: true, new: true }
    );
    console.log("Created setting:", newSetting);

    // Test 3: Retrieve all settings
    const allSettings = await Setting.find({});
    console.log("All settings:", allSettings);

    // Test 4: Update the setting
    const updated = await Setting.findOneAndUpdate(
      { key: "platform_currency" },
      { $set: { value: "USD" } },
      { new: true }
    );
    console.log("Updated setting:", updated);

    // Test 5: Verify update
    const verified = await Setting.findOne({ key: "platform_currency" });
    console.log("Verified setting:", verified);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testSettings();
