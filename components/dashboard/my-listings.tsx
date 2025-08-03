"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Loader2 } from "lucide-react"
import axios from "axios"

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const res = await axios.get("/api/users/my-listings")
        setListings(res.data.products || [])
      } catch (err) {
        console.error("Failed to load listings", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyListings()
  }, [])

  if (loading) {
    return <Loader2 className="animate-spin mx-auto mt-8 h-6 w-6 text-primary" />
  }

  if (listings.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">You have no listings yet.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 px-4">
      {listings.map((product: any) => (
        <div
          key={product._id}
          className="backdrop-blur-lg bg-white/20 dark:bg-zinc-900/40 p-4 rounded-2xl shadow-lg border border-white/10"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
