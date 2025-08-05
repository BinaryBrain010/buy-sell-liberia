"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { ProductCarousel } from "@/components/product-carousel";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

// Color mappings for categories (matching existing design)
const categoryColors: { [key: string]: string } = {
  electronics: "from-blue-500 to-cyan-500",
  vehicles: "from-green-500 to-emerald-500",
  "real-estate": "from-purple-500 to-pink-500",
  "home-furniture": "from-amber-500 to-orange-500",
  "fashion-beauty": "from-orange-500 to-red-500",
  "babies-kids": "from-pink-500 to-rose-500",
  "tools-equipment": "from-gray-500 to-slate-500",
  services: "from-indigo-500 to-purple-500",
  jobs: "from-emerald-500 to-teal-500",
  "sports-outdoors": "from-red-500 to-pink-500",
  "computers-accessories": "from-indigo-500 to-blue-500",
  "kitchen-appliances": "from-yellow-500 to-orange-500",
  "agriculture-farming": "from-green-600 to-green-500",
  "books-stationery": "from-purple-600 to-purple-500",
  "health-wellness": "from-teal-500 to-green-500",
  "pets-animals": "from-pink-600 to-red-500",
  "entertainment-hobbies": "from-blue-600 to-indigo-500",
};

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [categoryProducts, setCategoryProducts] = React.useState<
    Record<string, any[]>
  >({});

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/categories?includeProducts=false&limit=100")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!categories.length) return;
    // For each category, fetch products using the search API
    const fetchAll = async () => {
      const results: Record<string, any[]> = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await fetch(
              `/api/search/product?categorySlug=${encodeURIComponent(
                cat.slug
              )}&limit=10&q=`
            );
            if (!res.ok) return;
            const data = await res.json();
            results[cat.slug] = data.results || [];
          } catch {
            results[cat.slug] = [];
          }
        })
      );
      setCategoryProducts(results);
    };
    fetchAll();
  }, [categories]);

  if (loading || categories.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            All Categories
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse products by category
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="glass border-0 btn-shadow"
            >
              All Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Category-wise Product Sections */}
        <div className="space-y-16">
          {categories.map((category, index) => (
            <motion.section
              key={category._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background/50 rounded-2xl p-6 border border-border/50 card-shadow"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${
                      categoryColors[category.slug] ||
                      "from-gray-500 to-gray-600"
                    } flex items-center justify-center text-3xl shadow-lg`}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
                    <p className="text-muted-foreground">
                      {category.totalCount?.toLocaleString() || 0} products
                      available
                    </p>
                  </div>
                </div>
                <Link href={`/categories/${category.slug}`}>
                  <Button variant="outline" className="btn-shadow">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Subcategories */}
              {category.subcategories.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 6).map((subcategory: { _id: React.Key | null | undefined; slug: any; name: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
                      <Link
                        key={subcategory._id}
                        href={`/categories/${category.slug}/${subcategory.slug}`}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {subcategory.name}
                        </Badge>
                      </Link>
                    ))}
                    {category.subcategories.length > 6 && (
                      <Badge variant="outline">
                        +{category.subcategories.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Products Carousel */}
              {categoryProducts[category.slug] &&
              categoryProducts[category.slug].length > 0 ? (
                <ProductCarousel
                  products={categoryProducts[category.slug]}
                  title={`Latest in ${category.name}`}
                  categorySlug={category.slug}
                  totalCount={category.totalCount}
                  onLike={(productId) => {
                    console.log("Liked product:", productId);
                  }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <p className="mb-4">No products in this category yet.</p>
                  <Link href="/sell">
                    <Button size="sm" className="btn-shadow">
                      Be the first to sell
                    </Button>
                  </Link>
                </div>
              )}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
