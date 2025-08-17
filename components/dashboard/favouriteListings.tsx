"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Search, Eye, Calendar, MapPin, Star } from "lucide-react";

interface FavouriteListing {
  _id: string;
  title: string;
  price: number;
  location: string;
  createdAt: string;
  views: number;
  featured: boolean;
  status: string;
  seller: {
    name: string;
    rating: number;
  };
  image: string;
}

interface FavouriteListingsProps {
  userId: string;
}

export default function FavouriteListings({ userId }: FavouriteListingsProps) {
  const [favourites, setFavourites] = useState<FavouriteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadFavourites = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock favourite listings data
        setFavourites([
          {
            _id: "fav1",
            title: "iPhone 14 Pro Max - Excellent Condition",
            price: 899,
            location: "New York, NY",
            createdAt: "2024-01-10",
            views: 156,
            featured: true,
            status: "active",
            seller: { name: "John Doe", rating: 4.8 },
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            _id: "fav2",
            title: "Gaming Laptop - RTX 4070",
            price: 1299,
            location: "Los Angeles, CA",
            createdAt: "2024-01-08",
            views: 89,
            featured: false,
            status: "active",
            seller: { name: "Sarah Smith", rating: 4.9 },
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            _id: "fav3",
            title: "Vintage Leather Jacket",
            price: 150,
            location: "Chicago, IL",
            createdAt: "2024-01-05",
            views: 67,
            featured: false,
            status: "sold",
            seller: { name: "Mike Johnson", rating: 4.6 },
            image: "/placeholder.svg?height=200&width=300",
          },
          {
            _id: "fav4",
            title: "Mountain Bike - Trek X-Caliber",
            price: 650,
            location: "Denver, CO",
            createdAt: "2024-01-03",
            views: 134,
            featured: true,
            status: "active",
            seller: { name: "Alex Wilson", rating: 4.7 },
            image: "/placeholder.svg?height=200&width=300",
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load favourites:", error);
        setLoading(false);
      }
    };

    loadFavourites();
  }, [userId]);

  const removeFavourite = (listingId: string) => {
    setFavourites((prev) => prev.filter((item) => item._id !== listingId));
  };

  const filteredFavourites = favourites.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Card
              key={listing._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-36 sm:h-40 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder.jpg";
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {listing.featured && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 px-2 py-0.5 text-[11px]"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full"
                    onClick={() => removeFavourite(listing._id)}
                    aria-label="Remove from favourites"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </Button>
                </div>
                {listing.status === "sold" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      SOLD
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">
                    {listing.title}
                  </CardTitle>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-green-600">
                    ${listing.price}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.views}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div className="text-xs sm:text-sm">
                      <span className="text-muted-foreground">Seller: </span>
                      <span className="font-medium">{listing.seller.name}</span>
                      <span className="text-yellow-500 ml-1">
                        ★ {listing.seller.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={listing.status === "sold"}
                  >
                    {listing.status === "sold" ? "Sold" : "Contact Seller"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
