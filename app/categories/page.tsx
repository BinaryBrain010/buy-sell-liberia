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

// Subcategory image mappings - you can replace these with actual images from your API
const getSubcategoryImage = (subcategoryName: string, categorySlug: string) => {
  const name = subcategoryName.toLowerCase();
  const category = categorySlug.toLowerCase();

  // Electronics subcategories
  if (category === "electronics") {
    if (name.includes("phone") || name.includes("mobile"))
      return "/placeholder.svg?height=128&width=200&text=📱+Phones";
    if (name.includes("laptop") || name.includes("computer"))
      return "/placeholder.svg?height=128&width=200&text=💻+Laptops";
    if (name.includes("tv") || name.includes("television"))
      return "/placeholder.svg?height=128&width=200&text=📺+TVs";
    if (name.includes("camera"))
      return "/placeholder.svg?height=128&width=200&text=📷+Cameras";
    if (name.includes("headphone") || name.includes("audio"))
      return "/placeholder.svg?height=128&width=200&text=🎧+Audio";
    if (name.includes("gaming") || name.includes("console"))
      return "/placeholder.svg?height=128&width=200&text=🎮+Gaming";
    if (name.includes("tablet"))
      return "/placeholder.svg?height=128&width=200&text=📱+Tablets";
    if (name.includes("watch") || name.includes("wearable"))
      return "/placeholder.svg?height=128&width=200&text=⌚+Wearables";
  }

  // Vehicles subcategories
  if (category === "vehicles") {
    if (name.includes("car") || name.includes("sedan") || name.includes("suv"))
      return "/placeholder.svg?height=128&width=200&text=🚗+Cars";
    if (name.includes("motorcycle") || name.includes("bike"))
      return "/placeholder.svg?height=128&width=200&text=🏍️+Motorcycles";
    if (name.includes("truck"))
      return "/placeholder.svg?height=128&width=200&text=🚛+Trucks";
    if (name.includes("boat") || name.includes("marine"))
      return "/placeholder.svg?height=128&width=200&text=⛵+Boats";
    if (name.includes("rv") || name.includes("camper"))
      return "/placeholder.svg?height=128&width=200&text=🚐+RVs";
    if (name.includes("part") || name.includes("accessory"))
      return "/placeholder.svg?height=128&width=200&text=🔧+Parts";
  }

  // Real Estate subcategories
  if (category === "real-estate") {
    if (name.includes("house") || name.includes("home"))
      return "/placeholder.svg?height=128&width=200&text=🏠+Houses";
    if (name.includes("apartment") || name.includes("condo"))
      return "/placeholder.svg?height=128&width=200&text=🏢+Apartments";
    if (name.includes("commercial") || name.includes("office"))
      return "/placeholder.svg?height=128&width=200&text=🏢+Commercial";
    if (name.includes("land") || name.includes("lot"))
      return "/placeholder.svg?height=128&width=200&text=🌳+Land";
    if (name.includes("rental") || name.includes("rent"))
      return "/placeholder.svg?height=128&width=200&text=🏠+Rentals";
  }

  // Home & Furniture subcategories
  if (category === "home-furniture") {
    if (name.includes("sofa") || name.includes("couch"))
      return "/placeholder.svg?height=128&width=200&text=🛋️+Sofas";
    if (name.includes("bed") || name.includes("mattress"))
      return "/placeholder.svg?height=128&width=200&text=🛏️+Beds";
    if (name.includes("table") || name.includes("desk"))
      return "/placeholder.svg?height=128&width=200&text=🪑+Tables";
    if (name.includes("chair"))
      return "/placeholder.svg?height=128&width=200&text=🪑+Chairs";
    if (name.includes("kitchen"))
      return "/placeholder.svg?height=128&width=200&text=🍽️+Kitchen";
    if (name.includes("decor") || name.includes("decoration"))
      return "/placeholder.svg?height=128&width=200&text=🖼️+Decor";
    if (name.includes("storage") || name.includes("cabinet"))
      return "/placeholder.svg?height=128&width=200&text=🗄️+Storage";
  }

  // Fashion & Beauty subcategories
  if (category === "fashion-beauty") {
    if (name.includes("clothing") || name.includes("apparel"))
      return "/placeholder.svg?height=128&width=200&text=👕+Clothing";
    if (name.includes("shoes") || name.includes("footwear"))
      return "/placeholder.svg?height=128&width=200&text=👟+Shoes";
    if (name.includes("bag") || name.includes("handbag"))
      return "/placeholder.svg?height=128&width=200&text=👜+Bags";
    if (name.includes("jewelry") || name.includes("accessory"))
      return "/placeholder.svg?height=128&width=200&text=💍+Jewelry";
    if (name.includes("makeup") || name.includes("cosmetic"))
      return "/placeholder.svg?height=128&width=200&text=💄+Makeup";
    if (name.includes("skincare") || name.includes("beauty"))
      return "/placeholder.svg?height=128&width=200&text=🧴+Skincare";
    if (name.includes("fragrance") || name.includes("perfume"))
      return "/placeholder.svg?height=128&width=200&text=🌸+Fragrance";
  }

  // Sports & Outdoors subcategories
  if (category === "sports-outdoors") {
    if (name.includes("fitness") || name.includes("gym"))
      return "/placeholder.svg?height=128&width=200&text=🏋️+Fitness";
    if (name.includes("camping") || name.includes("outdoor"))
      return "/placeholder.svg?height=128&width=200&text=⛺+Camping";
    if (name.includes("cycling") || name.includes("bike"))
      return "/placeholder.svg?height=128&width=200&text=🚴+Cycling";
    if (name.includes("water") || name.includes("swimming"))
      return "/placeholder.svg?height=128&width=200&text=🏊+Water+Sports";
    if (name.includes("team") || name.includes("ball"))
      return "/placeholder.svg?height=128&width=200&text=⚽+Team+Sports";
    if (name.includes("hunting") || name.includes("fishing"))
      return "/placeholder.svg?height=128&width=200&text=🎣+Hunting";
  }

  // Babies & Kids subcategories
  if (category === "babies-kids") {
    if (name.includes("toy") || name.includes("game"))
      return "/placeholder.svg?height=128&width=200&text=🧸+Toys";
    if (name.includes("clothing") || name.includes("apparel"))
      return "/placeholder.svg?height=128&width=200&text=👶+Clothing";
    if (name.includes("stroller") || name.includes("gear"))
      return "/placeholder.svg?height=128&width=200&text=🍼+Baby+Gear";
    if (name.includes("furniture") || name.includes("crib"))
      return "/placeholder.svg?height=128&width=200&text=🛏️+Furniture";
    if (name.includes("book") || name.includes("educational"))
      return "/placeholder.svg?height=128&width=200&text=📚+Books";
  }

  // Default fallback with category-specific emoji
  const categoryEmojis: { [key: string]: string } = {
    electronics: "📱",
    vehicles: "🚗",
    "real-estate": "🏠",
    "home-furniture": "🛋️",
    "fashion-beauty": "👗",
    "babies-kids": "🧸",
    "tools-equipment": "🔧",
    services: "🛠️",
    jobs: "💼",
    "sports-outdoors": "⚽",
    "computers-accessories": "💻",
    "kitchen-appliances": "🍽️",
    "agriculture-farming": "🌾",
    "books-stationery": "📚",
    "health-wellness": "💊",
    "pets-animals": "🐕",
    "entertainment-hobbies": "🎭",
  };

  const emoji = categoryEmojis[category] || "📦";
  return `/placeholder.svg?height=128&width=200&text=${emoji}+${encodeURIComponent(
    subcategoryName
  )}`;
};

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

  // Fetch all categories on initial load
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
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            All Categories
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedCategory
              ? `Explore ${selectedCategory.name} products and subcategories`
              : "Explore products by category"}
          </p>
        </div>

        {/* Grid of Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-16">
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
        </div>

        {/* Subcategories Section */}
        {selectedCategory && (
          <div
            ref={subcategoriesSectionRef}
            className="mt-16 pt-8 border-t border-border/50"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedCategory.name} Subcategories
                </h2>
                <p className="text-muted-foreground">
                  Choose a specific subcategory or view all products in{" "}
                  {selectedCategory.name}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={getViewAllProductsUrl()}>
                  <Button className="btn-shadow">
                    View All Products
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
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {selectedCategory.subcategories &&
            selectedCategory.subcategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                            subcategory.image?.url ||
                            getSubcategoryImage(
                              subcategory.name,
                              selectedCategory.slug
                            ) ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={subcategory.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = getSubcategoryImage(
                              subcategory.name,
                              selectedCategory.slug
                            );
                          }}
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
              </div>
            ) : (
              <div className="text-center py-12">
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
              </div>
            )}

            {/* Quick Stats */}
            {selectedCategory.subcategories &&
              selectedCategory.subcategories.length > 0 && (
                <div className="mt-8 p-6 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">Category Overview</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory.subcategories.length} subcategories
                        available in {selectedCategory.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Latest Products in {selectedCategory.name}
                </h2>
                <p className="text-muted-foreground">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              <Link href={getViewAllProductsUrl()}>
                <Button variant="outline" className="btn-shadow bg-transparent">
                  View All {totalProducts} Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
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
                    <ProductCard
                      key={product._id}
                      product={product}
                      variant="compact"
                      onLike={handleLike}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
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
                    <Link href={getViewAllProductsUrl()}>
                      <Button className="btn-shadow">
                        View All Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* View More Products Call-to-Action */}
                <div className="mt-12 text-center p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
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
                </div>
              </>
            ) : (
              <div className="text-center py-16">
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
