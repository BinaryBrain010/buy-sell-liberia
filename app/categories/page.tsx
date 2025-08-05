"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Icon } from "@iconify/react" // ✅ Iconify import
import {
  Loader2,
  Car,
  Smartphone,
  Sofa,
  Shirt,
  Building,
  Briefcase,
  Gamepad2,
  Baby,
  Dumbbell,
  Book,
  Wrench,
  Palette,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCategories } from "@/hooks/useCategories"

// ✅ Gradient color mappings
const categoryColors: Record<string, string> = {
  "electronics": "from-blue-500 to-cyan-500",
  "vehicles": "from-green-500 to-emerald-500",
  "real-estate": "from-purple-500 to-pink-500",
  "home-furniture": "from-amber-500 to-orange-500",
  "fashion-beauty": "from-orange-500 to-red-500",
  "babies-kids": "from-pink-500 to-rose-500",
  "tools-equipment": "from-gray-500 to-slate-500",
  "services": "from-indigo-500 to-purple-500",
  "jobs": "from-emerald-500 to-teal-500",
  "sports-outdoors": "from-red-500 to-pink-500",
  "computers-accessories": "from-indigo-500 to-blue-500",
  "kitchen-appliances": "from-yellow-500 to-orange-500",
  "agriculture-farming": "from-green-600 to-green-500",
  "books-stationery": "from-purple-600 to-purple-500",
  "health-wellness": "from-teal-500 to-green-500",
  "pets-animals": "from-pink-600 to-red-500",
  "entertainment-hobbies": "from-blue-600 to-indigo-500",
}

// ✅ Lucide Icons Fallback
const iconMap: Record<string, LucideIcon> = {
  car: Car,
  smartphone: Smartphone,
  sofa: Sofa,
  shirt: Shirt,
  building: Building,
  briefcase: Briefcase,
  gamepad2: Gamepad2,
  baby: Baby,
  dumbbell: Dumbbell,
  book: Book,
  wrench: Wrench,
  palette: Palette,
}

const getIcon = (iconName: string): LucideIcon => iconMap[iconName] || Car

// ✅ Map Iconify logos for categories
const iconifyMap: Record<string, string> = {
  "electronics": "mdi:cellphone",
  "vehicles": "mdi:car",
  "real-estate": "mdi:home-city",
  "home-furniture": "mdi:sofa",
  "fashion-beauty": "mdi:hanger",
  "babies-kids": "mdi:baby-face-outline",
  "tools-equipment": "mdi:tools",
  "services": "mdi:handshake",
  "jobs": "mdi:briefcase",
  "sports-outdoors": "mdi:tennis",
  "computers-accessories": "mdi:laptop",
  "kitchen-appliances": "mdi:stove",
  "agriculture-farming": "mdi:tractor",
  "books-stationery": "mdi:book-open-variant",
  "health-wellness": "mdi:heart-pulse",
  "pets-animals": "mdi:dog",
  "entertainment-hobbies": "mdi:gamepad-variant",
}

export default function CategoriesPage() {
  const { categories, loading } = useCategories()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h1>
        <p className="text-muted-foreground">Find products by category</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => {
          const IconComponent = getIcon(category.icon || "")
          const gradient = categoryColors[category.slug] || "from-gray-500 to-gray-700"
          const adsCount = category.totalCount || 0
          const subcategories = category.subcategories || []
          const iconifyIcon = iconifyMap[category.slug]

          return (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={`/categories/${category.slug}`} className="group">
                <Card className="relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {/* Trending Badge */}
                  {(category as { trending?: boolean }).trending && (
                    <Badge className="absolute right-3 top-3 z-10" variant="secondary">
                      Trending
                    </Badge>
                  )}

                  <CardHeader className="pb-3">
                    {/* Icon with Gradient Background */}
                    <div
                      className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}
                    >
                      {iconifyIcon ? (
                        <Icon icon={iconifyIcon} className="h-6 w-6" /> // ✅ Iconify logo
                      ) : (
                        <IconComponent className="h-6 w-6" /> // ✅ Lucide fallback
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description || "Explore the latest deals"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Ads Count */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">{adsCount.toLocaleString()} ads</span>
                      {/* Progress Bar */}
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                          style={{ width: `${Math.min((adsCount / 3000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Subcategories */}
                    <div className="flex flex-wrap gap-1">
                      {subcategories.slice(0, 3).map((sub, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {sub.name}
                        </Badge>
                      ))}
                      {subcategories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{subcategories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
