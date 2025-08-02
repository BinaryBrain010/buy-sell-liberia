'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ThreeBackground } from '@/components/three-background'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()

  const categories = [
    "Electronics",
    "Vehicles",
    "Real Estate",
    "Fashion & Beauty",
    "Sports & Outdoors",
    "Services"
  ]

  const handleCategoryClick = (category: string) => {
    const slug = category
      .toLowerCase()
      .replace(/&/g, '')             
      .replace(/\s+/g, '-')          
      .replace(/[^\w-]+/g, '')       

    router.push(`/categories/${slug}`)
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <ThreeBackground />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Buy & Sell Anything
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            The leading marketplace connecting buyers and sellers
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <span className="text-muted-foreground mr-2">Popular:</span>
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                onClick={() => handleCategoryClick(category)}
                className="glass border-0 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
              >
                {category}
              </Badge>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
