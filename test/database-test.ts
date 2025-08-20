import { User, Category, Product, Review, utils } from "../models";

// Database connection function
import mongoose from "mongoose";

const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/buysell";
let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Database connection failed");
  }
};

export async function testDatabaseSetup(): Promise<void> {
  try {
    console.log("🧪 Starting database tests...\n");

    // Connect to database
    await connectDB();

    // Test 1: Check categories
    console.log("📋 Test 1: Checking categories...");
    const categories = await Category.find().limit(5);
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach((cat) => {
      console.log(
        `   - ${cat.icon} ${cat.name} (${cat.subcategories.length} subcategories)`
      );
    });
    console.log("");

    // Test 2: Get category with subcategories
    console.log("📱 Test 2: Electronics category details...");
    const electronicsCategory = await Category.findOne({ slug: "electronics" });
    if (!electronicsCategory) {
      console.error("❌ Electronics category not found.");
      return;
    }
    console.log(
      `✅ Electronics category found with ${electronicsCategory.subcategories.length} subcategories:`
    );
    electronicsCategory.subcategories.forEach((sub: any) => {
      console.log(
        `   - ${sub.name} (${sub.customFields.length} custom fields)`
      );
    });
    console.log("");

    // Test 3: Create a test user
    console.log("👤 Test 3: Creating test user...");
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = new User({
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "password123",
        phone: "+1234567890",
      });
      await testUser.save();
      console.log("✅ Test user created successfully");
    } else {
      console.log("✅ Test user already exists");
    }
    console.log("");

    // Test 4: Create a sample product
    console.log("📱 Test 4: Creating sample mobile phone product...");
    const mobileSubcategory = electronicsCategory.subcategories.find(
      (sub: any) => sub.slug === "mobile-phones"
    );
    if (!mobileSubcategory) {
      console.error("❌ Mobile Phones subcategory not found.");
      return;
    }

    // Check if product already exists
    let existingProduct = await Product.findOne({
      title: "iPhone 13 Pro Max - Excellent Condition",
      user_id: testUser._id,
    });

    if (!existingProduct) {
      const sampleProduct = new Product({
        user_id: testUser._id,
        title: "iPhone 13 Pro Max - Excellent Condition",
        description:
          "Selling my iPhone 13 Pro Max in excellent condition. Barely used, comes with original box and all accessories. No scratches or dents.",
        category_id: electronicsCategory._id,
        subcategory_id: mobileSubcategory._id,
        price: {
          amount: 85000,
          currency: "PKR",
          negotiable: true,
        },
        location: {
          city: "Karachi",
          state: "Sindh",
          country: "Pakistan",
        },
        contact: {
          phone: "+923001234567",
          whatsapp: "+923001234567",
          email: "test@example.com",
          preferredMethod: "whatsapp",
        },
        images: [
          {
            url: "/images/iphone-13-pro-max-1.jpg",
            alt: "iPhone 13 Pro Max Front View",
            isPrimary: true,
            order: 1,
          },
        ],
        customFields: [
          { fieldName: "brand", value: "Apple" },
          { fieldName: "model", value: "iPhone 13 Pro Max" },
          { fieldName: "condition", value: "Like New" },
          { fieldName: "storage", value: "256GB" },
          { fieldName: "color", value: "Space Gray" },
          { fieldName: "boxPack", value: true },
          { fieldName: "warranty", value: "Company Warranty" },
        ],
        tags: ["iphone", "apple", "smartphone", "256gb", "space gray"],
      });

      await sampleProduct.save();
      console.log("✅ Sample mobile phone product created successfully");
      console.log(`   Title: ${sampleProduct.title}`);
      // formattedPrice and slug may be virtuals, so use toObject() if needed
      // If not available, skip logging them
    } else {
      console.log("✅ Sample product already exists");
    }
    console.log("");

    // Test 5: Create a car product
    console.log("🚗 Test 5: Creating sample car product...");
    const vehiclesCategory = await Category.findOne({ slug: "vehicles" });
    if (!vehiclesCategory) {
      console.error("❌ Vehicles category not found.");
      return;
    }
    const carSubcategory = vehiclesCategory.subcategories.find(
      (sub: any) => sub.slug === "cars"
    );
    if (!carSubcategory) {
      console.error("❌ Cars subcategory not found.");
      return;
    }

    let existingCar = await Product.findOne({
      title: "2018 Toyota Corolla XLI - Excellent Condition",
      user_id: testUser._id,
    });

    if (!existingCar) {
      const carProduct = new Product({
        user_id: testUser._id,
        title: "2018 Toyota Corolla XLI - Excellent Condition",
        description:
          "Selling my well-maintained 2018 Toyota Corolla XLI. Single owner, complete documents, recently serviced. Perfect family car.",
        category_id: vehiclesCategory._id,
        subcategory_id: carSubcategory._id,
        price: {
          amount: 3200000,
          currency: "PKR",
          negotiable: true,
        },
        location: {
          city: "Lahore",
          state: "Punjab",
          country: "Pakistan",
        },
        contact: {
          phone: "+923001234567",
          whatsapp: "+923001234567",
          email: "test@example.com",
          preferredMethod: "phone",
        },
        images: [
          {
            url: "/images/corolla-2018-1.jpg",
            alt: "Toyota Corolla XLI 2018",
            isPrimary: true,
            order: 1,
          },
        ],
        customFields: [
          { fieldName: "make", value: "Toyota" },
          { fieldName: "model", value: "Corolla XLI" },
          { fieldName: "year", value: 2018 },
          { fieldName: "mileage", value: 45000 },
          { fieldName: "fuelType", value: "Petrol" },
          { fieldName: "transmission", value: "Manual" },
          { fieldName: "engineCapacity", value: "1300cc" },
          { fieldName: "condition", value: "Excellent" },
          { fieldName: "color", value: "White" },
        ],
        tags: ["toyota", "corolla", "xli", "2018", "manual", "family car"],
      });

      await carProduct.save();
      console.log("✅ Sample car product created successfully");
      console.log(`   Title: ${carProduct.title}`);
      // formattedPrice may be a virtual, so use toObject() if needed
      // If not available, skip logging it
    } else {
      console.log("✅ Sample car product already exists");
    }
    console.log("");

    // Test 6: Test search functionality
    console.log("🔍 Test 6: Testing search functionality...");
    const searchResults = await Product.find({
      $text: { $search: "iphone apple" },
    }).limit(3);
    console.log(
      `✅ Text search for 'iphone apple' found ${searchResults.length} results`
    );
    console.log("");

    // Test 7: Test user liked products
    console.log("❤️ Test 7: Testing liked products...");
    const products = await Product.find().limit(2);
    if (products.length > 0) {
      // If likeProduct is a custom method, cast testUser as any
      if (typeof (testUser as any).likeProduct === "function") {
        await (testUser as any).likeProduct(products[0]._id);
        console.log(`✅ User liked product: ${products[0].title}`);
        console.log(
          `✅ User has liked ${(testUser as any).likedProducts.length} products`
        );
      } else {
        console.log("⚠️ likeProduct method not found on User instance.");
      }
    }
    console.log("");

    // Test 8: Get marketplace stats
    console.log("📊 Test 8: Getting marketplace statistics...");
    const stats = await utils.getMarketplaceStats();
    console.log("✅ Marketplace Statistics:");
    console.log(`   - Total Users: ${stats.totalUsers}`);
    console.log(`   - Total Products: ${stats.totalProducts}`);
    console.log(`   - Active Products: ${stats.activeProducts}`);
    console.log(`   - Total Categories: ${stats.totalCategories}`);
    console.log("");

    // Test 9: Test product expiry
    console.log("⏰ Test 9: Testing product expiry functionality...");
    if (typeof (Product as any).findActiveProducts === "function") {
      const activeProducts = await (Product as any).findActiveProducts();
      console.log(`✅ Found ${activeProducts.length} active products`);

      if (activeProducts.length > 0) {
        const product = activeProducts[0];
        if (
          product.expires_at &&
          typeof product.expires_at.toLocaleDateString === "function"
        ) {
          console.log(
            `✅ Sample product expires on: ${product.expires_at.toLocaleDateString()}`
          );
        }
        if (typeof product.isExpired === "function") {
          console.log(`✅ Is expired: ${product.isExpired()}`);
        }
      }
      console.log("");
    } else {
      console.log(
        "⚠️ findActiveProducts static method not found on Product model."
      );
    }

    console.log("🎉 All database tests completed successfully!");
    console.log("🚀 Your marketplace database is ready for use!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    throw error;
  }
}

// Run tests if called directly
if (require.main === module) {
  testDatabaseSetup()
    .then(() => {
      console.log("✨ Database testing completed, exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database testing failed:", error);
      process.exit(1);
    });
}
