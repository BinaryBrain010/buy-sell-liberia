"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Calendar, Star, Edit, Trash2, Search, Plus, Package } from "lucide-react"
import { useRouter } from "next/navigation"

interface Listing {
  _id: string
  title: string
  description: string
  price: {
    amount: number
    currency: string
    negotiable: boolean
  }
  status: "active" | "sold" | "draft" | "expired"
  createdAt: string
  updatedAt: string
  views: number
  featured: boolean
  category: string
  subCategory?: string
  images: { url: string; alt?: string }[]
  location: {
    city: string
    state?: string
    country: string
  }
}

interface UserListingsProps {
  userId: string
}

export default function UserListings({ userId }: UserListingsProps) {
  console.log('🎯 UserListings component rendered with userId:', userId)
  
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  // Fetch user's listings from API
  const fetchUserListings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching listings for userId:', userId)
      const response = await fetch(`/api/products/user/${userId}`)
      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ API Response data:', data)
      setListings(data.products || [])
    } catch (err) {
      console.error('❌ Error fetching user listings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 UserListings useEffect triggered with userId:', userId)
    if (userId) {
      console.log('✅ userId is valid, fetching listings...')
      fetchUserListings()
    } else {
      console.log('❌ userId is missing or invalid')
      setError('User ID is required to fetch listings')
      setLoading(false)
    }
  }, [userId])

  // Refresh listings
  const refreshListings = () => {
    fetchUserListings()
  }

  // Delete a listing
  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${listingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete listing')
      }

      // Remove the deleted listing from state
      setListings(prevListings => prevListings.filter(listing => listing._id !== listingId))
      
      // Show success message (you can add a toast notification here)
      console.log('Listing deleted successfully')
    } catch (err) {
      console.error('Error deleting listing:', err)
      alert('Failed to delete listing. Please try again.')
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "sold":
        return "secondary"
      case "draft":
        return "outline"
      case "expired":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading your listings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">Failed to load listings</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refreshListings} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Listings</h2>
          <p className="text-muted-foreground">Manage your posted items</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshListings}
            disabled={loading}
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => router.push('/sell')}
          >
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {listings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{listings.length}</div>
            <div className="text-sm text-muted-foreground">Total Listings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {listings.filter(l => l.status === 'sold').length}
            </div>
            <div className="text-sm text-muted-foreground">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {listings.filter(l => l.featured).length}
            </div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{listing.description}</CardDescription>
                </div>
                {listing.featured && <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${listing.price?.amount || 0}
                  {listing.price?.negotiable && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">(Negotiable)</span>
                  )}
                </span>
                <Badge variant={getStatusColor(listing.status) as any}>{listing.status}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {listing.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-transparent"
                  onClick={() => router.push(`/sell?edit=${listing._id}`)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteListing(listing._id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          {searchTerm || statusFilter !== 'all' ? (
            <div className="space-y-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No listings found</h3>
              <p className="text-muted-foreground">No listings match your current search criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No listings yet</h3>
              <p className="text-muted-foreground">You haven't created any listings yet. Start selling by creating your first listing!</p>
              <Button onClick={() => router.push('/sell')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
