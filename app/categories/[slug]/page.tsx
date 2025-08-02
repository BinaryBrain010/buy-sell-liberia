"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Grid3X3,
  List,
  MapPin,
  Clock,
  Star,
  Heart,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
// import { AdvancedFilters } from "@/components/filters/advanced-filters"

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

// Mock products data - In real app, this would come from API
const generateMockProducts = (categoryName: string, count: number = 12) => {
  const products = [];
  const baseProducts = {
    Electronics: [
      {
        name: "iPhone 15 Pro Max",
        price: "$1,199",
        image: "/placeholder.svg?height=200&width=300&text=iPhone+15",
        condition: "Brand New",
      },
      {
        name: "Samsung Galaxy S24",
        price: "$899",
        image: "/placeholder.svg?height=200&width=300&text=Samsung+S24",
        condition: "Like New",
      },
      {
        name: "MacBook Pro M3",
        price: "$2,499",
        image: "/placeholder.svg?height=200&width=300&text=MacBook+Pro",
        condition: "Brand New",
      },
      {
        name: "iPad Air 5th Gen",
        price: "$699",
        image: "/placeholder.svg?height=200&width=300&text=iPad+Air",
        condition: "Good",
      },
      {
        name: "Sony WH-1000XM5",
        price: "$349",
        image: "/placeholder.svg?height=200&width=300&text=Sony+Headphones",
        condition: "Brand New",
      },
      {
        name: "Dell XPS 13",
        price: "$1,299",
        image: "/placeholder.svg?height=200&width=300&text=Dell+XPS",
        condition: "Like New",
      },
    ],
    Vehicles: [
      {
        name: "2023 Toyota Camry",
        price: "$28,500",
        image: "/placeholder.svg?height=200&width=300&text=Toyota+Camry",
        condition: "Excellent",
      },
      {
        name: "2022 Honda Civic",
        price: "$24,900",
        image: "/placeholder.svg?height=200&width=300&text=Honda+Civic",
        condition: "Good",
      },
      {
        name: "2021 BMW X3",
        price: "$42,000",
        image: "/placeholder.svg?height=200&width=300&text=BMW+X3",
        condition: "Excellent",
      },
      {
        name: "2020 Tesla Model 3",
        price: "$35,000",
        image: "/placeholder.svg?height=200&width=300&text=Tesla+Model+3",
        condition: "Good",
      },
      {
        name: "2023 Ford F-150",
        price: "$38,500",
        image: "/placeholder.svg?height=200&width=300&text=Ford+F150",
        condition: "Brand New",
      },
      {
        name: "2022 Subaru Outback",
        price: "$29,900",
        image: "/placeholder.svg?height=200&width=300&text=Subaru+Outback",
        condition: "Like New",
      },
    ],
    "Real Estate": [
      {
        name: "3BR Downtown Apartment",
        price: "$450,000",
        image: "/placeholder.svg?height=200&width=300&text=Apartment",
        condition: "Move-in Ready",
      },
      {
        name: "4BR Suburban House",
        price: "$685,000",
        image: "/placeholder.svg?height=200&width=300&text=House",
        condition: "Newly Renovated",
      },
      {
        name: "2BR City Condo",
        price: "$320,000",
        image: "/placeholder.svg?height=200&width=300&text=Condo",
        condition: "Good",
      },
      {
        name: "Commercial Office Space",
        price: "$1,200,000",
        image: "/placeholder.svg?height=200&width=300&text=Office",
        condition: "Excellent",
      },
      {
        name: "1BR Studio Loft",
        price: "$285,000",
        image: "/placeholder.svg?height=200&width=300&text=Loft",
        condition: "Modern",
      },
      {
        name: "5BR Family Home",
        price: "$750,000",
        image: "/placeholder.svg?height=200&width=300&text=Family+Home",
        condition: "Excellent",
      },
    ],
  };

  const defaultProducts = [
    {
      name: `${categoryName} Item 1`,
      price: "$199",
      image: "/placeholder.svg?height=200&width=300&text=Product+1",
      condition: "Brand New",
    },
    {
      name: `${categoryName} Item 2`,
      price: "$299",
      image: "/placeholder.svg?height=200&width=300&text=Product+2",
      condition: "Like New",
    },
    {
      name: `${categoryName} Item 3`,
      price: "$149",
      image: "/placeholder.svg?height=200&width=300&text=Product+3",
      condition: "Good",
    },
    {
      name: `${categoryName} Item 4`,
      price: "$399",
      image: "/placeholder.svg?height=200&width=300&text=Product+4",
      condition: "Excellent",
    },
    {
      name: `${categoryName} Item 5`,
      price: "$249",
      image: "/placeholder.svg?height=200&width=300&text=Product+5",
      condition: "Brand New",
    },
    {
      name: `${categoryName} Item 6`,
      price: "$179",
      image: "/placeholder.svg?height=200&width=300&text=Product+6",
      condition: "Good",
    },
  ];

  const productTemplates =
    baseProducts[categoryName as keyof typeof baseProducts] || defaultProducts;

  for (let i = 0; i < count; i++) {
    const template = productTemplates[i % productTemplates.length];
    products.push({
      id: i + 1,
      title: template.name,
      price: template.price,
      location: "Downtown, Central City",
      image: template.image,
      condition: template.condition,
      featured: i < 3,
      rating: 4.5 + Math.random() * 0.5,
      seller: "John Doe",
      timeAgo: `${Math.floor(Math.random() * 24)} hours ago`,
      liked: false,
    });
  }

  return products;
};

interface Product {
  id: number;
  title: string;
  price: string;
  location: string;
  image: string;
  condition: string;
  featured: boolean;
  rating: number;
  seller: string;
  timeAgo: string;
  liked: boolean;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  // Find current category
  useEffect(() => {
    if (categories.length > 0) {
      const category = categories.find((cat) => cat.slug === slug);
      setCurrentCategory(category);

      if (category) {
        // Generate mock products for this category
        const mockProducts = generateMockProducts(category.name, 20);
        setProducts(mockProducts);
      }
      setLoading(false);
    }
  }, [categories, slug]);

  const handleLike = (productId: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, liked: !product.liked }
          : product
      )
    );
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (
          parseFloat(a.price.replace(/[$,]/g, "")) -
          parseFloat(b.price.replace(/[$,]/g, ""))
        );
      case "price-high":
        return (
          parseFloat(b.price.replace(/[$,]/g, "")) -
          parseFloat(a.price.replace(/[$,]/g, ""))
        );
      case "rating":
        return b.rating - a.rating;
      case "newest":
      default:
        return new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime();
    }
  });

  if (categoriesLoading || loading) {
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
            {currentCategory.name}
          </span>
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
                  categoryColors[currentCategory.slug] ||
                  "from-gray-500 to-gray-600"
                } flex items-center justify-center text-4xl shadow-lg`}
              >
                {currentCategory.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {currentCategory.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {sortedProducts.length} products available
                </p>
                {currentCategory.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentCategory.subcategories
                      .slice(0, 4)
                      .map((sub: any) => (
                        <Badge
                          key={sub._id}
                          variant="secondary"
                          className="card-shadow"
                        >
                          {sub.name}
                        </Badge>
                      ))}
                    {currentCategory.subcategories.length > 4 && (
                      <Badge variant="outline">
                        +{currentCategory.subcategories.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Link href="/categories">
              <Button variant="outline" className="btn-shadow">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background/50 rounded-xl p-6 border border-border/50 card-shadow mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search in ${currentCategory.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-shadow"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 input-shadow">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

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
                          variant="outline"
                          size="sm"
                          className="btn-shadow"
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
                    <Input placeholder="$0" className="input-shadow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Max Price
                    </label>
                    <Input placeholder="$10,000" className="input-shadow" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <Input
                    placeholder="Enter city or area"
                    className="input-shadow"
                  />
                </div>

                {/* Apply Filters Button */}
                <div className="flex justify-end">
                  <Button className="btn-shadow">Apply Filters</Button>
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
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">{currentCategory.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Be the first to list a product in this category."}
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
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  {viewMode === "grid" ? (
                    <Card className="overflow-hidden border-0 card-shadow hover:shadow-lg transition-all duration-300 group cursor-pointer">
                      <div className="relative">
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.featured && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`absolute top-3 right-3 glass border-0 ${
                            product.liked
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "hover:bg-red-500 hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(product.id);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              product.liked ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.condition}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {product.rating.toFixed(1)}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {product.location}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xl font-bold text-primary">
                            {product.price}
                          </span>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {product.timeAgo}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            by {product.seller}
                          </span>
                          <Button size="sm" className="btn-shadow">
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="overflow-hidden border-0 card-shadow hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.title}
                              width={150}
                              height={100}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                            {product.featured && (
                              <Badge className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {product.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {product.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {product.timeAgo}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                    {product.rating.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`${
                                  product.liked
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "hover:bg-red-500 hover:text-white"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(product.id);
                                }}
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    product.liked ? "fill-current" : ""
                                  }`}
                                />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-primary">
                                  {product.price}
                                </span>
                                <Badge variant="secondary">
                                  {product.condition}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  by {product.seller}
                                </span>
                              </div>
                              <Button className="btn-shadow">
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
          )}
        </motion.div>

        {/* Load More */}
        {sortedProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="btn-shadow">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
