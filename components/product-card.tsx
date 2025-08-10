import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Clock, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Price } from "@/app/api/modules/products/services/product.service";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: Price;
  category: string;
  subCategory: string;
  condition: string;
  images: { url: string; alt?: string }[];
  titleImageIndex: number;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  contactInfo: object;
  seller: string;
  status: string;
  tags: string[];
  negotiable: boolean;
  showPhoneNumber: boolean;
  views: number;
  featured: boolean;
  // expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
  variant?: "compact" | "list";
  onLike?: (productId: string) => void;
}

export function ProductCard({
  product,
  variant = "compact",
  onLike,
}: ProductCardProps) {

  //FOR TESTING FEATURED BADGE
  product.featured = true;

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getLocationString = () => {
    const { city, state, country } = product.location;
    return (
      [city, state, country].filter(Boolean).join(", ") || "Unknown location"
    );
  };

  // Show how many days ago the product was listed, or 'Today' if listed today
  const formatDaysAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      const now = new Date();
      // Zero out time for both dates
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const nowOnly = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const diffTime = nowOnly.getTime() - dateOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays > 1) return `${diffDays} days ago`;
      return "In the future";
    } catch {
      return "Unknown date";
    }
  };

  return (
    <Card
      className={`overflow-hidden border-0 transition-all duration-300 ${
        isDark
          ? "bg-zinc-800 hover:bg-zinc-700/80"
          : "bg-white hover:bg-gray-50"
      } ${variant === "list" ? "w-full" : ""}`}
    >
      <CardContent className={variant === "list" ? "p-4 flex gap-4" : "p-4"}>
      
          <div className="relative">
            {/* Featured badge */}
      {product.featured && (
        <Badge
          className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-default select-none"
          title="Featured Product"
        >
          <Star className="h-4 w-4 mr-1" />
          Featured
        </Badge>
      )}
            <div className="relative w-full h-48 mb-4">
              <Image
                src={
                  product.images?.length > 0 &&
                  product.images[product.titleImageIndex]?.url
                    ? product.images[product.titleImageIndex].url
                    : "/placeholder.jpg"
                }
                alt={product.title || "Product image"}
                fill
                className="object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`font-semibold text-lg line-clamp-1 ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {product.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLike?.(product._id)}
                className={`${
                  isDark
                    ? "text-gray-400 hover:text-red-400"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            {/* Category and Subcategory */}
            <div className="flex flex-wrap gap-2 mb-2">
              {product.category && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isDark
                      ? "bg-zinc-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {product.category}
                </span>
              )}
              {product.subCategory && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isDark
                      ? "bg-zinc-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {product.subCategory}
                </span>
              )}
            </div>
            <div
              className={`text-sm mb-2 line-clamp-1 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {product.description || (
                <span className="italic text-gray-400">
                  No description available
                </span>
              )}
            </div>
            {/* Days ago and views for compact view */}
            <div
              className={`flex items-center gap-3 text-xs mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              {formatDaysAgo(product.createdAt)}
              <span className="flex items-center ml-2">
                <Eye className="h-4 w-4 mr-1" />
                {product.views} views
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {product.price ? `$${product.price.amount}` : "-"}
              </span>
              {product.price.negotiable && (
                <span
                  className={`text-xs font-semibold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Negotiable
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-2 text-sm mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{getLocationString()}</span>
            </div>
            
          </div>
      </CardContent>
    </Card>
  );
}
