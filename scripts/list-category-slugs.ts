import mongoose from "mongoose";
import Category from "../models/Category";

async function listCategorySlugs() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/buysell"
  );
  const categories = await Category.find({}, "name slug").lean();
  console.log("Category slugs:");
  categories.forEach((cat: any) => {
    console.log(`Name: ${cat.name}, Slug: ${cat.slug}`);
  });
  await mongoose.disconnect();
}

listCategorySlugs().catch((err) => {
  console.error("Error listing category slugs:", err);
  process.exit(1);
});
