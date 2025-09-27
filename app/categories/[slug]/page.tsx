"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CategoryService } from "../../services/Category.Service";
import { motion } from "framer-motion";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { ProductCard, type Product } from "@/components/product-card";

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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  // Get IDs from URL parameters
  const categoryIdFromUrl = searchParams?.get("category_id");
  const subcategoryIdFromUrl = searchParams?.get("subcategory_id");

  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );
  // Applied filter/search state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Pending filter/search state (for UI inputs)
  const [pendingConditions, setPendingConditions] = useState<string[]>([]);
  const [pendingMinPrice, setPendingMinPrice] = useState("");
  const [pendingMaxPrice, setPendingMaxPrice] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleLike = (productId: string) => {
    // Placeholder for like functionality
    console.log(`Product ${productId} liked`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const getPaginationNumbers = () => {
    const paginationNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      paginationNumbers.push(i);
    }

    if (startPage > 1) {
      paginationNumbers.unshift("...");
    }

    if (endPage < totalPages) {
      paginationNumbers.push("...");
    }

    return paginationNumbers;
  };

  // Fetch category details using CategoryService
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const service = new CategoryService();
        const data = await service.getCategories({ slug });
        const category =
          data.category ||
          data.categories?.find((cat: any) => cat.slug === slug);
        setCurrentCategory(category);
        // Find subcategory if specified in URL
        if (subcategoryIdFromUrl && category?.subcategories) {
          const subcategory = category.subcategories.find(
            (sub: any) => sub._id?.toString() === subcategoryIdFromUrl
          );
          setSelectedSubcategory(subcategory);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchCategory();
    }
  }, [slug, subcategoryIdFromUrl]);

  // Fetch platform currency once and share with product cards
  useEffect(() => {
    let cancelled = false;
    const getCurrency = async () => {
      try {
        const res = await fetch("/api/admin/settings/currency", {
          cache: "no-store",
        });
        if (!res.ok) return;
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

  // Fetch products using a ProductService (must exist in your services folder)
  const fetchProducts = useCallback(async () => {
    const categoryId = categoryIdFromUrl || currentCategory?._id;
    if (!categoryId) return;
    setLoadingProducts(true);
    try {
      const { ProductService } = await import("../../services/Product.Service");
      const productService = new ProductService();
      // Build filters and options for ProductService
      const filters: any = {
        category_id: categoryId,
      };
      // Use selectedSubcategory if set, else subcategoryIdFromUrl
      const subcategoryId = selectedSubcategory?._id || subcategoryIdFromUrl;
      if (subcategoryId) filters.subcategory_id = subcategoryId;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (selectedConditions.length > 0) filters.condition = selectedConditions;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);

      // No sort options, always use default sort
      let sortOptions: any = {};
      // Pagination
      const pagination = { page: currentPage, limit: itemsPerPage };

      const data = await productService.getProducts(
        filters,
        sortOptions,
        pagination
      );

      // Map API Product to UI Product, using category/subcategory names
      const mappedProducts = (data.products || []).map((p: any) => {
        let categoryName = "";
        let subCategoryName = "";
        if (currentCategory) {
          categoryName = currentCategory.name;
          if (
            p.subcategory_id &&
            Array.isArray(currentCategory.subcategories)
          ) {
            const subcat = currentCategory.subcategories.find(
              (s: any) =>
                s._id === p.subcategory_id || s.slug === p.subcategory_id
            );
            if (subcat) subCategoryName = subcat.name;
          }
        }
        return {
          _id: p._id || p.id,
          title: p.title,
          description: p.description,
          price: p.price,
          category: categoryName,
          subCategory: subCategoryName,
          condition: p.condition,
          images: Array.isArray(p.images)
            ? p.images.map((img: any) =>
                typeof img === "string" ? { url: img } : img
              )
            : [],
          titleImageIndex: p.titleImageIndex ?? 0,
          location: p.location || { city: "", country: "" },
          contactInfo: p.contactInfo || {},
          seller: p.seller || "",
          status: p.status,
          tags: p.tags || [],
          negotiable: p.price?.negotiable ?? false,
          showPhoneNumber: p.showPhoneNumber ?? false,
          views: p.views ?? 0,
          featured: p.featured ?? false,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });
      setProducts(mappedProducts);
      setTotalProducts(data.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoadingProducts(false);
    }
  }, [
    categoryIdFromUrl,
    currentCategory?._id,
    subcategoryIdFromUrl,
    selectedSubcategory?._id,
    currentPage,
    searchQuery,
    selectedConditions,
    minPrice,
    maxPrice,
    // sortBy removed
  ]);

  // Fetch products whenever filters/search/page change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCategory?._id,
    selectedSubcategory?._id,
    currentPage,
    searchQuery,
    selectedConditions,
    minPrice,
    maxPrice,
  ]);

  // Reset page to 1 when filters/search change (except page itself)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedConditions,
    minPrice,
    maxPrice,
    selectedSubcategory?._id,
  ]);

  // Sync pending state with applied state when category/subcategory changes
  useEffect(() => {
    setPendingSearch(searchQuery);
    setPendingMinPrice(minPrice);
    setPendingMaxPrice(maxPrice);
    setPendingConditions(selectedConditions);
  }, [
    searchQuery,
    minPrice,
    maxPrice,
    selectedConditions,
    currentCategory?._id,
    selectedSubcategory?._id,
  ]);

  // Add function to handle subcategory selection
  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);

    // Update URL with both category and subcategory IDs
    const categoryId = categoryIdFromUrl || currentCategory?._id;
    const newUrl = subcategory
      ? `/categories/${slug}?category_id=${encodeURIComponent(
          categoryId
        )}&subcategory_id=${encodeURIComponent(subcategory._id)}`
      : `/categories/${slug}?category_id=${encodeURIComponent(categoryId)}`;

    window.history.pushState({}, "", newUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The category you're looking for doesn't exist.
            </p>
            <Link href="/categories">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium break-words">
              {currentCategory?.name}
            </span>
            {selectedSubcategory && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium break-words">
                  {selectedSubcategory.name}
                </span>
              </>
            )}
          </nav>
        </FadeIn>

        {/* Enhanced Category Header */}
        <FadeIn>
          <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background rounded-3xl p-8 md:p-12 mb-12 border-2 border-border/30 shadow-2xl">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
            </div>
            
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6 md:gap-8">
                <div
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${
                    categoryColors[currentCategory?.slug] ||
                    "from-gray-500 to-gray-600"
                  } flex items-center justify-center text-5xl shadow-2xl text-white ring-8 ring-white/20`}
                >
                  {selectedSubcategory?.icon || currentCategory?.icon}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight break-words bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {selectedSubcategory
                      ? selectedSubcategory.name
                      : currentCategory?.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground text-lg md:text-xl">
                      {totalProducts} products available
                    </p>
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Active Category
                      </span>
                    </div>
                  </div>

                  {/* Subcategory Selection */}
                  {currentCategory?.subcategories?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-3">
                        Filter by subcategory:
                      </p>
                      <div className="-mx-4 px-4 overflow-x-auto overflow-y-hidden whitespace-nowrap flex gap-2">
                        <Button
                          variant={
                            !selectedSubcategory && !subcategoryIdFromUrl
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleSubcategorySelect(null)}
                          className="text-xs h-8 shrink-0"
                        >
                          All {currentCategory.name}
                        </Button>
                        {currentCategory.subcategories.map((sub: any) => (
                          <Button
                            key={sub._id}
                            variant={
                              selectedSubcategory?._id === sub._id ||
                              subcategoryIdFromUrl === sub._id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleSubcategorySelect(sub)}
                            className="text-xs h-8 pl-1 pr-3 flex items-center gap-2 shrink-0"
                          >
                            {sub.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="self-start md:self-auto">
                <Link href="/categories" className="w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="btn-shadow bg-transparent w-full md:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Enhanced Search and Filters section */}
        <FadeIn>
          <div className="bg-gradient-to-br from-background/80 via-background/60 to-background/80 rounded-2xl p-6 sm:p-8 border-2 border-border/30 card-shadow mb-12 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Enhanced Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder={`Search in ${
                      selectedSubcategory?.name || currentCategory?.name
                    }...`}
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 text-base rounded-xl border-2 border-border/30 focus:border-primary/50 transition-colors input-shadow"
                  />
                </div>
              </div>

              {/* Enhanced Filters Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-shadow w-full sm:w-auto border-2 border-border/30 hover:border-primary/50 transition-colors px-6 py-3"
                aria-expanded={showFilters}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Advanced Filters
                <ChevronDown
                  className={`h-5 w-5 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Enhanced Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t-2 border-border/30"
              >
                <div className="space-y-6">
                  {/* Condition Filter */}
                  <div>
                    <label className="text-lg font-semibold mb-4 block text-foreground">
                      Product Condition
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Brand New", "Like New", "Good", "Fair", "Poor"].map(
                        (condition) => (
                          <Button
                            key={condition}
                            variant={
                              pendingConditions.includes(condition)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={`btn-shadow transition-all duration-200 ${
                              pendingConditions.includes(condition)
                                ? "bg-gradient-to-r from-primary to-v0-dark-blue text-white border-0"
                                : "bg-transparent border-2 border-border/30 hover:border-primary/50"
                            }`}
                            onClick={() => {
                              setPendingConditions((prev) =>
                                prev.includes(condition)
                                  ? prev.filter((c) => c !== condition)
                                  : [...prev, condition]
                              );
                            }}
                          >
                            {condition}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Enhanced Price Range */}
                  <div>
                    <label className="text-lg font-semibold mb-4 block text-foreground">
                      Price Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-muted-foreground">
                          Minimum Price
                        </label>
                        <Input
                          placeholder="$0"
                          className="input-shadow border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                          value={pendingMinPrice}
                          onChange={(e) =>
                            setPendingMinPrice(
                              e.target.value.replace(/[^\d.]/g, "")
                            )
                          }
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-muted-foreground">
                          Maximum Price
                        </label>
                        <Input
                          placeholder="$10,000"
                          className="input-shadow border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl"
                          value={pendingMaxPrice}
                          onChange={(e) =>
                            setPendingMaxPrice(
                              e.target.value.replace(/[^\d.]/g, "")
                            )
                          }
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Apply/Clear Filters Buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setPendingSearch("");
                        setPendingMinPrice("");
                        setPendingMaxPrice("");
                        setPendingConditions([]);
                        setSearchQuery("");
                        setMinPrice("");
                        setMaxPrice("");
                        setSelectedConditions([]);
                        setCurrentPage(1);
                        setShowFilters(false);
                      }}
                      className="w-full sm:w-auto border-2 border-border/30 hover:border-red-500/50 hover:text-red-600 transition-colors px-6"
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => {
                        setSearchQuery(pendingSearch);
                        setMinPrice(pendingMinPrice);
                        setMaxPrice(pendingMaxPrice);
                        setSelectedConditions(pendingConditions);
                        setCurrentPage(1);
                        setShowFilters(false);
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 px-6"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </FadeIn>

        {/* Products Grid */}
        <FadeIn>
          {loadingProducts ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <FadeIn className="text-center py-20">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">
                  {selectedSubcategory?.icon || currentCategory?.icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : `Be the first to list a product in ${
                      selectedSubcategory?.name || currentCategory?.name
                    }.`}
              </p>
              <div className="space-x-4">
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
                <Link href="/sell">
                  <Button>List Your Product</Button>
                </Link>
              </div>
            </FadeIn>
          ) : (
            <>
              <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant="compact"
                    platformCurrency={platformCurrency}
                    onLike={handleLike}
                  />
                ))}
              </FadeInStagger>

              {/* Pagination */}
              {totalPages > 1 && (
                <FadeIn className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
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
                      disabled={currentPage === totalPages || loadingProducts}
                      className="flex items-center space-x-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
