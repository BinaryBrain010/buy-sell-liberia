"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import React from "react";
import { CategoryService } from "@/app/services/Category.Service";

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

    const service = new CategoryService();
    service
      .getCategories({ includeProducts: false })
      .then((data) => {
        const mapped = (data.categories || []).map((c: any) => ({
          _id: c._id ?? c.slug,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          description: c.description ?? "",
        }));
        setCategories(mapped);
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
          <div
            className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] justify-items-center gap-6 mb-8"
            aria-live="polite"
          >
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center w-full"
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 w-full max-w-[260px]">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center justify-center text-center min-h-[170px] w-full">
                      <Skeleton className="h-16 w-16 rounded-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full max-w-[200px] mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 10);

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Categories</h2>
          <p className="text-xl text-muted-foreground">
            Discover our top categories handpicked just for you
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-10 justify-items-center">
          {displayedCategories.map((category: any) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <Link
                href={`/categories/${category.slug}`}
                className="block"
                passHref
              >
                <Card className="group bg-background/60 rounded-xl p-4 border border-border/60 card-shadow w-full max-w-[260px] mx-auto cursor-pointer transition-all duration-200 hover:shadow-lg hover:ring-2 hover:ring-primary/20 hover:-translate-y-0.5">
                  <CardContent className="flex flex-col items-center justify-center p-0 text-center min-h-[170px]">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                        categoryColors[category.slug] ||
                        "from-gray-500 to-gray-600"
                      } flex items-center justify-center text-3xl text-white mb-3 shadow-md ring-4 ring-white/10 transition-transform duration-200 group-hover:scale-110`}
                    >
                      {category.icon}
                    </div>
                    <h3 className="text-base font-semibold mb-1 line-clamp-1 text-foreground">
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
