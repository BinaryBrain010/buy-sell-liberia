"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import BuySellLoader from "@/components/loader/BuySellLoader";
import Link from "next/link";
import Image from "next/image";
import { ProductCard, type Product } from "@/components/product-card";
import { CategoryService } from "@/app/services/Category.Service";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";

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

// Helper to match API's slug sanitize
const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;
  const subcategoriesSectionRef = useRef<HTMLDivElement>(null);
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const hasFetchedCategories = useRef(false);

  // Subcategory image map fetched from API
  type SubcatImageEntry = { slug: string; url: string; title?: string };
  const [subcatImageMap, setSubcatImageMap] = useState<
    Record<string, SubcatImageEntry>
  >({});

  useEffect(() => {
    const loadImageMap = async () => {
      try {
        const res = await fetch("/api/subcategory-image-map", {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`Failed to fetch image map: ${res.status}`);
        const json = await res.json();
        const images: SubcatImageEntry[] = json?.data?.images || [];
        const map: Record<string, SubcatImageEntry> = {};
        for (const item of images) {
          if (item?.slug) map[item.slug.toLowerCase()] = item;
        }
        setSubcatImageMap(map);
      } catch (err) {
        console.error(
          "[CategoriesPage] Failed to load subcategory image map",
          err
        );
        setSubcatImageMap({});
      }
    };
    loadImageMap();
  }, []);

  const getMappedSubcategoryImage = (subcategory: any): string | undefined => {
    // If API on subcategory already provides an image, prefer it
    if (subcategory?.image?.url) return subcategory.image.url;
    const slugKey = subcategory?.slug
      ? String(subcategory.slug)
      : subcategory?.name
      ? slugify(String(subcategory.name))
      : "";
    if (!slugKey) return undefined;
    return subcatImageMap[slugKey.toLowerCase()]?.url;
  };

  // Fetch all categories on initial load
  useEffect(() => {
    if (hasFetchedCategories.current) return;
    hasFetchedCategories.current = true;
    const service = new CategoryService();
    setLoadingCategories(true);
    service
      .getCategories({ includeProducts: false, limit: 100 })
      .then((data) => {
        const mapped = (data.categories || []).map((c: any) => ({
          ...c,
          _id: c._id ?? c.slug,
        }));
        setCategories(mapped);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  // Fetch products when selectedCategory or currentPage changes
  useEffect(() => {
    if (!selectedCategory?._id) {
      setProducts([]);
      setTotalProducts(0);
      setCurrentPage(1);
      return;
    }

    setLoadingProducts(true);
    const fetchCategoryProducts = async () => {
      try {
        const url = `/api/products?category_id=${encodeURIComponent(
          selectedCategory._id
        )}&limit=${itemsPerPage}&page=${currentPage}`;
        console.log(
          `[CategoriesPage] Fetching products for category ID: ${selectedCategory._id}, Page: ${currentPage}`
        );
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch products: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error(
          `Error fetching products for category ${selectedCategory._id}:`,
          error
        );
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategory?._id, currentPage]);

  // Scroll to subcategories section when a category is selected
  useEffect(() => {
    if (selectedCategory && subcategoriesSectionRef.current) {
      // Add a small delay to ensure the section is rendered
      setTimeout(() => {
        subcategoriesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [selectedCategory]);

  // Handle category card click
  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when selecting a new category
  };

  // Handle subcategory click - pass both category and subcategory IDs
  const handleSubcategoryClick = (subcategory: any) => {
    // Navigate to the category page with both category and subcategory IDs
    const url = `/categories/${
      selectedCategory.slug
    }?category_id=${encodeURIComponent(
      selectedCategory._id
    )}&subcategory_id=${encodeURIComponent(subcategory._id)}`;
    window.location.href = url;
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle like functionality
  const handleLike = (productId: string) => {
    console.log("Liked product:", productId);
    // Implement actual like logic here
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Generate URL for "View All Products" with category ID
  const getViewAllProductsUrl = () => {
    return `/categories/${
      selectedCategory.slug
    }?category_id=${encodeURIComponent(selectedCategory._id)}`;
  };

  if (loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <BuySellLoader label="Loading categories" size={170} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* Enhanced Hero */}
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 text-center mb-12 shadow-2xl">
            {/* Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/15 to-transparent blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">📂</span>
                <span className="text-sm font-semibold text-primary">
                  All Categories
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {selectedCategory ? selectedCategory.name : "Browse Categories"}
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                {selectedCategory
                  ? `Discover amazing products and explore subcategories in ${selectedCategory.name}`
                  : "Find exactly what you're looking for by browsing our carefully curated categories"}
              </p>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {categories.length} Categories
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Verified Sellers
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Secure Transactions
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Enhanced Category Cards Grid */}
        <FadeInStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16">
          {categories.map((category) => (
            <Card
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className={`group relative bg-gradient-to-br from-background/80 via-background/60 to-background/80 rounded-2xl p-4 border-2 border-border/30 hover:border-primary/50 card-shadow hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center text-center overflow-hidden
                ${
                  selectedCategory?._id === category._id
                    ? "ring-2 ring-primary ring-offset-4 border-primary/60 shadow-2xl shadow-primary/20"
                    : "hover:shadow-xl hover:shadow-primary/10"
                }`}
            >
              {/* Decorative Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-4 -translate-y-4 rotate-45 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 transform -translate-x-3 translate-y-3 rotate-45 bg-gradient-to-br from-v0-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              <CardContent className="flex flex-col items-center justify-center p-0 relative z-10">
                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
                    categoryColors[category.slug] || "from-gray-500 to-gray-600"
                  } flex items-center justify-center text-4xl shadow-2xl text-white mb-4 ring-4 ring-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="relative z-10">{category.icon}</span>
                </div>

                <h2 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>

                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                  {category.description}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-3 right-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Decorative Bottom Accent */}
                <div className="mt-4 w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </FadeInStagger>

        {/* Enhanced Subcategories Section */}
        {selectedCategory && (
          <div
            ref={subcategoriesSectionRef}
            className="mt-20 pt-12 border-t-2 border-border/30"
          >
            <div className="bg-gradient-to-br from-background/50 via-primary/5 to-background/50 rounded-3xl p-8 mb-12 border border-border/50 shadow-xl">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                      categoryColors[selectedCategory.slug] ||
                      "from-gray-500 to-gray-600"
                    } flex items-center justify-center text-3xl shadow-lg text-white`}
                  >
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight break-words bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {selectedCategory.name} Subcategories
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground">
                      Choose a specific subcategory or view all products in{" "}
                      <span className="font-semibold text-primary">
                        {selectedCategory.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link
                    href={getViewAllProductsUrl()}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="btn-shadow w-full sm:w-auto bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90"
                    >
                      View All Products
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSelectedCategory(null);
                      setProducts([]);
                      setTotalProducts(0);
                      setCurrentPage(1);
                    }}
                    aria-label="Clear category selection"
                    className="flex items-center w-full sm:w-auto border-2 hover:bg-muted/50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>

            {selectedCategory.subcategories &&
            selectedCategory.subcategories.length > 0 ? (
              <FadeInStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {selectedCategory.subcategories.map((subcategory: any) => (
                  <Card
                    key={subcategory._id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="group relative bg-gradient-to-br from-background/80 via-background/60 to-background/80 rounded-2xl border-2 border-border/30 hover:border-primary/50 card-shadow hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Enhanced Subcategory Image */}
                      <div className="relative w-full h-40 mb-4 overflow-hidden rounded-t-2xl">
                        <Image
                          src={
                            getMappedSubcategoryImage(subcategory) ||
                            "/placeholder.svg"
                          }
                          alt={subcategory.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Enhanced Overlay gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Enhanced Category icon overlay */}
                        <div className="absolute top-3 right-3">
                          <div
                            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${
                              categoryColors[selectedCategory.slug] ||
                              "from-gray-500 to-gray-600"
                            } flex items-center justify-center text-lg shadow-xl text-white ring-4 ring-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                          >
                            {subcategory.icon || selectedCategory.icon}
                          </div>
                        </div>

                        {/* Product count badge */}
                        {subcategory.productCount !== undefined && (
                          <div className="absolute top-3 left-3">
                            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
                              {subcategory.productCount} items
                            </div>
                          </div>
                        )}

                        {/* Hover arrow */}
                        <div className="absolute bottom-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Enhanced Subcategory Info */}
                      <div className="px-4 pb-4">
                        <h3 className="text-base font-bold mb-2 line-clamp-2 text-center group-hover:text-primary transition-colors">
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 text-center leading-relaxed">
                            {subcategory.description}
                          </p>
                        )}
                      </div>

                      {/* Decorative bottom accent */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </CardContent>
                  </Card>
                ))}
              </FadeInStagger>
            ) : (
              <FadeIn className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{selectedCategory.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Subcategories</h3>
                <p className="text-muted-foreground mb-6">
                  This category doesn't have any subcategories. View all
                  products directly.
                </p>
                <Link href={getViewAllProductsUrl()}>
                  <Button>
                    View All Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </FadeIn>
            )}

            {/* Quick Stats */}
            {selectedCategory.subcategories &&
              selectedCategory.subcategories.length > 0 && (
                <div className="mt-8 p-6 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">Category Overview</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory.subcategories.length} subcategories
                        available in {selectedCategory.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm w-fit">
                      {selectedCategory.subcategories.length} subcategories
                    </Badge>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Products Section */}
        {selectedCategory && (
          <div
            ref={productsSectionRef}
            className="mt-16 pt-8 border-t border-border/50"
          >
            <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight break-words">
                  Latest Products in {selectedCategory.name}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              <Link href={getViewAllProductsUrl()} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="btn-shadow bg-transparent w-full sm:w-auto"
                >
                  View All {totalProducts} Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </FadeIn>

            {loadingProducts ? (
              <div className="py-12">
                <BuySellLoader
                  label="Loading products..."
                  size={72}
                  variant="subtle"
                />
              </div>
            ) : products.length > 0 ? (
              <>
                <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      variant="compact"
                      onLike={handleLike}
                    />
                  ))}
                </FadeInStagger>

                {/* Pagination */}
                {totalPages > 1 && (
                  <FadeIn className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} • {totalProducts} total
                      products
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loadingProducts}
                        className="flex items-center space-x-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {getPaginationNumbers().map((page, index) => (
                          <Button
                            key={index}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              typeof page === "number"
                                ? handlePageChange(page)
                                : null
                            }
                            disabled={page === "..." || loadingProducts}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      {/* Next Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loadingProducts}
                        className="flex items-center space-x-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* View All Products Button */}
                    <Link
                      href={getViewAllProductsUrl()}
                      className="w-full sm:w-auto"
                    >
                      <Button className="btn-shadow w-full sm:w-auto">
                        View All Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </FadeIn>
                )}

                {/* View More Products Call-to-Action */}
                <FadeIn className="mt-12 text-center p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                  <h3 className="text-xl font-semibold mb-2">
                    Want to see more products?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Explore all {totalProducts} products in{" "}
                    {selectedCategory.name} with advanced filters and sorting
                    options.
                  </p>
                  <Link href={getViewAllProductsUrl()}>
                    <Button size="lg" className="btn-shadow">
                      Browse All {selectedCategory.name} Products
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </FadeIn>
              </>
            ) : (
              <FadeIn className="text-center py-16">
                <Card className="glass border-0 max-w-md mx-auto">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">{selectedCategory.icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Products Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      There are no products listed in {selectedCategory.name}{" "}
                      yet.
                    </p>
                    <div className="space-y-2">
                      <Link href="/sell">
                        <Button className="w-full">List Your Product</Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory(null);
                          setProducts([]);
                          setTotalProducts(0);
                          setCurrentPage(1);
                        }}
                        className="w-full"
                      >
                        Browse Other Categories
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
