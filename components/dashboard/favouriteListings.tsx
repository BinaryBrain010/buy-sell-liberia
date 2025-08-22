"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Loader2 } from "lucide-react";
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
  const [categories, setCategories] = useState<Map<string, { name: string; subcategories: Map<string, string> }>>(new Map());

  // Listen for logout events and clear state
  useAuthLogout(() => {
    setFavourites([]);
    setLoading(false);
    setSearchTerm("");
    setError(null);
    setRemovingItems(new Set());
    setCategories(new Map());
    console.log("[FAVOURITE_LISTINGS] State cleared due to logout");
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
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
          categoriesResponse.categories.forEach(category => {
            const subcategoryMap = new Map();
            category.subcategories?.forEach(subcategory => {
              subcategoryMap.set(subcategory._id, subcategory.name);
            });
            categoryMap.set(category._id, {
              name: category.name,
              subcategories: subcategoryMap
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
      setRemovingItems(prev => new Set(prev).add(listingId));
      await ProductService.toggleFavourite(listingId, false);
      setFavourites((prev) => prev.filter((item) => item._id !== listingId));
    } catch (error: any) {
      console.error("Failed to remove favourite:", error);
      // You might want to show a toast notification here
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  // Convert Product from service to ProductCard format
  const convertToProductCardFormat = (product: Product) => {
    const categoryInfo = categories.get(product.category_id);
    const subcategoryInfo = categoryInfo?.subcategories.get(product.subcategory_id || "");
    
    return {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: categoryInfo?.name || "", // Use actual category name
      subCategory: subcategoryInfo || "", // Use actual subcategory name
      condition: product.condition,
      images: product.images.map(img => ({ url: img })), // Convert string array to object array
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
      createdAt: typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toISOString(),
      updatedAt: typeof product.createdAt === 'string' ? product.createdAt : product.createdAt.toISOString(), // Use createdAt as updatedAt
    };
  };

  const filteredFavourites = favourites.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.location?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.location?.country?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 bg-muted animate-pulse rounded" />
          <div className="h-9 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-red-500 mb-4">
            <Heart className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Favourites</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Your Favourites</h2>
          <p className="text-sm text-muted-foreground">
            {favourites.length} saved listing
            {favourites.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favourites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {filteredFavourites.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No matching favourites" : "No favourites yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start browsing listings and save your favourites here"}
            </p>
            {!searchTerm && <Button>Browse Listings</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFavourites.map((listing) => (
            <div key={listing._id} className="relative group">
              <ProductCard 
                product={convertToProductCardFormat(listing)}
                variant="compact"
              />
              
              {/* Custom remove from favourites button */}
              <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-colors group-hover:scale-110"
                  onClick={() => removeFavourite(listing._id)}
                  aria-label="Remove from favourites"
                  title="Remove from favourites"
                  disabled={removingItems.has(listing._id)}
                >
                  {removingItems.has(listing._id) ? (
                    <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  )}
                </Button>
                <span className="text-xs text-white bg-black/70 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Remove
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
