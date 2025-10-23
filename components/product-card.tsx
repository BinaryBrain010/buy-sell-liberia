"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Clock, Eye, Star, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTheme } from "next-themes";
import type { Price } from "@/types/products";
import Link from "next/link";
import { FavouriteButton } from "@/components/FavouriteButton";
import { convertAmount, formatMoney } from "@/lib/currency";

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
  createdAt?: string;
  updatedAt?: string;
  // Some APIs return snake_case timestamps and/or a computed "timeAgo" virtual
  created_at?: string;
  updated_at?: string;
  added_at?: string;
  timeAgo?: string;
}

interface ProductCardProps {
  product?: Product;
  variant?: "compact" | "list";
  onLike?: (productId: string) => void;
  platformCurrency?: "USD" | "LRD";
  /** When true, the built-in Favourite (like) button is hidden */
  hideFavouriteButton?: boolean;
}

export function ProductCard({
  // Helper to get absolute image URL
  // (function version is declared below, remove this invalid const)
  product,
  variant = "compact",
  onLike,
  platformCurrency,
  hideFavouriteButton = false,
}: ProductCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Currency state: defaults to USD; can be overridden by parent via platformCurrency
  const [currency, setCurrency] = useState<"USD" | "LRD">("USD");
  const effectiveCurrency = (platformCurrency ?? currency) as "USD" | "LRD";
  const currencySymbol = effectiveCurrency === "LRD" ? "L$" : "$";
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const getCurrency = async () => {
      try {
        const res = await fetch("/api/settings/public", {
          cache: "no-store",
        });
        if (!res.ok) return; // fall back to default USD
        const data = await res.json();
        if (!cancelled) {
          // Only set local currency state if parent didn't supply one
          if (
            !platformCurrency &&
            (data?.currency === "USD" || data?.currency === "LRD")
          ) {
            setCurrency(data.currency);
          }
          if (data?.rates) {
            const r = {
              usdToLrdRate: Number(data.rates.usdToLrdRate ?? 200),
              lrdToUsdRate: Number(data.rates.lrdToUsdRate ?? 0.005),
            };
            setRates(r);
          }
        }
      } catch {
        // ignore and use default
      }
    };
    getCurrency();
    return () => {
      cancelled = true;
    };
  }, [platformCurrency]);

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
      const cleanPath = img.replace(/^\/+/, "");
      return `/api/uploads/${cleanPath}`;
    }
    if (img.url?.startsWith("http")) return img.url;
    const cleanPath = img.url?.replace(/^\/+/, "");
    return `/api/uploads/${cleanPath}`;
  }

  // Render a user-friendly label from canonical condition value
  function formatCondition(cond: string | undefined | null) {
    if (!cond) return "";
    const map: Record<string, string> = {
      new: "New",
      "like-new": "Like New",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
    };
    return map[cond] || String(cond);
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
  const formatDaysAgo = (input?: string | number | Date) => {
    try {
      if (!input) return "Unknown date";
      const date = new Date(input);
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

  // Prefer formatted absolute date for items older than threshold; else relative
  const formatListedLabel = (
    dateInput?: string | number | Date,
    thresholdDays = 30
  ) => {
    if (!dateInput) return "Unknown date";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "Unknown date";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= thresholdDays) {
      try {
        return d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return d.toISOString().slice(0, 10);
      }
    }
    return formatDaysAgo(d);
  };

  // Choose the best available timestamp; fallback to server timeAgo if needed
  const getListedAtLabel = (p: any): string => {
    const candidates = [
      p?.createdAt,
      p?.created_at,
      p?.added_at,
      p?.updatedAt,
      p?.updated_at,
    ];
    for (const c of candidates) {
      const label = formatListedLabel(c);
      if (label !== "Unknown date") return label;
    }
    if (typeof p?.timeAgo === "string" && p.timeAgo.trim().length > 0) {
      return p.timeAgo;
    }
    return "Unknown date";
  };

  // compute display price possibly converted to platform currency
  const displayPrice = (() => {
    if (!product?.price || typeof product.price !== "object") return "-";
    const amt = Number(product.price.amount);
    if (!Number.isFinite(amt)) return "-";
    const from = String((product.price as any).currency || "USD").toUpperCase();
    const to = effectiveCurrency;
    const effectiveRates = rates ?? { usdToLrdRate: 200, lrdToUsdRate: 0.005 };
    const converted = convertAmount(amt, from, to, effectiveRates);
    return formatMoney(converted, to);
  })();

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
              {!hideFavouriteButton && (
                <FavouriteButton productId={product._id} />
              )}
            </div>
            {/* Verified pill under title if seller is verified */}
            {(product as any)?.user?.profile?.verificationStatus ===
              "fully_verified" && (
              <div
                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black border border-yellow-500/50 text-[10px] font-semibold w-max shadow-md"
                title="Verified seller"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <ShieldCheck className="h-3 w-3 drop-shadow-sm" />
                Verified Seller
              </div>
            )}

            {/* Price + Negotiable */}
            <div className="mt-1 mb-2 flex items-center gap-3">
              <span
                className={`text-lg md:text-xl font-bold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {displayPrice}
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
              {/* Condition pill - prefer top-level then nested details */}
              {((product as any).condition ||
                (product as any).details?.condition) && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isDark
                      ? "bg-zinc-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {formatCondition(
                    (product as any).condition ||
                      (product as any).details?.condition
                  )}
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
                {getListedAtLabel(product)}
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
              {!hideFavouriteButton && (
                <FavouriteButton productId={product._id} />
              )}
            </div>
            {(product as any)?.user?.profile?.verificationStatus ===
              "fully_verified" && (
              <div
                className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 text-black border border-yellow-500/50 text-[10px] font-semibold w-max shadow-md"
                title="Verified seller"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <ShieldCheck className="h-3 w-3 drop-shadow-sm" />
                Verified
              </div>
            )}
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
              {getListedAtLabel(product)}
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
                {displayPrice}
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
