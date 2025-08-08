import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Clock, Eye } from "lucide-react";
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
  favorites: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
        {variant === "list" ? (
          // List View
          <div className="flex gap-4 w-full">
            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <Image
                src={
                  product.images?.length > 0 &&
                  product.images[product.titleImageIndex]?.url
                    ? product.images[product.titleImageIndex].url
                    : "/placeholder.jpg"
                }
                alt={product.title || "Product image"}
                width={150}
                height={100}
                className="w-32 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />
            </div>
            {/* Product Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-semibold text-lg flex-1 line-clamp-1 ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {product.title}
                  </h3>
                  <span
                    className={`text-2xl font-bold ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {product.price ? `$${product.price}` : "-"}
                  </span>
                  {product.negotiable && (
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
                  className={`flex items-center gap-3 text-sm mb-2 flex-wrap ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {getLocationString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDaysAgo(product.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {product.views} views
                  </span>
                </div>
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
                  {product.condition && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isDark
                          ? "bg-zinc-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {product.condition}
                    </span>
                  )}
                  {product.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded border ${
                        isDark
                          ? "bg-zinc-700 text-gray-300 border-zinc-600"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
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
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                  >
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
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Seller
                  </span>
                </div>
        
              </div>
            </div>
          </div>
        ) : (
          // Grid View (Compact)
          <div className="relative">
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
        )}
      </CardContent>
    </Card>
  );
}
