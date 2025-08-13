import { NextRequest, NextResponse } from "next/server";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import connectDB from "../../../lib/mongoose";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    
    if (!query) {
      return NextResponse.json({ 
        products: [], 
        categories: [], 
        subcategories: [],
        total: 0 
      });
    }

    // Create search regex for case-insensitive matching
    const searchRegex = new RegExp(query, "i");

    // 1. Search Categories (main categories)
    const categories = await Category.find({
      $or: [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ],
      isActive: true,
      parent: { $exists: false } // Only main categories (no parent)
    })
      .select('_id name slug description image')
      .limit(10)
      .lean();

    // 2. Search Subcategories (categories with parent)
    const subcategories = await Category.find({
      $or: [
        { name: searchRegex },
        { slug: searchRegex },
        { description: searchRegex },
      ],
      isActive: true,
      parent: { $exists: true } // Only subcategories (have parent)
    })
      .populate('parent', 'name slug')
      .select('_id name slug description image parent')
      .limit(10)
      .lean();

    // 3. Get all matching category IDs (both main and sub) for product search
    const allCategoryIds = [
      ...categories.map(cat => cat._id),
      ...subcategories.map(subcat => subcat._id)
    ];

    // 4. Search Products with multiple criteria
    let products: any[] = [];

    // First try: Text search (if text index exists)
    try {
      products = await Product.find({
        $text: { $search: query },
        status: "active",
        expires_at: { $gt: new Date() },
      }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, featured: -1, added_at: -1 })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .limit(15)
        .lean();
    } catch (textSearchError) {
      // Text index might not exist, continue with regex search
      products = [];
    }

    // Fallback/Additional search: Regex + category matching
    if (products.length < 10) {
      const additionalProducts = await Product.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { brand: searchRegex },
          { category: { $in: allCategoryIds } },
          { subcategory: { $in: allCategoryIds } }
        ],
        status: "active",
        expires_at: { $gt: new Date() },
        _id: { $nin: products.map(p => p._id) } // Exclude already found products
      })
        .sort({ featured: -1, added_at: -1 })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .limit(15 - products.length)
        .lean();

      products = [...products, ...additionalProducts];
    }

    // 5. Also find products where category/subcategory names match the search
    if (products.length < 15) {
      const categoryNameProducts = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryInfo"
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "subcategory", 
            foreignField: "_id",
            as: "subcategoryInfo"
          }
        },
        {
          $match: {
            $and: [
              { status: "active" },
              { expires_at: { $gt: new Date() } },
              { _id: { $nin: products.map(p => new mongoose.Types.ObjectId(p._id)) } },
              {
                $or: [
                  { "categoryInfo.name": searchRegex },
                  { "subcategoryInfo.name": searchRegex }
                ]
              }
            ]
          }
        },
        {
          $sort: { featured: -1, added_at: -1 }
        },
        {
          $limit: 15 - products.length
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "subcategory",
            foreignField: "_id", 
            as: "subcategory"
          }
        },
        {
          $addFields: {
            category: { $arrayElemAt: ["$category", 0] },
            subcategory: { $arrayElemAt: ["$subcategory", 0] }
          }
        }
      ]);

      products = [...products, ...categoryNameProducts];
    }

    // Calculate total results
    const total = products.length + categories.length + subcategories.length;

    // Sort products by relevance (featured first, then by date)
    products.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    });

    return NextResponse.json({ 
      products: products.slice(0, 15), 
      categories, 
      subcategories,
      total,
      query: query
    });

  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ 
      error: error.message || "Search failed",
      products: [], 
      categories: [], 
      subcategories: [],
      total: 0 
    }, { status: 500 });
  }
}