"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Clock, Star } from "lucide-react"
import Image from "next/image"

const listings = [
  {
    id: 1,
    title: "iPhone 14 Pro Max - Like New",
    price: "$850",
    location: "Downtown, Central City",
    image: "/placeholder.svg?height=200&width=300&text=iPhone+14+Pro",
    category: "Electronics",
    featured: true,
    rating: 4.8,
    seller: "John Doe",
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    title: "2019 Toyota Camry - Excellent Condition",
    price: "$18,500",
    location: "Westside, Metro Area",
    image: "/placeholder.svg?height=200&width=300&text=Toyota+Camry",
    category: "Vehicles",
    featured: true,
    rating: 4.9,
    seller: "Mary Johnson",
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    title: "3 Bedroom House for Rent",
    price: "$450/month",
    location: "Suburbs, East District",
    image: "/placeholder.svg?height=200&width=300&text=House+Rental",
    category: "Real Estate",
    featured: false,
    rating: 4.6,
    seller: "David Wilson",
    timeAgo: "1 day ago",
  },
  {
    id: 4,
    title: 'MacBook Pro 16" M2 Chip',
    price: "$2,200",
    location: "Tech District, North Side",
    image: "/placeholder.svg?height=200&width=300&text=MacBook+Pro",
    category: "Electronics",
    featured: true,
    rating: 4.7,
    seller: "Sarah Davis",
    timeAgo: "3 hours ago",
  },
  {
    id: 5,
    title: "Designer Sneakers Collection",
    price: "$150",
    location: "Fashion Quarter, City Center",
    image: "/placeholder.svg?height=200&width=300&text=Designer+Sneakers",
    category: "Fashion",
    featured: false,
    rating: 4.5,
    seller: "Michael Brown",
    timeAgo: "6 hours ago",
  },
  {
    id: 6,
    title: "Honda Motorcycle 2020",
    price: "$3,200",
    location: "Industrial Area, South Side",
    image: "/placeholder.svg?height=200&width=300&text=Honda+Motorcycle",
    category: "Vehicles",
    featured: true,
    rating: 4.8,
    seller: "James Miller",
    timeAgo: "4 hours ago",
  },
]

export function FeaturedListings() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Listings</h2>
          <p className="text-xl text-muted-foreground">Discover the best deals available</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="glass border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <Image
                    src={listing.image || "/placeholder.svg"}
                    alt={listing.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {listing.featured && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-3 right-3 glass border-0 hover:bg-red-500 hover:text-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="glass border-0">
                      {listing.category}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {listing.rating}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>

                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">{listing.price}</span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {listing.timeAgo}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">by {listing.seller}</span>
                    <Button size="sm">Contact Seller</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" className="glass border-0 bg-transparent">
            View All Listings
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
