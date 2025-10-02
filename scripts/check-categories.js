const mongoose = require("mongoose");
require("dotenv").config();

async function checkCategories() {
  try {
    // Use the EXACT same connection as API routes - no modification
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/buysell";
    console.log(
      "🔗 Connecting to:",
      mongoUri.includes("mongodb+srv://") ? "MongoDB Atlas" : "Local MongoDB"
    );

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");

    // Get the Category model (reuse schema from seeder)
    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      slug: { type: String, required: true },
      icon: { type: String, required: true },
      description: String,
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
      subcategories: [
        {
          name: String,
          slug: String,
          description: String,
          isActive: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 },
          customFields: [
            {
              fieldName: String,
              fieldType: String,
              label: String,
              required: Boolean,
              options: [String],
              placeholder: String,
            },
          ],
        },
      ],
    });

    const Category =
      mongoose.models.Category || mongoose.model("Category", categorySchema);

    // Count categories
    const count = await Category.countDocuments();
    console.log(`📊 Total categories: ${count}`);

    if (count === 0) {
      console.log("❌ No categories found in database!");
      console.log(
        "💡 The seeder might have connected to a different database."
      );
    } else {
      // Show all categories
      const categories = await Category.find()
        .select("name slug subcategories")
        .lean();
      console.log("\n📋 Categories in database:");
      categories.forEach((cat, index) => {
        console.log(
          `${index + 1}. ${cat.name} (${cat.slug}) - ${
            cat.subcategories?.length || 0
          } subcategories`
        );
      });
    }

    // Show database info
    console.log("\n🔍 Database Info:");
    console.log("   Database name:", mongoose.connection.name);
    console.log("   Host:", mongoose.connection.host);
    console.log(
      "   Ready state:",
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkCategories();
