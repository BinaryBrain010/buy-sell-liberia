"use client";

import { useState, useEffect, Key, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from "next/link";
import { ProductCard } from "@/components/product-card";

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
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Number of products to show per page
  const productsSectionRef = useRef<HTMLDivElement>(null); // Ref for the products section

  // 1. Fetch all categories on initial load
  useEffect(() => {
    setLoadingCategories(true);
    fetch("/api/categories?includeProducts=false&limit=100")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  // 2. Fetch products when selectedCategoryId or currentPage changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      setTotalProducts(0);
      setCurrentPage(1);
      return;
    }

    setLoadingProducts(true);
    const fetchCategoryProducts = async () => {
      try {
        const url = `/api/products?category_id=${encodeURIComponent(selectedCategoryId)}&limit=${itemsPerPage}&page=${currentPage}`;
        console.log(`[CategoriesPage] Fetching products for category ID: ${selectedCategoryId}, Page: ${currentPage}, URL: ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error(`Error fetching products for category ${selectedCategoryId}:`, error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategoryId, currentPage]);

  // 3. Scroll to products section when selectedCategoryId changes and products section is rendered
  useEffect(() => {
    if (selectedCategoryId && productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategoryId]); // This effect runs after selectedCategoryId updates and re-render occurs

  // Handle category card click
  const handleCategoryClick = (category: any) => {
    setSelectedCategoryId(category._id);
    setSelectedCategoryName(category.name);
    setCurrentPage(1); // Reset to first page when a new category is selected
    // The scrolling logic is now in the useEffect above
  };

  // Handle pagination for products
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages for products
  const totalProductPages = Math.ceil(totalProducts / itemsPerPage);

  // Generate pagination numbers for products
  const getProductPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalProductPages <= maxVisible) {
      for (let i = 1; i <= totalProductPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalProductPages, start + maxVisible - 1);
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalProductPages) {
        if (end < totalProductPages - 1) pages.push("...");
        pages.push(totalProductPages);
      }
    }
    return pages;
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
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            All Categories
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore products by category
          </p>
        </div>

        {/* Grid of Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-16">
          {categories.map((category) => (
            <Card
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className={`bg-background/50 rounded-xl p-3 border border-border/50 card-shadow hover:scale-105 transition-transform cursor-pointer h-full flex flex-col items-center justify-center text-center
                ${selectedCategoryId === category._id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    categoryColors[category.slug] ||
                    "from-gray-500 to-gray-600"
                  } flex items-center justify-center text-3xl shadow-lg text-white mb-3`}
                >
                  {category.icon}
                </div>
                <h2 className="text-base font-bold mb-1 line-clamp-1">{category.name}</h2>
                <p className="text-muted-foreground text-xs line-clamp-2">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products Section (conditionally rendered) */}
        {selectedCategoryId && (
          <div ref={productsSectionRef} className="mt-16 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                Products in {selectedCategoryName}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategoryId(null)}
                aria-label="Clear category filter"
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`} passHref>
                      <ProductCard
                        product={product}
                        variant="compact"
                        onLike={(productId: any) => {
                          console.log("Liked product:", productId);
                          // Implement actual like logic here
                        }}
                      />
                    </Link>
                  ))}
                </div>

                {/* Pagination for Products */}
                {totalProductPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalProductPages}
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
                        {getProductPaginationNumbers().map((page, index) => (
                          <Button
                            key={index}
                            variant={page === currentPage ? "default" : "outline"}
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
                        disabled={currentPage === totalProductPages || loadingProducts}
                        className="flex items-center space-x-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Card className="glass border-0 max-w-md mx-auto">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Products Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      There are no products listed for this category yet.
                    </p>
                    <Button
                      onClick={() => setSelectedCategoryId(null)}
                      variant="outline"
                    >
                      View All Categories
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
