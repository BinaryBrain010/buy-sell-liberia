"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Eye,
  Star,
  User,
  Heart,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { ContactSellerButton } from "@/components/ContactSellerPopup";
import { ReportProductButton } from "@/components/report-product-button";
import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { motion, AnimatePresence } from "framer-motion";

type ImageType = string | { url: string; alt?: string; isPrimary?: boolean };

interface ProductDetailProps {
  [key: string]: any;
}

export default function ProductDetail(productData: ProductDetailProps) {
  const [liked, setLiked] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "LRD">("USD");
  const currencySymbol = currency === "LRD" ? "L$" : "$";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [descExpanded, setDescExpanded] = useState(false);
  const [isDescOverflowing, setIsDescOverflowing] = useState(false);
  const descRef = useRef<HTMLDivElement | null>(null);

  const formatPrice = (price: any): string => {
    if (typeof price === "number")
      return `${currencySymbol} ${price.toLocaleString()}`;
    if (!price || typeof price.amount !== "number")
      return "Price not available";
    const formatted = `${currencySymbol} ${Number(
      price.amount
    ).toLocaleString()}`;
    return price.negotiable ? `${formatted} (Negotiable)` : formatted;
  };

  // Fetch platform currency (fallback to USD if unauthorized/unavailable)
  useEffect(() => {
    let cancelled = false;
    const getCurrency = async () => {
      try {
        const res = await fetch("/api/admin/settings/currency", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          (data?.currency === "USD" || data?.currency === "LRD")
        ) {
          setCurrency(data.currency);
        }
      } catch {
        // ignore
      }
    };
    getCurrency();
    return () => {
      cancelled = true;
    };
  }, []);

  // ESC key functionality for gallery modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showGallery) {
        setShowGallery(false);
      }
    };

    if (showGallery) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showGallery]);

  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getImageUrl = (img: ImageType | undefined): string | undefined => {
    if (!img) return undefined;
    if (typeof img === "string") {
      if (img.startsWith("http")) return img;
      // Remove leading slashes and use API route
      const cleanPath = img.replace(/^\/+/, "");
      return `/api/uploads/${cleanPath}`;
    }
    if (img.url.startsWith("http")) return img.url;
    const cleanPath = img.url.replace(/^\/+/, "");
    return `/api/uploads/${cleanPath}`;
  };

  const images = Array.isArray(productData?.images) ? productData.images : [];
  const displayName =
    productData?.seller?.fullName ||
    productData?.seller?.username ||
    productData?.user_id?.fullName ||
    productData?.user_id?.username ||
    "Unknown Seller";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!showGallery) return;

      switch (e.key) {
        case "Escape":
          setShowGallery(false);
          break;
        case "ArrowLeft":
          setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );
          break;
        case "ArrowRight":
          setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          );
          break;
      }
    },
    [showGallery, images.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Measure description overflow only when collapsed
  useEffect(() => {
    if (descExpanded) return; // only check when collapsed
    const el = descRef.current;
    if (!el) return;

    const checkOverflow = () => {
      // small tolerance for sub-pixel rounding
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      setIsDescOverflowing(overflowing);
    };

    // run after paint
    const raf = requestAnimationFrame(checkOverflow);
    window.addEventListener("resize", checkOverflow);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [descExpanded, productData?.description]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!productData || Object.keys(productData).length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product details not found</h2>
        <p className="text-muted-foreground mb-6">
          Unable to load product details. Please try again.
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        <FadeIn>
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:gap-12 xl:gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
            {/* Enhanced Image Gallery */}
            <div className="space-y-5 md:space-y-6">
              {/* Main Image - Enhanced design */}
              <motion.div
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 group shadow-xl border-2 border-border/20"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {images.length > 0 && getImageUrl(images[currentImageIndex]) ? (
                  <div
                    className="relative w-full h-full cursor-zoom-in"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onClick={() => setShowGallery(true)}
                  >
                    <Image
                      src={
                        getImageUrl(images[currentImageIndex])! ||
                        "/placeholder.svg"
                      }
                      alt={
                        typeof images[currentImageIndex] === "object"
                          ? images[currentImageIndex].alt ||
                            productData.title ||
                            "Product image"
                          : productData.title || "Product image"
                      }
                      fill
                      className={cn(
                        "object-cover transition-transform duration-300",
                        isZoomed ? "scale-150" : "scale-100"
                      )}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }
                          : {}
                      }
                      priority
                    />

                    {/* Enhanced Zoom indicator */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-primary/90 to-v0-dark-blue/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <ZoomIn className="h-4 w-4" />
                    </div>

                    {/* Enhanced Image counter */}
                    {images.length > 1 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-black/70 to-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <Eye className="h-6 w-6" />
                      </div>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Navigation arrows for main image */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary/90 to-v0-dark-blue/90 hover:from-primary hover:to-v0-dark-blue text-white rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary/90 to-v0-dark-blue/90 hover:from-primary hover:to-v0-dark-blue text-white rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Enhanced Thumbnails */}
              {images.length > 1 && (
                <FadeInStagger
                  as="div"
                  className="flex gap-3 overflow-x-auto pb-2"
                >
                  {images.map((img: ImageType, idx: number) => (
                    <button
                      key={idx}
                      className={cn(
                        "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all shadow-lg hover:shadow-xl",
                        idx === currentImageIndex
                          ? "border-primary scale-110 shadow-xl ring-4 ring-primary/20"
                          : "border-border/30 hover:border-primary/60 hover:scale-105"
                      )}
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      {getImageUrl(img) ? (
                        <Image
                          src={getImageUrl(img)! || "/placeholder.svg"}
                          alt={
                            typeof img === "object"
                              ? img.alt || productData.title
                              : productData.title
                          }
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                          No Image
                        </div>
                      )}
                    </button>
                  ))}
                </FadeInStagger>
              )}
            </div>

            {/* Enhanced Product Details */}
            <FadeIn>
              <div className="space-y-6 md:space-y-8 lg:space-y-10 lg:sticky lg:top-28">
                {/* Enhanced Header */}
                <div className="relative">
                  {/* Background accent */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 via-v0-green/5 to-primary/5 rounded-2xl opacity-50" />

                  <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                          {productData.title || "Untitled Product"}
                        </h1>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
                          {formatPrice(productData.price)}
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Available
                            </span>
                          </div>
                          {productData.featured && (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Star className="h-3 w-3" />
                              <span className="text-sm font-medium">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <Button
                          variant={liked ? "default" : "outline"}
                          onClick={() => setLiked((prev) => !prev)}
                          className="w-full sm:w-auto px-5"
                          aria-pressed={liked}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 mr-2 transition-colors",
                              liked ? "fill-current" : ""
                            )}
                          />
                          {liked ? "Saved to favorites" : "Save this listing"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {productData.location?.city ||
                          productData.location?.state ||
                          productData.location?.country ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">
                        Listed
                      </p>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                        {getTimeAgo(
                          productData.created_at || productData.createdAt || ""
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        Views
                      </p>
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                        {productData.views || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tags and Categories */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Product Details
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.category && (
                      <Badge className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 text-primary hover:bg-gradient-to-r hover:from-primary/20 hover:to-v0-green/20 transition-colors">
                        {productData.category}
                      </Badge>
                    )}
                    {productData.subCategory && (
                      <Badge className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 text-blue-600 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20 transition-colors">
                        {productData.subCategory}
                      </Badge>
                    )}
                    {productData.condition && (
                      <Badge className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 text-green-600 hover:bg-gradient-to-r hover:from-green-500/20 hover:to-green-600/20 transition-colors">
                        {productData.condition}
                      </Badge>
                    )}
                    {Array.isArray(productData.tags) &&
                      productData.tags
                        .slice(0, 4)
                        .map((tag: string, idx: number) => (
                          <Badge
                            key={idx}
                            className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-purple-600/20 transition-colors"
                          >
                            #{tag}
                          </Badge>
                        ))}
                  </div>
                </div>

                {/* Enhanced Description */}
                <div className="relative">
                  {/* Background accent */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-2xl opacity-50" />

                  <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Description
                    </h3>
                    <div
                      ref={descRef}
                      className={cn(
                        "relative text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base overflow-hidden",
                        descExpanded
                          ? "max-h-none"
                          : "max-h-[11rem] sm:max-h-[15rem]"
                      )}
                    >
                      {productData.description || (
                        <span className="italic text-gray-400">
                          No description available
                        </span>
                      )}

                      {!descExpanded && isDescOverflowing && (
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
                      )}
                    </div>
                    {isDescOverflowing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 px-4 py-2 text-primary hover:bg-primary/10 border-primary/20"
                        aria-expanded={descExpanded}
                        onClick={() => setDescExpanded((v) => !v)}
                      >
                        {descExpanded ? "Show less" : "Read more"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Custom Fields - More compact grid */}
                {productData.customFields &&
                  productData.customFields.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold mb-2">Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {productData.customFields
                          .slice(0, 3)
                          .map((field: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                            >
                              <span className="font-medium">
                                {field.fieldName}
                              </span>
                              <span className="text-muted-foreground">
                                {typeof field.value === "boolean"
                                  ? field.value
                                    ? "Yes"
                                    : "No"
                                  : field.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Enhanced Seller Information */}
                <FadeIn>
                  <div className="relative">
                    {/* Background accent */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl opacity-50" />

                    <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
                      <h3 className="text-lg font-semibold mb-4 text-foreground">
                        Seller Information
                      </h3>

                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-foreground">
                              {displayName}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <ContactSellerButton
                            sellerId={
                              productData.seller?._id ||
                              productData.user_id?._id ||
                              ""
                            }
                            productId={productData._id || productData.id}
                            productTitle={
                              productData.title || "Untitled Product"
                            }
                            showPhoneNumber={
                              productData.showPhoneNumber ?? true
                            }
                            sellerName={displayName}
                            contactInfo={productData.contactInfo}
                            variant="both"
                            size="lg"
                            className="w-full sm:w-auto justify-center"
                          />
                          <ReportProductButton
                            productId={productData._id || productData.id}
                            currentUserId={productData.currentUserId}
                            triggerLabel="Report Listing"
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
          </div>
        </FadeIn>
      </div>

      {/* Enhanced Full-Screen Gallery Modal */}
      <AnimatePresence>
        {showGallery && images.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              className="relative w-full h-full flex items-center justify-center p-4"
              initial={{ y: 10, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 130, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Close button */}
              <button
                onClick={() => setShowGallery(false)}
                className="absolute top-6 right-6 z-20 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 text-white rounded-full p-3 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Additional close hint */}
              <div className="absolute top-6 right-20 z-20 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Press ESC to close
              </div>

              {/* Image counter */}
              <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full">
                {currentImageIndex + 1} of {images.length}
              </div>

              {/* Main image */}
              <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
                <Image
                  src={
                    getImageUrl(images[currentImageIndex])! ||
                    "/placeholder.svg"
                  }
                  alt={productData.title || "Product image"}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  priority
                />
              </div>

              {/* Enhanced Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary/90 to-v0-dark-blue/90 hover:from-primary hover:to-v0-dark-blue text-white rounded-full p-4 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary/90 to-v0-dark-blue/90 hover:from-primary hover:to-v0-dark-blue text-white rounded-full p-4 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                  {images.map((img: ImageType, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                        idx === currentImageIndex
                          ? "border-white"
                          : "border-white/30 hover:border-white/60"
                      )}
                    >
                      <Image
                        src={getImageUrl(img)! || "/placeholder.svg"}
                        alt={`Thumbnail ${idx + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
