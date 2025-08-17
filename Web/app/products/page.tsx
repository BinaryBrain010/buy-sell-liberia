"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Grid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import {
  AdvancedFilters,
  FilterState,
} from "@/components/filters/advanced-filters";
import { ProductCard } from "@/components/product-card";
import axios from "axios";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  location: {
    city: string;
    state?: string;
    country: string;
  };
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
    order: number;
  }[];
  customFields: {
    fieldName: string;
    value: any;
  }[];
  status: string;
  created_at: string;
  expires_at: string;
  slug: string;
  user_id: {
    firstName: string;
    lastName: string;
    profile?: {
      displayName?: string;
      avatar?: string;
    };
  };
  views: number;
  featured: boolean;
}

export default function ProductsPage() {
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const itemsPerPage = 30; // Show 30 products per page (10 rows × 3 columns)

  // Fetch products using filter API
  const fetchProducts = async (
    filtersToApply: FilterState,
    page = 1,
    search = false
  ) => {
    if (search) setSearchLoading(true);
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", itemsPerPage.toString());
      params.append("page", page.toString());
      // Category & Subcategory
      if (filtersToApply.category)
        params.append("category", filtersToApply.category);
      if (filtersToApply.subcategory)
        params.append("subCategory", filtersToApply.subcategory);
      // Location
      if (filtersToApply.location)
        params.append("location", filtersToApply.location);
      // Price
      if (filtersToApply.priceMin !== undefined)
        params.append("priceMin", filtersToApply.priceMin.toString());
      if (filtersToApply.priceMax !== undefined)
        params.append("priceMax", filtersToApply.priceMax.toString());
      // Time filter
      if (filtersToApply.timeFilter)
        params.append("timeFilter", filtersToApply.timeFilter);
      // Sort
      if (filtersToApply.sortBy) params.append("sortBy", filtersToApply.sortBy);
      if (filtersToApply.sortOrder)
        params.append("sortOrder", filtersToApply.sortOrder);
      // Custom filters
      if (filtersToApply.customFilters) {
        Object.entries(filtersToApply.customFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== "any") {
            params.append(`cf_${key}`, value.toString());
          }
        });
      }
      // Search query
      if (search && searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await axios.get(
        `/api/filter/product?${params.toString()}`
      );
      setProducts(response.data.products || []);
      setTotalResults(
        response.data.totalItems || response.data.products?.length || 0
      );
      setTotalPages(
        Math.ceil(
          (response.data.totalItems || response.data.products?.length || 0) /
            itemsPerPage
        )
      );
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setProductsLoading(false);
      setSearchLoading(false);
    }
  };

  // Handle filter changes and close modal after applying
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(newFilters, 1);
    setShowFilters(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(filters, 1, true);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(filters, page);
    // Scroll to top of products section
    const productsSection = document.getElementById("products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Initial load and mount check
  useEffect(() => {
    setIsMounted(true);
    fetchProducts({}, 1, false);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing products from our marketplace
          </p>
        </div>

        {/* Search Bar with Filter Button */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-20 h-12 text-lg glass border-0 w-full"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-12"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </form>
        </div>

        {/* Filter Modal - appears when filter button is clicked */}
        {showFilters && (
          <div className="w-full mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800 max-w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Filter Products</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AdvancedFilters
                categories={categories}
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                totalResults={totalResults}
                isLoading={productsLoading}
              />
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div id="products-section">
          {/* View Mode Toggle & Results Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              {totalResults > 0 && (
                <p className="text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalResults)} of{" "}
                  {totalResults.toLocaleString()} products
                  {totalPages > 1 && (
                    <span className="ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {productsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4 mb-8"
                }
              >
                {products.map((product: any, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    {viewMode === "grid" ? (
                      <ProductCard
                        product={product}
                        variant="compact"
                        onLike={(productId) => {
                          // TODO: Implement like functionality
                          console.log("Liked product:", productId);
                        }}
                      />
                    ) : (
                      <Card className="overflow-hidden border-0 card-shadow hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={
                                  product.images?.[0]?.url || "/placeholder.jpg"
                                }
                                alt={product.title}
                                width={150}
                                height={100}
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                              {product.featured && (
                                <span className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-xs px-2 py-1 rounded text-white">
                                  Featured
                                </span>
                              )}
                            </div>
                            {/* Product Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg flex-1">
                                    {product.title}
                                  </h3>
                                  <span className="text-2xl font-bold text-primary">
                                    {product.price?.amount
                                      ? `$${product.price.amount}`
                                      : "-"}
                                  </span>
                                  {product.price?.negotiable && (
                                    <span className="ml-2 text-xs text-green-600 font-semibold">
                                      Negotiable
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                                  <span className="flex items-center">
                                    <svg
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 22s8-7.333 8-12A8 8 0 0 0 4 10c0 4.667 8 12 8 12z"
                                      />
                                    </svg>
                                    {product.location?.city ||
                                      product.location?.state ||
                                      product.location?.country ||
                                      "Unknown location"}
                                  </span>
                                  <span className="flex items-center">
                                    <svg
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v6l4 2"
                                      />
                                    </svg>
                                    {new Date(
                                      product.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                  {product.views !== undefined && (
                                    <span className="flex items-center">
                                      <svg
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle cx="12" cy="12" r="10" />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                                        />
                                      </svg>
                                      {product.views} views
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {product.category && (
                                    <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                                      {product.category}
                                    </span>
                                  )}
                                  {(product.subcategory ||
                                    product.subCategory) && (
                                    <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                                      {product.subcategory ||
                                        product.subCategory}
                                    </span>
                                  )}
                                  {product.condition && (
                                    <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                                      {product.condition}
                                    </span>
                                  )}
                                  {Array.isArray(product.tags) &&
                                    product.tags.map(
                                      (tag: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="bg-gray-100 text-xs px-2 py-1 rounded border"
                                        >
                                          {tag}
                                        </span>
                                      )
                                    )}
                                </div>
                                <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                                  {product.description || (
                                    <span className="italic text-gray-400">
                                      No description available
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <svg
                                      className="h-4 w-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="12" cy="7" r="4" />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5.5 21a7.5 7.5 0 0 1 13 0"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {product.user_id?.profile?.displayName ||
                                      product.user_id?.fullName ||
                                      (product.user_id?.firstName &&
                                      product.user_id?.lastName
                                        ? `${product.user_id.firstName} ${product.user_id.lastName}`
                                        : product.user_id?.firstName
                                        ? product.user_id.firstName
                                        : product.user_id?.lastName
                                        ? product.user_id.lastName
                                        : product.user_id?.username
                                        ? product.user_id.username
                                        : "Unknown Name")}
                                  </span>
                                </div>
                                <Button
                                  className="btn-shadow"
                                  onClick={() => {
                                    /* TODO: Show contact popup as in grid view */
                                  }}
                                >
                                  Contact Seller
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || productsLoading}
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
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            typeof page === "number"
                              ? handlePageChange(page)
                              : null
                          }
                          disabled={page === "..." || productsLoading}
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
                      disabled={currentPage === totalPages || productsLoading}
                      className="flex items-center space-x-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Jump to page input (for large datasets) */}
                  {totalPages > 10 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Go to:</span>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder="Page"
                        className="w-20 h-8 text-center"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const page = parseInt(
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
                    Try adjusting your filters or search terms to find what
                    you're looking for.
                  </p>
                  <Button
                    onClick={() => {
                      setFilters({});
                      setSearchQuery("");
                      setCurrentPage(1);
                      fetchProducts({});
                    }}
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
