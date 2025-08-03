"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Loader2 } from "lucide-react"
import axios from "axios"

export default function FavouriteListings() {
  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await axios.get("/api/user/favourites")
        setFavourites(res.data || [])
      } catch (err) {
        console.error("Failed to load favourites", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFavourites()
  }, [])

  if (loading) {
    return <Loader2 className="animate-spin mx-auto mt-8 h-6 w-6" />
  }

  if (favourites.length === 0) {
    return <p className="text-muted-foreground mt-4">You haven't favourited any listings yet.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favourites.map((product: any) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
