"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product-card";
import { Loader2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FiltersSection } from "@/components/filters/filter-section";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useProductsApi } from "@/hooks/use-product-api";

const ITEMS_PER_PAGE = 30;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastBumpedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

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
      filters: { sortBy },
      page: 1,
      search: debouncedSearchQuery,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [sortBy, debouncedSearchQuery, fetchProducts]);

  // Optimized page change handler with smooth scrolling
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchProducts({
        filters: { sortBy },
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
    setSortBy("newest");
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

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return; // Only trigger when debounce is complete

    setCurrentPage(1);
    fetchProducts({
      filters: { sortBy },
      page: 1,
      search: debouncedSearchQuery,
      itemsPerPage: ITEMS_PER_PAGE,
    });
  }, [debouncedSearchQuery, sortBy, fetchProducts]);

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
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing products from our marketplace
          </p>
        </header>

        {/* Filters Section */}
        <FiltersSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        <section id="products-section">
          {/* Results Info */}
          {resultsInfo && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <p className="text-muted-foreground">
                Showing {resultsInfo.start} to {resultsInfo.end} of{" "}
                {resultsInfo.total.toLocaleString()} products
                {resultsInfo.totalPages > 1 && (
                  <span className="ml-2">
                    (Page {resultsInfo.currentPage} of {resultsInfo.totalPages})
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Products Grid/List */}
              <div
                className={`gap-6 mb-8 ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col space-y-4"
                }`}
              >
                {products.map((product: any, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.05, 0.5),
                    }}
                    onClick={() => handleProductClick(product._id)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === "list" ? "list" : "compact"}
                      onLike={(productId: any) => {
                        console.log("Liked product:", productId);
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex flex-col sm:flex-row items-center justify-between gap-4"
                  aria-label="Pagination"
                >
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="flex items-center space-x-1"
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
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            typeof page === "number"
                              ? handlePageChange(page)
                              : undefined
                          }
                          disabled={page === "..." || isLoading}
                          className="min-w-[40px]"
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
                      className="flex items-center space-x-1"
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
                        className="w-20 h-8 text-center"
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
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No Products Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms to find what
                    you're looking for.
                  </p>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
