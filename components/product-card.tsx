"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Clock, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Price } from "@/app/api/modules/products/services/product.service";
import Link from "next/link";
import { FavouriteButton } from "@/components/FavouriteButton";

export interface Product {
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
  product?: Product;
  variant?: "compact" | "list";
  onLike?: (productId: string) => void;
}

export function ProductCard({
  // Helper to get absolute image URL
  // (function version is declared below, remove this invalid const)
  product,
  variant = "compact",
  onLike,
}: ProductCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Guard against undefined product during loading states
  if (!product) return null;

  // Normalize images to array of objects with url property
  const images = Array.isArray(product.images)
    ? product.images.map((img) =>
        typeof img === "string" ? { url: img } : img
      )
    : [];

  // Helper to get absolute image URL
  function getImageUrl(img: any) {
    if (!img) return undefined;
    if (typeof img === "string") {
      if (img.startsWith("http")) return img;
      return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img}`;
    }
    if (img.url?.startsWith("http")) return img.url;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img.url}`;
  }

  const getLocationString = () => {
    if (!product.location || typeof product.location !== "object") {
      return "Unknown location";
    }

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
      {variant === "list" ? (
        <CardContent className="p-4 md:p-5 flex gap-4 md:gap-6 items-start">
          {/* Thumbnail */}
          <Link
            href={product._id ? `/products/${product._id}` : "#"}
            className="relative block shrink-0 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={product.title || "View product"}
          >
            {/* Featured badge */}
            {product.featured === true && (
              <Badge
                className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-default select-none"
                title="Featured Product"
              >
                <Star className="h-4 w-4 mr-1" />
                Featured
              </Badge>
            )}
            <div className="relative w-28 h-28 md:w-40 md:h-40">
              <Image
                src={
                  images.length > 0 &&
                  getImageUrl(images[product.titleImageIndex ?? 0])
                    ? getImageUrl(images[product.titleImageIndex ?? 0])
                    : "/placeholder.jpg"
                }
                alt={product.title || "Product image"}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
                sizes="(max-width: 768px) 7rem, 10rem"
                priority={false}
              />
            </div>
          </Link>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={product._id ? `/products/${product._id}` : "#"}
                className={`font-semibold text-base md:text-lg line-clamp-1 hover:underline ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {product.title || "Untitled Product"}
              </Link>
              <FavouriteButton productId={product._id} />
            </div>

            {/* Price + Negotiable */}
            <div className="mt-1 mb-2 flex items-center gap-3">
              <span
                className={`text-lg md:text-xl font-bold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {product.price &&
                typeof product.price === "object" &&
                product.price.amount
                  ? `$${product.price.amount}`
                  : "-"}
              </span>
              {product.price &&
                typeof product.price === "object" &&
                product.price.negotiable === true && (
                  <Badge
                    className={`${
                      isDark
                        ? "bg-green-500/15 text-green-300"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Negotiable
                  </Badge>
                )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-2">
              {product.category && typeof product.category === "string" && (
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
              {product.subCategory &&
                typeof product.subCategory === "string" && (
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

            {/* Description */}
            <div
              className={`text-sm mb-2 line-clamp-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {product.description || (
                <span className="italic text-gray-400">
                  No description available
                </span>
              )}
            </div>

            {/* Meta */}
            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="inline-flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {product.createdAt
                  ? formatDaysAgo(product.createdAt)
                  : "Unknown date"}
              </span>
              <span className="inline-flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {typeof product.views === "number" ? product.views : 0} views
              </span>
              <span className="inline-flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1 max-w-[22rem]">
                  {getLocationString()}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-4">
          <div className="relative">
            {/* Featured badge */}
            {product.featured === true && (
              <Badge
                className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 cursor-default select-none"
                title="Featured Product"
              >
                <Star className="h-4 w-4 mr-1" />
                Featured
              </Badge>
            )}
            <Link
              href={product._id ? `/products/${product._id}` : "#"}
              className="relative block w-full h-48 mb-4 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={product.title || "View product"}
            >
              <Image
                src={
                  images.length > 0 &&
                  getImageUrl(images[product.titleImageIndex ?? 0])
                    ? getImageUrl(images[product.titleImageIndex ?? 0])
                    : "/placeholder.jpg"
                }
                alt={product.title || "Product image"}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
                sizes="100vw"
                priority={false}
              />
            </Link>
            <div className="flex items-center justify-between mb-2">
              <Link
                href={product._id ? `/products/${product._id}` : "#"}
                className={`font-semibold text-lg line-clamp-1 hover:underline ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {product.title || "Untitled Product"}
              </Link>
              <FavouriteButton productId={product._id} />
            </div>
            {/* Category and Subcategory */}
            <div className="flex flex-wrap gap-2 mb-2">
              {product.category && typeof product.category === "string" && (
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
              {product.subCategory &&
                typeof product.subCategory === "string" && (
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
            {/* Days ago and views */}
            <div
              className={`flex items-center gap-3 text-xs mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              {product.createdAt
                ? formatDaysAgo(product.createdAt)
                : "Unknown date"}
              <span className="flex items-center ml-2">
                <Eye className="h-4 w-4 mr-1" />
                {typeof product.views === "number" ? product.views : 0} views
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {product.price &&
                typeof product.price === "object" &&
                product.price.amount
                  ? `$${product.price.amount}`
                  : "-"}
              </span>
              {product.price &&
                typeof product.price === "object" &&
                product.price.negotiable === true && (
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
      )}
    </Card>
  );
}
