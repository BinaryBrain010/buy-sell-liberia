"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* Hero */}
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center mb-10">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">
                Categories
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                All Categories
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-2">
                {selectedCategory
                  ? `Explore ${selectedCategory.name} products and subcategories`
                  : "Explore products by category"}
              </p>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </section>
        </FadeIn>

        {/* Grid of Category Cards */}
        <FadeInStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-16">
          {categories.map((category) => (
            <Card
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className={`bg-background/50 rounded-xl p-3 border border-border/50 card-shadow hover:scale-105 transition-transform cursor-pointer h-full flex flex-col items-center justify-center text-center
                ${
                  selectedCategory?._id === category._id
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
            >
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    categoryColors[category.slug] || "from-gray-500 to-gray-600"
                  } flex items-center justify-center text-3xl shadow-lg text-white mb-3`}
                >
                  {category.icon}
                </div>
                <h2 className="text-base font-bold mb-1 line-clamp-1">
                  {category.name}
                </h2>
                <p className="text-muted-foreground text-xs line-clamp-2">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </FadeInStagger>

        {/* Subcategories Section */}
        {selectedCategory && (
          <div
            ref={subcategoriesSectionRef}
            className="mt-16 pt-8 border-t border-border/50"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight break-words">
                  {selectedCategory.name} Subcategories
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Choose a specific subcategory or view all products in{" "}
                  {selectedCategory.name}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Link
                  href={getViewAllProductsUrl()}
                  className="w-full sm:w-auto"
                >
                  <Button className="btn-shadow w-full sm:w-auto">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(null);
                    setProducts([]);
                    setTotalProducts(0);
                    setCurrentPage(1);
                  }}
                  aria-label="Clear category selection"
                  className="flex items-center w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {selectedCategory.subcategories &&
            selectedCategory.subcategories.length > 0 ? (
              <FadeInStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {selectedCategory.subcategories.map((subcategory: any) => (
                  <Card
                    key={subcategory._id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="bg-background/50 rounded-xl border border-border/50 card-shadow hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col overflow-hidden group"
                  >
                    <CardContent className="p-0">
                      {/* Subcategory Image */}
                      <div className="relative w-full h-32 mb-3 overflow-hidden">
                        <Image
                          src={
                            getMappedSubcategoryImage(subcategory) ||
                            "/placeholder.svg"
                          }
                          alt={subcategory.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* Category icon overlay */}
                        <div className="absolute top-2 right-2">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                              categoryColors[selectedCategory.slug] ||
                              "from-gray-500 to-gray-600"
                            } flex items-center justify-center text-sm shadow-lg text-white opacity-90 backdrop-blur-sm`}
                          >
                            {subcategory.icon || selectedCategory.icon}
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Subcategory Info */}
                      <div className="px-3 pb-3">
                        <h3 className="text-sm font-semibold mb-1 line-clamp-2 text-center group-hover:text-primary transition-colors">
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="text-muted-foreground text-xs line-clamp-2 text-center">
                            {subcategory.description}
                          </p>
                        )}
                        {/* Product count if available */}
                        {subcategory.productCount !== undefined && (
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            {subcategory.productCount} products
                          </p>
                        )}
                      </div>
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
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
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
