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
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Loading Categories...
            </h2>
            <p className="text-xl text-muted-foreground">
              Checking the available categories for you
            </p>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Categories</h2>
          <p className="text-xl text-muted-foreground">
            Discover our top categories handpicked just for you
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
  {displayedCategories.map((category: any) => (
    <motion.div
      key={category._id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="flex flex-col items-stretch justify-stretch h-full"
    >
      <Link href={`/categories/${category.slug}`} className="w-full h-full" passHref>
        <Card
          className="bg-background/50 rounded-xl p-3 border border-border/50 card-shadow hover:scale-105 transition-transform cursor-pointer flex flex-col items-center justify-center text-center min-h-[160px] max-w-[250px]"
        >
          <CardContent className="flex flex-col items-center justify-center p-0">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                categoryColors[category.slug] || "from-gray-500 to-gray-600"
              } flex items-center justify-center text-3xl shadow-lg text-white mb-3`}
            >
              {category.icon}
            </div>
            <h3 className="text-base font-bold mb-1 line-clamp-1 text-foreground">
              {category.name}
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-2">
              {category.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  ))}
</div>

        {categories.length > 8 && (
          <div className="text-center mt-4">
            <Link href="/categories" passHref>
              <Button
                variant="outline"
                size="lg"
                className="glass border-0 cursor-pointer"
              >
                View All Categories
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
