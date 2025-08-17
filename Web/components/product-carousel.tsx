"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { ProductCard } from "./product-card"
import { Product } from "@/hooks/useCategories"
import Link from "next/link"

interface ProductCarouselProps {
  products: Product[]
  title: string
  categorySlug: string
  totalCount?: number
  onLike?: (productId: string) => void
  className?: string
}

export function ProductCarousel({
  products,
  title,
  categorySlug,
  totalCount,
  onLike,
  className = ""
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const itemsPerView = 4 // Responsive: could be 2 on mobile, 3 on tablet, 4 on desktop
  const maxIndex = Math.max(0, products.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex))
  }

  if (!products || products.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No products available in this category yet.</p>
          <Link href="/sell">
            <Button className="mt-4">Be the first to sell</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`py-8 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          {totalCount && (
            <p className="text-muted-foreground">
              {totalCount.toLocaleString()} items available
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Navigation arrows */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View All button */}
          <Link href={`/categories/${categorySlug}`}>
            <Button variant="default" size="sm" className="ml-2">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden" ref={carouselRef}>
        <motion.div
          className="flex gap-4"
          animate={{
            x: `-${currentIndex * (100 / itemsPerView)}%`
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          style={{
            width: `${(products.length / itemsPerView) * 100}%`
          }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              className="flex-shrink-0"
              style={{ width: `${100 / products.length}%` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onLike={onLike}
                variant="compact"
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Overlay navigation (appears on hover) */}
        <AnimatePresence>
          {isHovered && products.length > itemsPerView && (
            <>
              {currentIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              )}
              
              {currentIndex < maxIndex && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      {products.length > itemsPerView && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Responsive variant with different items per view
export function ResponsiveProductCarousel(props: ProductCarouselProps) {
  return (
    <div className="w-full">
      {/* Mobile: 1-2 items */}
      <div className="block sm:hidden">
        <ProductCarousel {...props} />
      </div>
      
      {/* Tablet: 2-3 items */}
      <div className="hidden sm:block lg:hidden">
        <ProductCarousel {...props} />
      </div>
      
      {/* Desktop: 4+ items */}
      <div className="hidden lg:block">
        <ProductCarousel {...props} />
      </div>
    </div>
  )
}
