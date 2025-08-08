"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";
import React from "react";

// Color mappings for categories
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
};

export function CategoriesSection() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);
const hasFetched = React.useRef(false);

React.useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;

  fetch("/api/categories?includeProducts=false")
    .then(async (res) => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch categories");
      }
      return res.json();
    })
    .then((data) => {
      setCategories(data.categories || []);
      setLoading(false);
    })
    .catch(() => {
      setCategories([]);
      setLoading(false);
    });
}, []);


  if (loading) {
    return (
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Categories</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center justify-center"
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardContent className="p-4 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 8);

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Categories</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
          {displayedCategories.map((category: any) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-stretch justify-stretch h-full"
            >
              <Link
                href={`/categories/${category.slug}`}
                className="w-full h-full"
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-200 shadow-sm hover:shadow-lg overflow-hidden group p-0 w-full h-full min-h-[120px] flex flex-col justify-center">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                        categoryColors[category.slug] ||
                        "from-gray-500 to-gray-600"
                      } flex items-center justify-center text-2xl shadow-lg mb-2`}
                    >
                      {category.icon}
                    </div>
                    <div className="text-xs text-center font-medium text-foreground line-clamp-2 w-full">
                      {category.name}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        {categories.length > 8 && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="lg"
              className="glass border-0"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less" : "View All Categories"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
