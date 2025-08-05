"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2 } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import Link from "next/link"

// Color mappings for categories (matching existing design)
const categoryColors: { [key: string]: string } = {
  'electronics': 'from-blue-500 to-cyan-500',
  'vehicles': 'from-green-500 to-emerald-500',
  'real-estate': 'from-purple-500 to-pink-500',
  'home-furniture': 'from-amber-500 to-orange-500',
  'fashion-beauty': 'from-orange-500 to-red-500',
  'babies-kids': 'from-pink-500 to-rose-500',
  'tools-equipment': 'from-gray-500 to-slate-500',
  'services': 'from-indigo-500 to-purple-500',
  'jobs': 'from-emerald-500 to-teal-500',
  'sports-outdoors': 'from-red-500 to-pink-500'
}

export function CategoriesSection() {
  const { categories, loading, error } = useCategories(true, 6) // Include products with limit of 6

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
            <p className="text-xl text-muted-foreground">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-muted/50"></div>
                    <div className="h-4 bg-muted/50 rounded mb-2"></div>
                    <div className="h-3 bg-muted/30 rounded w-16 mx-auto"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Remove error display - we'll use mock data as fallback

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
          <p className="text-xl text-muted-foreground">Find exactly what you're looking for</p>
        </motion.div>

        {/* Categories Grid - Show only 4-5 categories on home page */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-16">
          {categories.slice(0, 10).map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              <Link href={`/categories/${category.slug}`}>
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5 overflow-hidden group">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${
                        categoryColors[category.slug] || 'from-gray-500 to-gray-600'
                      } flex items-center justify-center text-3xl shadow-lg`}
                    >
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 text-foreground">
                      {category.name}
                    </h3>
                    {category.totalCount !== undefined && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <span className="font-semibold">{category.totalCount.toLocaleString()}</span> ads
                      </p>
                    )}
                    {category.subcategories.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-muted/30 text-muted-foreground border-0"
                      >
                        {category.subcategories.length} types
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mb-16">
          <Link href="/categories">
            <Button variant="outline" size="lg" className="glass border-0">
              View All Categories
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  )
}
