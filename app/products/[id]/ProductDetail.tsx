"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Eye, Star, User, Heart, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ContactSellerButton } from "@/components/ContactSellerPopup"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

type ImageType = string | { url: string; alt?: string; isPrimary?: boolean }

interface ProductDetailProps {
  [key: string]: any
}

export default function ProductDetail(productData: ProductDetailProps) {
  const [liked, setLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const formatPrice = (price: any): string => {
    if (typeof price === "number") return `USD ${price.toLocaleString()}`
    if (!price || typeof price.amount !== "number") return "Price not available"
    const currency = price.currency || "USD"
    const formatted = `${currency} ${price.amount.toLocaleString()}`
    return price.negotiable ? `${formatted} (Negotiable)` : formatted
  }

  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getImageUrl = (img: ImageType | undefined): string | undefined => {
    if (!img) return undefined
    if (typeof img === "string") {
      if (img.startsWith("http")) return img
      return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img}`
    }
    if (img.url.startsWith("http")) return img.url
    return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img.url}`
  }

  const images = Array.isArray(productData?.images) ? productData.images : []
  const displayName =
    productData?.seller?.fullName ||
    productData?.user_id?.profile?.displayName ||
    (productData?.user_id?.firstName && productData?.user_id?.lastName
      ? `${productData.user_id.firstName} ${productData.user_id.lastName}`
      : "Unknown Seller")

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!showGallery) return

      switch (e.key) {
        case "Escape":
          setShowGallery(false)
          break
        case "ArrowLeft":
          setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
          break
        case "ArrowRight":
          setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
          break
      }
    },
    [showGallery, images.length],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  if (!productData || Object.keys(productData).length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product details not found</h2>
        <p className="text-muted-foreground mb-6">Unable to load product details. Please try again.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Image Gallery - Made more compact */}
          <div className="space-y-3">
            {/* Main Image - Reduced height */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-100 group">
              {images.length > 0 && getImageUrl(images[currentImageIndex]) ? (
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onClick={() => setShowGallery(true)}
                >
                  <Image
                    src={getImageUrl(images[currentImageIndex])! || "/placeholder.svg"}
                    alt={
                      typeof images[currentImageIndex] === "object"
                        ? images[currentImageIndex].alt || productData.title || "Product image"
                        : productData.title || "Product image"
                    }
                    fill
                    className={cn(
                      "object-cover transition-transform duration-300",
                      isZoomed ? "scale-150" : "scale-100",
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

                  {/* Zoom indicator */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 w-3" />
                  </div>

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
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

              {/* Navigation arrows for main image */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Enhanced Thumbnails - Made smaller */}
            {images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {images.map((img: ImageType, idx: number) => (
                  <button
                    key={idx}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentImageIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    {getImageUrl(img) ? (
                      <Image
                        src={getImageUrl(img)! || "/placeholder.svg"}
                        alt={typeof img === "object" ? img.alt || productData.title : productData.title}
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
              </div>
            )}
          </div>

          {/* Product Details - Made more compact */}
          <div className="space-y-4">
            {/* Header - Reduced spacing */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight mb-1">{productData.title || "Untitled Product"}</h1>
                <div className="text-3xl font-bold text-primary mb-3">{formatPrice(productData.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                {productData.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                    <Star className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setLiked(!liked)}
                  className="hover:bg-red-50 h-8 w-8"
                >
                  <Heart className={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "text-gray-600")} />
                </Button>
              </div>
            </div>

            {/* Meta Information - Reduced spacing */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {productData.location?.city ||
                  productData.location?.state ||
                  productData.location?.country ||
                  "Unknown location"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeAgo(productData.created_at || productData.createdAt || "")}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {productData.views || 0} views
              </span>
            </div>

            {/* Tags and Categories - Smaller badges */}
            <div className="flex flex-wrap gap-1.5">
              {productData.category && (
                <Badge variant="secondary" className="text-xs">
                  {productData.category}
                </Badge>
              )}
              {productData.subCategory && (
                <Badge variant="secondary" className="text-xs">
                  {productData.subCategory}
                </Badge>
              )}
              {productData.condition && (
                <Badge variant="secondary" className="text-xs">
                  {productData.condition}
                </Badge>
              )}
              {Array.isArray(productData.tags) &&
                productData.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>

            {/* Description - Truncated for compactness */}
            <div>
              <h3 className="text-base font-semibold mb-2">Description</h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm max-h-20 overflow-hidden">
                {productData.description || <span className="italic text-gray-400">No description available</span>}
              </div>
            </div>

            {/* Custom Fields - More compact grid */}
            {productData.customFields && productData.customFields.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {productData.customFields.slice(0, 3).map((field: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                    >
                      <span className="font-medium">{field.fieldName}</span>
                      <span className="text-muted-foreground">
                        {typeof field.value === "boolean" ? (field.value ? "Yes" : "No") : field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Information - More compact */}
            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-3">Seller</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground">Seller</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ContactSellerButton
                    sellerId={productData.seller?._id || productData.user_id?._id || ""}
                    productTitle={productData.title || "Untitled Product"}
                    showPhoneNumber={productData.showPhoneNumber ?? true}
                    sellerName={displayName}
                    variant="both"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Full-Screen Gallery Modal */}
      {showGallery && images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} of {images.length}
            </div>

            {/* Main image */}
            <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
              <Image
                src={getImageUrl(images[currentImageIndex])! || "/placeholder.svg"}
                alt={productData.title || "Product image"}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
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
                      idx === currentImageIndex ? "border-white" : "border-white/30 hover:border-white/60",
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
          </div>
        </div>
      )}
    </>
  )
}
