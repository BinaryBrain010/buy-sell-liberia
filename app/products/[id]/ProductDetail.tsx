import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye, Star, User, Heart } from "lucide-react";
import Image from "next/image";
import ContactSellerButton from "@/components/ContactSellerPopup";
import { useEffect, useState } from "react";


type ImageType = string | { url: string; alt?: string; isPrimary?: boolean };

interface ProductDetailProps {
  [key: string]: any;
}

export default function ProductDetail(productData: ProductDetailProps) {
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: any): string => {
    if (typeof price === "number") return `USD ${price.toLocaleString()}`;
    if (!price || typeof price.amount !== "number")
      return "Price not available";
    const currency = price.currency || "USD";
    const formatted = `${currency} ${price.amount.toLocaleString()}`;
    return price.negotiable ? `${formatted} (Negotiable)` : formatted;
  };

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
      return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img}`;
    }
    if (img.url.startsWith("http")) return img.url;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${img.url}`;
  };

  const images = Array.isArray(productData?.images) ? productData.images : [];
  const displayName =
    productData?.seller?.fullName ||
    productData?.user_id?.profile?.displayName ||
    (productData?.user_id?.firstName && productData?.user_id?.lastName
      ? `${productData.user_id.firstName} ${productData.user_id.lastName}`
      : "Unknown Seller");

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
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <div
          className={`relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 group cursor-pointer`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.length > 0 && getImageUrl(images[currentImageIndex]) ? (
            <Image
              src={getImageUrl(images[currentImageIndex])!}
              alt={
                typeof images[currentImageIndex] === "object"
                  ? images[currentImageIndex].alt ||
                    productData.title ||
                    "Product image"
                  : productData.title || "Product image"
              }
              fill
              className={`object-cover transition-transform duration-200 ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              priority
              onClick={() => setShowModal(true)}
              style={{ zIndex: 1 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {/* Carousel controls for multiple images, only show on hover */}
          {images.length > 1 && isHovered && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                }}
                aria-label="Previous image"
              >
                &#8592;
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                }}
                aria-label="Next image"
              >
                &#8594;
              </button>
            </>
          )}
          {/* Dots always visible */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_: ImageType, idx: number) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full border-2 ${
                    idx === currentImageIndex
                      ? "bg-white border-primary"
                      : "bg-white/60 border-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}
          {/* Hover overlay effect */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/10 transition-opacity duration-200 pointer-events-none z-0" />
          )}
        </div>
        {/* Modal for expanded image */}
        {showModal && images.length > 0 && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative max-w-3xl w-full aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src={getImageUrl(images[currentImageIndex])!}
                alt={productData.title || "Product image"}
                fill
                className="object-contain"
                priority
              />
              <button
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                aria-label="Close expanded image"
              >
                &#10005;
              </button>
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      );
                    }}
                    aria-label="Previous image"
                  >
                    &#8592;
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    aria-label="Next image"
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.slice(0, 5).map((img: ImageType, idx: number) => (
              <div
                key={idx}
                className={`relative w-16 h-12 rounded overflow-hidden border ${
                  idx === currentImageIndex
                    ? "border-primary"
                    : "border-gray-200"
                } cursor-pointer`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                {getImageUrl(img) ? (
                  <Image
                    src={getImageUrl(img)!}
                    alt={
                      typeof img === "object"
                        ? img.alt || productData.title
                        : productData.title
                    }
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold flex-1">
            {productData.title || "Untitled Product"}
          </h1>
          {productData.featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center">
              <Star className="h-4 w-4 mr-1" /> Featured
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLiked((l) => !l)}
          >
            <Heart
              className={`h-5 w-5 ${
                liked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </Button>
        </div>
        <div className="text-3xl font-bold text-primary">
          {formatPrice(productData.price)}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {productData.location?.city ||
              productData.location?.state ||
              productData.location?.country ||
              "Unknown location"}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {getTimeAgo(productData.created_at || productData.createdAt || "")}
          </span>
          <span className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            {productData.views || 0} views
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {productData.category && (
            <Badge variant="secondary">{productData.category}</Badge>
          )}
          {productData.subCategory && (
            <Badge variant="secondary">{productData.subCategory}</Badge>
          )}
          {productData.condition && (
            <Badge variant="secondary">{productData.condition}</Badge>
          )}
          {Array.isArray(productData.tags) &&
            productData.tags.map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline">
                {tag}
              </Badge>
            ))}
        </div>
        <div className="prose max-w-none text-base text-gray-800 dark:text-gray-100">
          {productData.description || (
            <span className="italic text-gray-400">
              No description available
            </span>
          )}
        </div>
        {productData.customFields && productData.customFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {productData.customFields.map((field: any, idx: number) => (
              <Badge key={idx} variant="secondary">
                {typeof field.value === "boolean"
                  ? field.fieldName
                  : `${field.fieldName}: ${field.value}`}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-medium">{displayName}</span>
          </div>
          <ContactSellerButton
            sellerId={productData.seller?._id || productData.user_id?._id || ""}
            productTitle={productData.title || "Untitled Product"}
            showPhoneNumber={productData.showPhoneNumber ?? true}
            sellerName={displayName}
            variant="both"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
