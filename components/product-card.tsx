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
import { Product } from "@/hooks/useCategories"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import ContactSellerButton from "./ContactSellerButton"

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
  const [liked, setLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    onLike?.(product._id)
  }

  const formatPrice = (price: Product['price']) => {
    const currency = price.currency === 'PKR' ? 'Rs.' : price.currency
    const formatted = `${currency} ${price.amount.toLocaleString()}`
    return price.negotiable ? `${formatted} (Negotiable)` : formatted
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const displayName = product.user_id.profile?.displayName || 
                     `${product.user_id.firstName} ${product.user_id.lastName}`

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className={`cursor-pointer ${className}`}
        >
          <Card className="glass border-0 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative">
              <div className="aspect-square relative overflow-hidden">
                {primaryImage && (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt || product.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                )}
                
                {/* Like button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={handleLike}
                >
                  <Heart 
                    className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>

                {/* Featured badge */}
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-primary mb-1">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.location.city}
                  <Clock className="h-3 w-3 ml-2 mr-1" />
                  {getTimeAgo(product.created_at)}
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`cursor-pointer ${className}`}
      >
        <Card className="glass border-0 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative">
            {/* Image carousel */}
            <div className="aspect-[4/3] relative overflow-hidden group">
              {primaryImage && (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              
              {/* Image indicators */}
              {product.images.length > 1 && (
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
              
              {/* Like button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 h-9 w-9 p-0 bg-white/80 hover:bg-white"
                onClick={handleLike}
              >
                <Heart 
                  className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>

              {/* Featured badge */}
              {product.featured && (
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </Badge>
              )}

              {/* Views counter */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {product.views}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title and Price */}
                <div>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                {/* Custom fields (show key specs) */}
                {product.customFields.length > 0 && (
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

                {/* Location and Time */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {product.location.city}, {product.location.state}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTimeAgo(product.created_at)}
                  </div>
                </div>

                {/* Seller info */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {product.user_id.profile?.avatar ? (
                        <Image
                          src={product.user_id.profile.avatar}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <ContactSellerButton
                      sellerId={product.user_id._id || product.user_id}
                      productTitle={product.title}
                      showPhoneNumber={product.showPhoneNumber !== false} // Default to true if not specified
                      sellerName={displayName}
                      variant="both"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
