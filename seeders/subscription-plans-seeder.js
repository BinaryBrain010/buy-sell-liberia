const mongoose = require("mongoose");
require("dotenv").config();

// Define the schema inline
const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ["basic", "pro", "vip"],
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    enum: ["LD"],
    default: "LD",
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    default: 30,
  },
  maxAds: {
    type: Number,
    required: true,
    min: 0,
  },
  featuredAds: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  homepageBanner: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active",
  },
  features: [{
    type: String,
    trim: true,
  }],
  isPopular: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

const defaultPlans = [
  {
    name: "Basic Plan",
    type: "basic",
    description: "Perfect for casual sellers with moderate listing needs",
    price: 1000, // 1,000 LD
    currency: "LD",
    duration: 30, // 30 days
    maxAds: 20,
    featuredAds: 0,
    homepageBanner: false,
    priority: 1,
    status: "active",
    features: [
      "20 ads per month",
      "Standard listing visibility",
      "Basic customer support",
      "Mobile app access"
    ],
    isPopular: false,
  },
  {
    name: "Pro Plan",
    type: "pro",
    description: "Ideal for active sellers who need more visibility and features",
    price: 2500, // 2,500 LD
    currency: "LD",
    duration: 30, // 30 days
    maxAds: 60,
    featuredAds: 5,
    homepageBanner: false,
    priority: 2,
    status: "active",
    features: [
      "60 ads per month",
      "5 featured ads included",
      "Priority listing placement",
      "Enhanced visibility",
      "Priority customer support",
      "Mobile app access",
      "Analytics dashboard"
    ],
    isPopular: true,
  },
  {
    name: "VIP Plan",
    type: "vip",
    description: "For high-volume sellers who want maximum exposure and premium features",
    price: 5000, // 5,000 LD
    currency: "LD",
    duration: 30, // 30 days
    maxAds: 999999, // Unlimited
    featuredAds: 999999, // Unlimited
    homepageBanner: true,
    priority: 3,
    status: "active",
    features: [
      "Unlimited ads",
      "Unlimited featured ads",
      "Homepage banner placement",
      "Top priority listing placement",
      "Premium customer support",
      "Mobile app access",
      "Advanced analytics dashboard",
      "Custom branding options",
      "Dedicated account manager"
    ],
    isPopular: false,
  },
];

async function seedSubscriptionPlans() {
  try {
    console.log("🌱 Starting subscription plans seeding...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/buysell-liberia");
    console.log("✅ Connected to MongoDB");
    
    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log("🗑️ Cleared existing subscription plans");
    
    // Create default plans
    const createdPlans = await SubscriptionPlan.insertMany(defaultPlans);
    console.log(`✅ Created ${createdPlans.length} subscription plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`   - ${plan.name} (${plan.type}): ${plan.price} ${plan.currency} - ${plan.maxAds} ads, ${plan.featuredAds} featured ads`);
    });
    
    return createdPlans;
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedSubscriptionPlans()
    .then(() => {
      console.log("🎉 Subscription plans seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Subscription plans seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedSubscriptionPlans };
