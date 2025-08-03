"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  MapPin, 
  Eye, 
  Clock, 
  Star,
  User
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import ContactSellerButton from "./ContactSellerButton"

// Type definitions
// Support both string and object for images
type ImageType = string | { url: string; alt?: string; isPrimary?: boolean };

interface Image {
  url: string
  alt?: string
  isPrimary?: boolean
}

// Support price as number or object
type PriceType = number | { amount: number; currency?: string; negotiable?: boolean };

interface Price {
  amount: number
  currency?: string
  negotiable?: boolean
}

interface Location {
  city?: string
  state?: string
  country?: string
}

interface Profile {
  displayName?: string
  avatar?: string
}

// Support seller as object from API
interface Seller {
  _id: string
  fullName?: string
  username?: string
  email?: string
  phone?: string
  country?: string
}

interface User {
  _id: string
  firstName?: string
  lastName?: string
  profile?: Profile
}

interface CustomField {
  fieldName: string
  value: string | boolean | number
}

interface Product {
  _id: string
  slug?: string
  title: string
  description?: string
  price: PriceType
  images: ImageType[]
  location: Location
  created_at?: string
  createdAt?: string
  user_id?: User
  seller?: Seller
  featured?: boolean
  views?: number
  customFields?: CustomField[]
  showPhoneNumber?: boolean
  // Added fields for richer card details
  category?: string
  subCategory?: string
  condition?: string
  tags?: string[]
  negotiable?: boolean
}

interface ProductCardProps {
  product: Product
  onLike?: (productId: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

export function ProductCard({ 
  product, 
  onLike, 
  className = "",
  variant = 'default' 
}: ProductCardProps) {
  const [liked, setLiked] = useState<boolean>(false)
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      setLiked(prev => !prev);
      if (onLike && product._id) {
        onLike(product._id);
      }
    } catch (error) {
      console.error('Error handling like action:', error);
    }
  };

  // Prevent navigation when clicking ContactSellerButton
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Support price as number or object
  const formatPrice = (price: PriceType): string => {
    try {
      if (typeof price === 'number') {
        return `USD ${price.toLocaleString()}`;
      }
      if (!price || typeof price.amount !== 'number') {
        return 'Price not available';
      }
      const currency = price.currency || 'USD';
      const formatted = `${currency} ${price.amount.toLocaleString()}`;
      return price.negotiable ? `${formatted} (Negotiable)` : formatted;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Price not available';
    }
  };

  const getTimeAgo = (dateString: string): string => {
    try {
      if (!dateString) return 'Unknown date'
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    } catch (error) {
      console.error('Error calculating time ago:', error)
      return 'Unknown date'
    }
  }

  // Helper to resolve image URL
  const getImageUrl = (img: ImageType | undefined): string | undefined => {
    if (!img) return undefined;
    if (typeof img === 'string') {
      // If string, treat as relative path from API
      if (img.startsWith('http')) return img;
      return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${img}`;
    }
    if (img.url.startsWith('http')) return img.url;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${img.url}`;
  };

  // Find primary image, support both string and object
  let primaryImage: ImageType | undefined = undefined;
  if (Array.isArray(product.images)) {
    primaryImage = product.images.find((img: any) => typeof img === 'object' && img.isPrimary) || product.images[0];
  }
  // Prefer seller.fullName, fallback to user_id
  const displayName = product.seller?.fullName
    || product.user_id?.profile?.displayName
    || (product.user_id?.firstName && product.user_id?.lastName
      ? `${product.user_id.firstName} ${product.user_id.lastName}`
      : 'Unknown Seller');

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug || product._id || ''}`}> {/* fallback to _id if no slug */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`cursor-pointer ${className}`}
        >
          <Card className="glass border-0 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[240px] flex">
            <div className="flex flex-row items-stretch w-full">
              {/* Image section */}
              <div className="relative w-32 min-w-32 h-32 flex-shrink-0 overflow-hidden group">
                {primaryImage && getImageUrl(primaryImage) ? (
                  <Image
                    src={getImageUrl(primaryImage)!}
                    alt={typeof primaryImage === 'object' ? (primaryImage.alt || product.title || 'Product image') : product.title || 'Product image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-7 w-7 p-0 bg-white/80 hover:bg-white"
                  onClick={e => { handleLike(e); }}
                  tabIndex={0}
                >
                  <Heart 
                    className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
                {product.featured && (
                  <Badge className="absolute top-1 left-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 text-[10px]">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-[10px] flex items-center">
                  <Eye className="h-3 w-3 mr-0.5" />
                  {product.views || 0}
                </div>
              </div>
              {/* Details section */}
              <CardContent className="flex-1 p-3 flex flex-col justify-between min-h-[128px]">
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <h3 className="font-semibold text-sm line-clamp-1 flex-1">
                      {product.title || 'Untitled Product'}
                    </h3>
                    {product.negotiable && (
                      <Badge variant="outline" className="text-[10px] border-green-500 text-green-700">Negotiable</Badge>
                    )}
                  </div>
                  <p className="text-base font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-0.5" />{product.location?.city || product.location?.state || product.location?.country || 'Unknown location'}</span>
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-0.5" />{getTimeAgo(product.created_at || product.createdAt || '')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {product.category && <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>}
                    {product.subCategory && <Badge variant="secondary" className="text-[10px]">{product.subCategory}</Badge>}
                    {product.condition && <Badge variant="secondary" className="text-[10px]">{product.condition}</Badge>}
                  </div>
                  {Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{product.tags.length - 3}</Badge>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {product.description || 'No description available'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-medium line-clamp-1 max-w-[80px]">{displayName}</span>
                  </div>
                  <div onClick={handleContactClick} tabIndex={0} style={{ cursor: 'pointer' }}>
                    <ContactSellerButton
                      sellerId={product.seller?._id || product.user_id?._id || ''}
                      productTitle={product.title || 'Untitled Product'}
                      showPhoneNumber={product.showPhoneNumber ?? true}
                      sellerName={displayName}
                      variant="both"
                      size="sm"
                    />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug || ''}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`cursor-pointer ${className}`}
      >
        <Card className="glass border-0 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[320px] flex flex-col">
          <div className="relative flex-1 flex flex-col">
            <div className="aspect-[4/3] relative overflow-hidden group">
                {primaryImage && getImageUrl(primaryImage) ? (
                  <Image
                    src={getImageUrl(primaryImage)!}
                    alt={typeof primaryImage === 'object' ? (primaryImage.alt || product.title || 'Product image') : product.title || 'Product image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
              {product.images?.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {product.images.slice(0, 5).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                  {product.images.length > 5 && (
                    <span className="text-white text-xs ml-1">+{product.images.length - 5}</span>
                  )}
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 h-9 w-9 p-0 bg-white/80 hover:bg-white"
                onClick={e => { handleLike(e); }}
                tabIndex={0}
              >
                <Heart 
                  className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>

              {product.featured && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </Badge>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {product.views || 0}
              </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-1 justify-between min-h-[160px]">
              <div className="space-y-3 flex-1 flex flex-col">
                <div>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {product.title || 'Untitled Product'}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                {product.customFields && product.customFields.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.customFields.slice(0, 3).map((field, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typeof field.value === 'boolean' 
                          ? field.fieldName 
                          : `${field.fieldName}: ${field.value}`
                        }
                      </Badge>
                    ))}
                    {product.customFields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.customFields.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {product.location?.city && product.location?.state
                      ? `${product.location.city}, ${product.location.state}`
                      : product.location?.city || product.location?.state || product.location?.country || 'Unknown location'}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTimeAgo(product.created_at || product.createdAt || '')}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
                <div className="flex space-x-1" onClick={handleContactClick} tabIndex={0} style={{ cursor: 'pointer' }}>
                  <ContactSellerButton
                    sellerId={product.seller?._id || product.user_id?._id || ''}
                    productTitle={product.title || 'Untitled Product'}
                    showPhoneNumber={product.showPhoneNumber ?? true}
                    sellerName={displayName}
                    variant="both"
                    size="sm"
                  />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}