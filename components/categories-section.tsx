"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import React from "react";
import { CategoryService } from "@/app/services/Category.Service";
import {
  Grid3X3,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

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

  if (categories.length === 0) {
    return <CategoriesEmptyState />;
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 10);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20 overflow-visible relative z-0">
      {/* Background Elements (non-interactive) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-2xl" />
        <div className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/10 to-transparent blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated categories and find exactly what you're looking
            for
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 lg:gap-8 mb-12 justify-items-center">
          {displayedCategories.map((category: any, index: number) => (
            <div key={category._id} className="w-full">
              <Link
                href={`/categories/${category.slug}`}
                className="block group"
                passHref
              >
                <Card className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 w-full max-w-[280px] mx-auto cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardContent className="flex flex-col items-center justify-center p-0 text-center min-h-[200px] relative z-10">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                        categoryColors[category.slug] ||
                        "from-gray-500 to-gray-600"
                      } flex items-center justify-center text-4xl text-white mb-4 shadow-lg ring-4 ring-white/20 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      {category.icon}
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Hover Arrow */}
                    <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {categories.length > 8 && (
          <div className="text-center">
            <Link href="/categories" passHref>
              <div className="hover:scale-105 transition-transform">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-gradient-to-r from-primary/5 to-v0-green/5 border-2 border-primary/20 text-foreground hover:from-primary/10 hover:to-v0-green/10 hover:border-primary/40 transition-all duration-300 rounded-xl px-8 py-3 font-semibold backdrop-blur-sm"
                >
                  View All Categories
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoriesEmptyState() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    // In a real app, you would trigger a re-fetch here
    window.location.reload();
  };

  const suggestedCategories = [
    {
      icon: "📱",
      name: "Electronics",
      description: "Phones, laptops, gadgets",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: "🚗",
      name: "Vehicles",
      description: "Cars, motorcycles, bikes",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: "🏠",
      name: "Real Estate",
      description: "Houses, apartments, land",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: "👕",
      name: "Fashion",
      description: "Clothing, shoes, accessories",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20 overflow-visible relative z-0">
      {/* Background Elements (non-interactive) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-2xl" />
        <div className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/10 to-transparent blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated categories and find exactly what you're looking
            for
          </p>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 md:py-20">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-v0-green/20 flex items-center justify-center mb-6">
                <Grid3X3 className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-v0-orange to-primary flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Categories Coming Soon!
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We're setting up our category system to help you find exactly what
              you're looking for. In the meantime, you can browse all products
              or suggest categories you'd like to see.
            </p>

            {/* Suggested Categories Preview */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-foreground">
                Categories we're planning to add:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedCategories.map((category, index) => (
                  <div
                    key={category.name}
                    className="group hover:scale-105 transition-all duration-300"
                  >
                    <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg`}
                        >
                          {category.icon}
                        </div>
                        <h5 className="font-semibold text-sm mb-1">
                          {category.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products" passHref>
                <div className="hover:scale-105 transition-transform">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Browse All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-8 py-4 text-base font-semibold border-2 border-primary/20 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-primary/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                New categories being added regularly!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
