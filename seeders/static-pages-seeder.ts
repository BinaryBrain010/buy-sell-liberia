import mongoose from "mongoose";
import dotenv from "dotenv";
import StaticPage from "../models/StaticPage";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/buysell";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const docs = [
      {
        slug: "about",
        title: "About BuySell",
        content: "",
        data: {
          hero: {
            title: "About BuySell",
            subtitle: "BuySell is a modern marketplace platform where users can buy, sell, and explore a wide variety of products — all in one place.",
          },
          sections: [
            { icon: "rocket", title: "Our Mission", text: "To empower individuals and businesses to buy and sell safely, easily, and efficiently through an intuitive digital experience." },
            { icon: "verified", title: "Our Vision", text: "To become the most trusted and accessible digital marketplace in the region, enabling growth and opportunity for all." },
            { icon: "users", title: "Our Community", text: "We value transparency, trust, and inclusion — creating a safe and vibrant environment for all our users." },
          ],
          coreValues: ["Integrity", "Innovation", "Customer First", "Accountability", "Simplicity"],
        },
      },
      {
        slug: "faq",
        title: "Frequently Asked Questions",
        content: "",
        data: {
          groups: [
            {
              category: "Getting Started",
              items: [
                { q: "What is BuySell Liberia?", a: "BuySell Liberia is a marketplace to buy and sell products and services locally. Create an account, post listings, and connect with buyers or sellers." },
                { q: "Do I need an account to use the site?", a: "You can browse without an account. You'll need an account to post listings, contact sellers, and manage favorites." }
              ]
            },
            {
              category: "Posting & Managing Listings",
              items: [
                { q: "How do I post a listing?", a: "Go to the Sell page, fill in the details (title, category, price, photos), and publish. Your listing will appear after a quick review." },
                { q: "How long do listings stay active?", a: "Listings remain active for 30 days by default. You can renew, edit, or delete them anytime from your dashboard." },
                { q: "Can I feature my listing?", a: "Yes. Featured listings get priority placement in search and category pages. Look for the 'Feature' option on your listing." }
              ]
            },
            {
              category: "Safety & Payments",
              items: [
                { q: "How do I stay safe when buying or selling?", a: "Meet in public places, verify items before paying, and avoid sharing sensitive information. Report suspicious activity from the listing page." },
                { q: "Does BuySell Liberia handle payments?", a: "Some categories support manual payment verification. Otherwise, payment is arranged directly between buyer and seller." }
              ]
            },
            {
              category: "Account & Support",
              items: [
                { q: "I forgot my password. What should I do?", a: "Use the 'Forgot password' link on the sign-in page to reset your password via email." },
                { q: "How do I contact support?", a: "Use the Contact page or the 'Report' button on a listing. Our team will respond as soon as possible." }
              ]
            }
          ]
        }
      },
      {
        slug: "help",
        title: "Help Center",
        content: "",
        data: {
          blocks: [
            { icon: "question", title: "Account", text: "How to manage your account." },
            { icon: "question", title: "Listings", text: "Posting and managing listings." },
            { icon: "question", title: "Safety", text: "Stay safe while buying and selling." }
          ]
        }
      },
      {
        slug: "privacy",
        title: "Privacy Policy",
        content: `<h1>Privacy Policy</h1><p>Last updated: ${new Date().getFullYear()}</p><h2>1. Information We Collect</h2><ul><li>Account information</li><li>Listing details</li><li>Usage data</li></ul>`,
      },
      {
        slug: "terms",
        title: "Terms of Use",
        content: `<h1>Terms of Use</h1><p>Last updated: ${new Date().getFullYear()}</p><h2>1. Introduction</h2><p>Welcome to BuySell Liberia.</p>`,
      },
    ];

    for (const d of docs) {
      const existing = await StaticPage.findOne({ slug: d.slug });
      if (existing) {
        console.log(`Skipping '${d.slug}' (already exists)`);
        continue;
      }
      await StaticPage.create(d);
      console.log(`Seeded '${d.slug}'`);
    }

    console.log("Static pages seeding done.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

run();


