"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Calendar, Star, Edit, Trash2, Search } from "lucide-react"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  status: "active" | "sold" | "draft"
  createdAt: string
  views: number
  featured: boolean
  category: string
}

interface UserListingsProps {
  userId: string
}

export default function UserListings({ userId }: UserListingsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setListings([
        {
          _id: "1",
          title: "iPhone 15 Pro",
          description: "Brand new iPhone 15 Pro in excellent condition",
          price: 999,
          status: "active",
          createdAt: "2024-01-15T10:00:00Z",
          views: 45,
          featured: true,
          category: "Electronics",
        },
        {
          _id: "2",
          title: "MacBook Air M2",
          description: "Lightly used MacBook Air with M2 chip",
          price: 1299,
          status: "active",
          createdAt: "2024-01-14T15:30:00Z",
          views: 32,
          featured: false,
          category: "Electronics",
        },
        {
          _id: "3",
          title: "AirPods Pro",
          description: "Apple AirPods Pro with noise cancellation",
          price: 249,
          status: "sold",
          createdAt: "2024-01-13T09:15:00Z",
          views: 28,
          featured: false,
          category: "Electronics",
        },
        {
          _id: "4",
          title: "Gaming Chair",
          description: "Ergonomic gaming chair in great condition",
          price: 199,
          status: "draft",
          createdAt: "2024-01-12T14:20:00Z",
          views: 0,
          featured: false,
          category: "Furniture",
        },
        {
          _id: "5",
          title: "Vintage Watch",
          description: "Classic vintage watch from the 1980s",
          price: 450,
          status: "active",
          createdAt: "2024-01-11T11:45:00Z",
          views: 67,
          featured: true,
          category: "Accessories",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [userId])

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
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading your listings...</p>
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
        <Button className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Create New Listing
        </Button>
      </div>

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
                <span className="text-2xl font-bold">${listing.price}</span>
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
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
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
          <p className="text-muted-foreground">No listings found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
