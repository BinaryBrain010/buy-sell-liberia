"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Loader2, Grid3X3, List, Eye, Calendar, MapPin, Star } from "lucide-react";
import { ProductService } from "@/app/services/Product.Service";
import type { Product } from "@/app/services/Product.Service";
import { ProductCard } from "@/components/product-card";
import { CategoryService } from "@/app/services/Category.Service";
import { useAuthLogout } from "@/hooks/use-auth-logout";

interface FavouriteListingsProps {
  userId: string;
}

export default function FavouriteListings({ userId }: FavouriteListingsProps) {
  const [favourites, setFavourites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<
    Map<string, { name: string; subcategories: Map<string, string> }>
  >(new Map());

  // Listen for logout events and clear state
  useAuthLogout(() => {
    setFavourites([]);
    setLoading(false);
    setSearchTerm("");
    setError(null);
    setRemovingItems(new Set());
    setViewMode("grid");
    setCategories(new Map());
    console.log("[FAVOURITE_LISTINGS] State cleared due to logout");
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Please log in to view your favourites");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        // Load categories first
        const categoryService = new CategoryService();
        const categoriesResponse = await categoryService.getCategories();

        // Build a map of category IDs to names and subcategory IDs to names
        const categoryMap = new Map();
        if (categoriesResponse.categories) {
          categoriesResponse.categories.forEach((category) => {
            const subcategoryMap = new Map();
            category.subcategories?.forEach((subcategory) => {
              subcategoryMap.set(subcategory._id, subcategory.name);
            });
            categoryMap.set(category._id, {
              name: category.name,
              subcategories: subcategoryMap,
            });
          });
        }
        setCategories(categoryMap);

        // Load favourites
        const favorites = await ProductService.getUserFavorites();
        setFavourites(favorites);
      } catch (error: any) {
        console.error("Failed to load data:", error);
        setError(error.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    // Load data when component mounts
    loadData();
  }, []); // Remove userId dependency to run on mount

  const removeFavourite = async (listingId: string) => {
    try {
      setRemovingItems((prev) => new Set(prev).add(listingId));
      await ProductService.toggleFavourite(listingId, false);
      setFavourites((prev) => prev.filter((item) => item._id !== listingId));
    } catch (error: any) {
      console.error("Failed to remove favourite:", error);
      // You might want to show a toast notification here
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  // Convert Product from service to ProductCard format
  const convertToProductCardFormat = (product: Product) => {
    const categoryInfo = categories.get(product.category_id);
    const subcategoryInfo = categoryInfo?.subcategories.get(
      product.subcategory_id || ""
    );

    return {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: categoryInfo?.name || "", // Use actual category name
      subCategory: subcategoryInfo || "", // Use actual subcategory name
      condition: product.condition,
      images: product.images.map((img) => ({ url: img })), // Convert string array to object array
      titleImageIndex: 0, // Default to first image
      location: {
        city: product.location?.city || "",
        state: product.location?.state || "",
        country: product.location?.country || "",
      },
      contactInfo: {}, // Empty object as placeholder
      seller: product.seller?._id || "", // Use seller ID
      status: product.status,
      tags: [], // Empty array as placeholder
      negotiable: product.price?.negotiable || false,
      showPhoneNumber: true, // Default value
      views: product.views || 0,
      featured: product.featured,
      createdAt:
        typeof product.createdAt === "string"
          ? product.createdAt
          : product.createdAt.toISOString(),
      updatedAt:
        typeof product.createdAt === "string"
          ? product.createdAt
          : product.createdAt.toISOString(), // Use createdAt as updatedAt
    };
  };

  const filteredFavourites = favourites.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-v0-green animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Error Loading Favorites</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative">
        {/* Background accent */}
        <div className="absolute -inset-2 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-red-500/5 rounded-2xl opacity-50" />
        
        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Your Favorites</h2>
                  <p className="text-muted-foreground">
                    {favourites.length} saved listing{favourites.length !== 1 ? "s" : ""} you love
                  </p>
                </div>
              </div>
            </div>
            
            {/* Statistics */}
            {favourites.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-600">{favourites.length}</div>
                  <div className="text-sm text-muted-foreground">Total Saved</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">
                    {favourites.filter(f => f.status === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {favourites.filter(f => f.featured).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Featured</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-600">
                    {favourites.reduce((sum, f) => sum + (f.views || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-50" />
        
        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search your favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-base"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">View:</span>
              <div className="flex border-2 border-border/30 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-10 px-4 ${
                    viewMode === "grid" 
                      ? "bg-gradient-to-r from-primary to-v0-dark-blue text-white shadow-lg" 
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-10 px-4 ${
                    viewMode === "list" 
                      ? "bg-gradient-to-r from-primary to-v0-dark-blue text-white shadow-lg" 
                      : "hover:bg-muted/50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Favorites Display */}
      {filteredFavourites.length > 0 ? (
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl opacity-50" />
          
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Your Favorites ({filteredFavourites.length})
              </h3>
              <div className="text-sm text-muted-foreground">
                Showing {filteredFavourites.length} of {favourites.length} favorites
              </div>
            </div>
            
            {/* Conditional Rendering based on View Mode */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFavourites.map((listing) => (
                  <div key={listing._id} className="relative group">
                    <ProductCard
                      product={convertToProductCardFormat(listing)}
                      variant="compact"
                      hideFavouriteButton
                    />

                    {/* Enhanced remove from favourites button */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-10 w-10 p-0 bg-white/95 hover:bg-red-50 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110 border-2 border-white/50"
                        onClick={() => removeFavourite(listing._id)}
                        aria-label="Remove from favourites"
                        title="Remove from favourites"
                        disabled={removingItems.has(listing._id)}
                      >
                        {removingItems.has(listing._id) ? (
                          <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                        ) : (
                          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        )}
                      </Button>
                      <span className="text-xs text-white bg-black/80 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Remove
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavourites.map((listing) => (
                  <FavoriteListItem
                    key={listing._id}
                    listing={listing}
                    onRemove={() => removeFavourite(listing._id)}
                    isRemoving={removingItems.has(listing._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enhanced Empty States */
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-2xl opacity-50" />
          
          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-12 border border-border/30">
            {searchTerm ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">No matching favorites</h3>
                  <p className="text-muted-foreground mb-6">
                    No favorites match your search criteria. Try adjusting your search terms.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start browsing listings and save your favorites here. They'll appear in this section!
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/products'}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Browse Listings
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced List View Item Component for Favorites
function FavoriteListItem({ 
  listing, 
  onRemove, 
  isRemoving 
}: { 
  listing: Product; 
  onRemove: () => void; 
  isRemoving: boolean;
}) {
  // Image URL resolution function
  const resolveImageUrl = (raw?: string) => {
    if (!raw) return "/placeholder.jpg";
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    const cleaned = raw.replace(/^\/+/, "");
    if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
    if (cleaned.startsWith("uploads/")) return `/api/${cleaned}`;
    if (/\.[a-zA-Z0-9]{2,5}$/.test(cleaned)) return `/api/uploads/${cleaned}`;
    return "/placeholder.jpg";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "sold": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "expired": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const currencySymbol = listing.price?.currency === "LRD" ? "L$" : "$";

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Section */}
          <div className="flex-shrink-0">
            <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden bg-muted/50">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={resolveImageUrl(listing.images[0])}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 break-words overflow-hidden">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {currencySymbol}{listing.price?.amount || 0}
                    </span>
                    {listing.price?.negotiable && (
                      <span className="text-sm text-muted-foreground">(Negotiable)</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status || "active")}`}>
                      {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1) || "Active"}
                    </span>
                    {listing.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 dark:from-orange-900/20 dark:to-yellow-900/20 dark:text-orange-400">
                        <Star className="h-3 w-3 inline mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-muted-foreground leading-relaxed line-clamp-3 break-words overflow-hidden">
                  {listing.description}
                </p>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {formatDate(typeof listing.createdAt === "string" ? listing.createdAt : listing.createdAt.toISOString())}</span>
                </div>
                {listing.location?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location.city}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-auto">
                <Button
                  onClick={() => window.location.href = `/products/${listing._id}`}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                >
                  View Details
                </Button>
                <Button
                  onClick={onRemove}
                  variant="outline"
                  size="sm"
                  disabled={isRemoving}
                  className="px-4 py-2 border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-colors"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2 fill-red-500" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
