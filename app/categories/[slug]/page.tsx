"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CategoryService } from "../../services/Category.Service";
// You may need to create a ProductService if not present
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  const router = useRouter();
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {currentCategory?.name}
          </span>
          {selectedSubcategory && (
            <>
              <span>/</span>
              <span className="text-foreground font-medium">
                {selectedSubcategory.name}
              </span>
            </>
          )}
        </nav>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-background to-muted/30 rounded-2xl p-8 mb-8 border border-border/50 card-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
                  categoryColors[currentCategory?.slug] ||
                  "from-gray-500 to-gray-600"
                } flex items-center justify-center text-4xl shadow-lg text-white`}
              >
                {selectedSubcategory?.icon || currentCategory?.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {selectedSubcategory
                    ? selectedSubcategory.name
                    : currentCategory?.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {totalProducts} products available
                </p>

                {/* Subcategory Selection */}
                {currentCategory?.subcategories?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-3">
                      Filter by subcategory:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={
                          !selectedSubcategory && !subcategoryIdFromUrl
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleSubcategorySelect(null)}
                        className="text-xs h-8"
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
                          className="text-xs h-8 pl-1 pr-3 flex items-center gap-2"
                        >
                          {sub.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Link href="/categories">
              <Button variant="outline" className="btn-shadow bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background/50 rounded-xl p-6 border border-border/50 card-shadow mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Mode */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search in ${
                    selectedSubcategory?.name || currentCategory?.name
                  }...`}
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="pl-10 input-shadow"
                />
              </div>
            </div>

            {/* Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-shadow"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-border/50"
            >
              <div className="space-y-4">
                {/* Condition Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Condition
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className="btn-shadow bg-transparent"
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

                {/* Price Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Min Price
                    </label>
                    <Input
                      placeholder="$0"
                      className="input-shadow"
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
                    <label className="text-sm font-medium mb-2 block">
                      Max Price
                    </label>
                    <Input
                      placeholder="$10,000"
                      className="input-shadow"
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

                {/* Apply/Clear Filters Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="default"
                    onClick={() => {
                      setSearchQuery(pendingSearch);
                      setMinPrice(pendingMinPrice);
                      setMaxPrice(pendingMaxPrice);
                      setSelectedConditions(pendingConditions);
                      setCurrentPage(1);
                      setShowFilters(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
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
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loadingProducts ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
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
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === "list" ? "list" : "compact"}
                      onLike={handleLike}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
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
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
