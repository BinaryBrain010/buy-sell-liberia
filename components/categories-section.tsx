"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { ProductCarousel } from "./product-carousel";
import Link from "next/link";
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
};

export function CategoriesSection() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
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
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center justify-center">
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

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Categories</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
          {categories.map((category: any) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="flex items-center justify-center"
            >
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/80 transition-all duration-200 shadow-sm hover:shadow-lg overflow-hidden group p-0">
                <CardContent className="p-4 flex items-center justify-center">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                      categoryColors[category.slug] || "from-gray-500 to-gray-600"
                    } flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {category.icon}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
