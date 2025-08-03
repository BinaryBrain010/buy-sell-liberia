"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye, Star, User, Heart } from "lucide-react";
import Image from "next/image";
import ContactSellerButton from "@/components/ContactSellerButton";
import { useState } from "react";

// Dummy fallback for types, replace with actual import if available
// import { Product } from "../../types";

type ImageType = string | { url: string; alt?: string; isPrimary?: boolean };

interface ProductDetailProps {
  product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: any): string => {
    if (typeof price === "number") return `USD ${price.toLocaleString()}`;
    if (!price || typeof price.amount !== "number") return "Price not available";
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

  const images = Array.isArray(product.images) ? product.images : [];
  const displayName = product.seller?.fullName || product.user_id?.profile?.displayName || (product.user_id?.firstName && product.user_id?.lastName ? `${product.user_id.firstName} ${product.user_id.lastName}` : "Unknown Seller");

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Images */}
      <div>
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100">
          {images.length > 0 && getImageUrl(images[currentImageIndex]) ? (
            <Image
              src={getImageUrl(images[currentImageIndex])!}
              alt={typeof images[currentImageIndex] === "object" ? images[currentImageIndex].alt || product.title || "Product image" : product.title || "Product image"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_: ImageType, idx: number) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full border-2 ${idx === currentImageIndex ? "bg-white border-primary" : "bg-white/60 border-white"}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
              {images.length > 5 && <span className="text-xs text-white ml-1">+{images.length - 5}</span>}
            </div>
          )}
        </div>
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.slice(0, 5).map((img: ImageType, idx: number) => (
              <div
                key={idx}
                className={`relative w-16 h-12 rounded overflow-hidden border ${idx === currentImageIndex ? "border-primary" : "border-gray-200"} cursor-pointer`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                {getImageUrl(img) ? (
                  <Image src={getImageUrl(img)!} alt={typeof img === "object" ? img.alt || product.title : product.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold flex-1">{product.title || "Untitled Product"}</h1>
          {product.featured && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center"><Star className="h-4 w-4 mr-1" /> Featured</Badge>
          )}
          <Button size="icon" variant="ghost" onClick={() => setLiked(l => !l)}>
            <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </Button>
        </div>
        <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{product.location?.city || product.location?.state || product.location?.country || "Unknown location"}</span>
          <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{getTimeAgo(product.created_at || product.createdAt || "")}</span>
          <span className="flex items-center"><Eye className="h-4 w-4 mr-1" />{product.views || 0} views</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.category && <Badge variant="secondary">{product.category}</Badge>}
          {product.subCategory && <Badge variant="secondary">{product.subCategory}</Badge>}
          {product.condition && <Badge variant="secondary">{product.condition}</Badge>}
          {Array.isArray(product.tags) && product.tags.map((tag: string, idx: number) => <Badge key={idx} variant="outline">{tag}</Badge>)}
        </div>
        <div className="prose max-w-none text-base text-gray-100">
          {product.description || <span className="italic text-gray-400">No description available</span>}
        </div>
        {product.customFields && product.customFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {product.customFields.map((field: any, idx: number) => (
              <Badge key={idx} variant="secondary">
                {typeof field.value === "boolean" ? field.fieldName : `${field.fieldName}: ${field.value}`}
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
            sellerId={product.seller?._id || product.user_id?._id || ''}
            productTitle={product.title || 'Untitled Product'}
            showPhoneNumber={product.showPhoneNumber ?? true}
            sellerName={displayName}
            variant="both"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
