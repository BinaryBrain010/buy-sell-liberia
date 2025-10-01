"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// Animations
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";
import { FiltersSection } from "@/components/filters/filter-section";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useProductsApi } from "@/hooks/use-product-api";
import ProductListSkeleton from "@/components/ProductListSkeleton";

const ITEMS_PER_PAGE = 30;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // sortBy holds backend field name (createdAt, price, etc.) while sortOrder managed separately
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Custom hook for API calls with better error handling and caching
  const {
    products,
    totalResults,
    totalPages,
    isLoading,
    isSearching,
    error,
    fetchProducts,
    clearError,
  } = useProductsApi();

  // Custom hook for pagination logic
  const paginationNumbers = usePagination({
    currentPage,
    totalPages,
    maxVisible: 5,
  });

  const handleFiltersChange = useCallback(() => {
    setCurrentPage(1);
    setShowFilters(false);
    fetchProducts({
      filters: { sortBy, sortOrder, priceMin, priceMax },
      page: 1,
      search: debouncedSearchQuery,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [
    sortBy,
    sortOrder,
    priceMin,
    priceMax,
    debouncedSearchQuery,
    fetchProducts,
  ]);

  // Optimized page change handler with smooth scrolling
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchProducts({
        filters: { sortBy, sortOrder, priceMin, priceMax },
        page,
        search: debouncedSearchQuery,
        itemsPerPage: ITEMS_PER_PAGE,
      });

      // Smooth scroll to products section
      requestAnimationFrame(() => {
        document.getElementById("products-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [sortBy, debouncedSearchQuery, fetchProducts]
  );

  // Clear all filters handler
  const handleClearFilters = useCallback(() => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setPriceMin(undefined);
    setPriceMax(undefined);
    setSearchQuery("");
    setCurrentPage(1);
    clearError();
    fetchProducts({
      filters: {},
      page: 1,
      search: "",
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [fetchProducts, clearError]);

  // Product click handler
  const handleProductClick = useCallback(
    (productId: string) => {
      router.push(`/products/${productId}`);
    },
    [router]
  );

  // Initial load
  useEffect(() => {
    fetchProducts({
      filters: {},
      page: 1,
      search: "",
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [fetchProducts]);

  // Fetch platform currency once and share with all cards
  useEffect(() => {
    let cancelled = false;
    const getCurrency = async () => {
      try {
        const res = await fetch("/api/admin/settings/currency", {
          cache: "no-store",
        });
        if (!res.ok) return; // keep default
        const data = await res.json();
        if (
          !cancelled &&
          (data?.currency === "USD" || data?.currency === "LRD")
        ) {
          setPlatformCurrency(data.currency);
        }
      } catch {}
    };
    getCurrency();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return; // Only trigger when debounce is complete

    setCurrentPage(1);
    fetchProducts({
      filters: { sortBy, sortOrder, priceMin, priceMax },
      page: 1,
      search: debouncedSearchQuery,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [
    debouncedSearchQuery,
    sortBy,
    sortOrder,
    priceMin,
    priceMax,
    fetchProducts,
  ]);

  // Memoized results info to prevent unnecessary recalculations
  const resultsInfo = useMemo(() => {
    if (totalResults === 0) return null;

    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalResults);

    return {
      start,
      end,
      total: totalResults,
      currentPage,
      totalPages,
    };
  }, [currentPage, totalResults, totalPages]);

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
                <span className="text-2xl">🛍️</span>
                <span className="text-sm font-semibold text-primary">
                  All Products
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Discover Products
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Discover amazing products from our marketplace. Find exactly
                what you're looking for with our advanced search and filtering
                options.
              </p>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {totalResults > 0
                      ? `${totalResults.toLocaleString()} Products`
                      : "Thousands of Products"}
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
                    Quality Assured
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Filters Section */}
        <FadeIn>
          <FiltersSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={(val) => {
              if (val === "price-low") {
                setSortBy("price.amount");
                setSortOrder("asc");
                return;
              }
              if (val === "price-high") {
                setSortBy("price.amount");
                setSortOrder("desc");
                return;
              }
              if (val === "newest") {
                setSortBy("createdAt");
                setSortOrder("desc");
                return;
              }
              setSortBy(val);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onFiltersApply={(f) => {
              // When filters applied explicitly
              if (f.sortBy) {
                if (f.sortBy === "price-low") {
                  setSortBy("price.amount");
                  setSortOrder("asc");
                } else if (f.sortBy === "price-high") {
                  setSortBy("price.amount");
                  setSortOrder("desc");
                } else if (f.sortBy === "newest") {
                  setSortBy("createdAt");
                  setSortOrder("desc");
                } else {
                  setSortBy(f.sortBy);
                }
              }
              // Map condition label(s) to backend values
              const mappedConditions = f.condition?.map((c) =>
                c.toLowerCase().replace(/\s+/g, "-")
              );
              setPriceMin(f.priceMin);
              setPriceMax(f.priceMax);
              fetchProducts({
                filters: {
                  sortBy:
                    f.sortBy === "price-low" || f.sortBy === "price-high"
                      ? "price.amount"
                      : f.sortBy === "newest"
                      ? "createdAt"
                      : f.sortBy || sortBy,
                  sortOrder:
                    f.sortBy === "price-low"
                      ? "asc"
                      : f.sortBy === "price-high"
                      ? "desc"
                      : sortOrder,
                  condition: mappedConditions,
                  priceMin: f.priceMin,
                  priceMax: f.priceMax,
                },
                page: 1,
                search: f.search,
                itemsPerPage: ITEMS_PER_PAGE,
              });
            }}
          />
        </FadeIn>

        {/* Enhanced Error State */}
        {error && (
          <FadeIn>
            <Card className="mb-8 border-2 border-red-200 bg-gradient-to-r from-red-50/50 to-red-100/50 dark:border-red-800 dark:from-red-950/50 dark:to-red-900/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-300">
                        Error Loading Products
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Products Section */}
        <section id="products-section">
          {/* Enhanced Results Info */}
          {resultsInfo && (
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20">
                    <p className="text-foreground font-medium text-sm sm:text-base">
                      Showing {resultsInfo.start} to {resultsInfo.end} of{" "}
                      <span className="font-bold text-primary">
                        {resultsInfo.total.toLocaleString()}
                      </span>{" "}
                      products
                      {resultsInfo.totalPages > 1 && (
                        <span className="ml-2 text-muted-foreground">
                          (Page {resultsInfo.currentPage} of{" "}
                          {resultsInfo.totalPages})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Enhanced Loading State */}
          {isLoading || isSearching ? (
            <FadeIn>
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-primary/5 to-v0-green/5 border border-primary/10 w-fit mx-auto">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {isSearching
                      ? "Searching products..."
                      : "Loading products..."}
                  </span>
                </div>
                <ProductListSkeleton
                  variant={viewMode}
                  count={ITEMS_PER_PAGE / 3}
                />
              </div>
            </FadeIn>
          ) : products.length > 0 ? (
            <>
              {/* Enhanced Products Grid/List */}
              {viewMode === "grid" ? (
                <FadeInStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
                  {products.map((product: any) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                    >
                      <div className="relative">
                        <ProductCard
                          product={product}
                          variant="compact"
                          platformCurrency={platformCurrency}
                          onLike={(productId: any) => {
                            console.log("Liked product:", productId);
                          }}
                        />
                        {/* Enhanced hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </FadeInStagger>
              ) : (
                <FadeInStagger className="flex flex-col space-y-6 mb-12">
                  {products.map((product: any, index: number) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <div className="relative">
                        <ProductCard
                          product={product}
                          variant="list"
                          platformCurrency={platformCurrency}
                          onLike={(productId: any) => {
                            console.log("Liked product:", productId);
                          }}
                        />
                        {/* Enhanced list item styling */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </FadeInStagger>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <FadeIn>
                  <div className="mt-12 p-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                    <nav
                      className="flex flex-col sm:flex-row items-center justify-between gap-4"
                      aria-label="Pagination"
                    >
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/30">
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || isLoading}
                          className="flex items-center space-x-1 border-2 hover:bg-muted/50"
                          aria-label="Go to previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {paginationNumbers.map((page, index) => (
                            <Button
                              key={index}
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                typeof page === "number"
                                  ? handlePageChange(page)
                                  : undefined
                              }
                              disabled={page === "..." || isLoading}
                              className={`min-w-[40px] ${
                                page === currentPage
                                  ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                                  : "border-2 hover:bg-muted/50"
                              }`}
                              aria-label={
                                typeof page === "number"
                                  ? `Go to page ${page}`
                                  : undefined
                              }
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
                          disabled={currentPage === totalPages || isLoading}
                          className="flex items-center space-x-1 border-2 hover:bg-muted/50"
                          aria-label="Go to next page"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Jump to Page */}
                      {totalPages > 10 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <label
                            htmlFor="page-jump"
                            className="text-muted-foreground"
                          >
                            Go to:
                          </label>
                          <Input
                            id="page-jump"
                            type="number"
                            min="1"
                            max={totalPages}
                            placeholder="Page"
                            className="w-20 h-8 text-center border-2"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const page = Number.parseInt(
                                  (e.target as HTMLInputElement).value
                                );
                                if (page >= 1 && page <= totalPages) {
                                  handlePageChange(page);
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                    </nav>
                  </div>
                </FadeIn>
              )}
            </>
          ) : (
            /* Enhanced Empty State */
            <FadeIn>
              <div className="text-center py-16">
                <Card className="max-w-md mx-auto bg-gradient-to-br from-background/80 via-background/60 to-background/80 border-2 border-border/50 shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                        <Search className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">!</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      No Products Found
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      We couldn't find any products matching your criteria. Try
                      adjusting your filters or search terms to discover amazing
                      items.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={handleClearFilters}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Clear All Filters
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-2 hover:bg-muted/50"
                        onClick={() => (window.location.href = "/categories")}
                      >
                        Browse Categories
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          )}
        </section>

        {/* Browse Categories Call-to-Action */}
        {products.length > 0 && (
          <FadeIn>
            <div className="mt-16 text-center p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-3xl border-2 border-border/50 shadow-xl">
              <div className="max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-4">
                  <span className="text-xl">📂</span>
                  <span className="text-sm font-semibold text-primary">
                    Explore More
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Looking for something specific?
                </h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Browse our organized categories to find exactly what you need.
                  From electronics to real estate, we have it all.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button
                    size="lg"
                    className="btn-shadow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => (window.location.href = "/categories")}
                  >
                    Browse All Categories
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-muted/50"
                    onClick={() => (window.location.href = "/sell")}
                  >
                    Sell Your Product
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
