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
  condition: string
  images: { url: string; alt?: string }[]
  location: {
    city: string
    state?: string
    country: string
  }
  tags: string[]
  showPhoneNumber: boolean
  expiresAt?: string
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
  const [editingListing, setEditingListing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    title?: string;
    description?: string;
    price?: {
      amount: number;
      currency: string;
      negotiable: boolean;
    };
    category?: string;
    subCategory?: string | undefined;
    status?: string;
    condition?: string;
    featured?: boolean;
    location?: {
      city: string;
      state?: string;
      country: string;
    };
    tags?: string[];
    showPhoneNumber?: boolean;
    expiresAt?: string;
  }>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [categories, setCategories] = useState<Array<{
    _id: string;
    name: string;
    subcategories: Array<{ _id: string; name: string }>;
  }>>([])
  const [subcategories, setSubcategories] = useState<Array<{ _id: string; name: string }>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
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
      fetchCategories() // Also fetch categories
    } else {
      console.log('❌ userId is missing or invalid')
      setError('User ID is required to fetch listings')
      setLoading(false)
    }
  }, [userId])

  // Fetch categories for dropdowns
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      console.log('🌐 Fetching categories...')
      
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      console.log('✅ Categories fetched:', data.categories)
      setCategories(data.categories || [])
    } catch (err) {
      console.error('❌ Error fetching categories:', err)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  // Update subcategories when category changes
  const handleCategoryChange = (categoryId: string) => {
    if (!categoryId || categoryId === 'loading') {
      setSubcategories([])
      setEditForm(prev => ({ ...prev, subCategory: undefined })) // Reset subcategory
      return
    }
    
    const category = categories.find(cat => cat._id === categoryId)
    if (category) {
      setSubcategories(category.subcategories || [])
      setEditForm(prev => ({ ...prev, subCategory: undefined })) // Reset subcategory
    } else {
      setSubcategories([])
      setEditForm(prev => ({ ...prev, subCategory: undefined }))
    }
  }

  // Populate subcategories for existing listings when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && editingListing) {
      const listing = listings.find(l => l._id === editingListing)
      if (listing && listing.category) {
        handleCategoryChange(listing.category)
      }
    }
  }, [categories, editingListing, listings])

  // Refresh listings
  const refreshListings = () => {
    fetchUserListings()
  }

  // Start editing a listing
  const handleStartEdit = (listing: Listing) => {
    setEditingListing(listing._id)
    setEditForm({
      title: listing.title,
      description: listing.description,
      price: {
        amount: listing.price?.amount || 0,
        currency: listing.price?.currency || 'USD',
        negotiable: listing.price?.negotiable || false
      },
      category: listing.category,
      subCategory: listing.subCategory,
      status: listing.status,
      condition: listing.condition,
      featured: listing.featured,
      location: {
        city: listing.location?.city || '',
        state: listing.location?.state || '',
        country: listing.location?.country || ''
      },
      tags: listing.tags || [],
      showPhoneNumber: listing.showPhoneNumber,
      expiresAt: listing.expiresAt
    })
    
    // Set subcategories for the selected category
    if (listing.category && listing.category !== 'loading') {
      handleCategoryChange(listing.category)
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingListing(null)
    setEditForm({})
  }

  // Update a listing
  const handleUpdateListing = async (listingId: string) => {
    try {
      setIsUpdating(true)
      
      // Prepare the update data with correct field names for database
      const updateData = {
        ...editForm,
        // Map the fields correctly for the API
        category_id: editForm.category && editForm.category !== 'loading' ? editForm.category : undefined,
        subcategory_id: editForm.subCategory && editForm.subCategory !== 'no-subcategories' ? editForm.subCategory : undefined,
        // Include the user_id field that the main Product model expects
        user_id: userId,
        // Remove the old field names
        category: undefined,
        subCategory: undefined
      }
      
      console.log('📤 Main update request body:', updateData)
      
      // NOTE: The current API endpoint uses ProductService which expects 'seller' field
      // but the main database uses 'user_id' field. This mismatch causes 404 errors.
      // For now, we're sending user_id to see if it helps, but a proper fix
      // would be to update the API to work with the main Product model.
      
      const response = await fetch(`/api/products/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update listing')
      }

      const updatedListing = await response.json()
      
      // Update the listing in local state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === listingId 
            ? { 
                ...listing, 
                ...editForm, 
                ...updatedListing.product,
                // Map database fields back to display fields
                category: editForm.category,
                subCategory: editForm.subCategory
              }
            : listing
        )
      )

      // Reset edit state
      setEditingListing(null)
      setEditForm({})
      
      // Show success message
      console.log('Listing updated successfully')
      // You can add a toast notification here if you have a toast system
    } catch (err) {
      console.error('Error updating listing:', err)
      alert(err instanceof Error ? err.message : 'Failed to update listing. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle image removal
  const handleRemoveImage = async (listingId: string, imageIndex: number) => {
    if (!confirm('Are you sure you want to remove this image?')) {
      return
    }

    try {
      setIsImageLoading(true)
      console.log('🗑️ Removing image at index:', imageIndex, 'from listing:', listingId)
      
      const listing = listings.find(l => l._id === listingId)
      if (!listing) {
        console.error('❌ Listing not found:', listingId)
        return
      }

      console.log('📸 Current images:', listing.images)
      const updatedImages = listing.images.filter((_, index) => index !== imageIndex)
      console.log('📸 Updated images:', updatedImages)
      
      // Update the listing with the new images array using the main product endpoint
      console.log('🔄 Updating listing images after removal...')
      console.log('🔄 Calling main product API endpoint:', `/api/products/${listingId}`)
      console.log('📤 Sending images-only update:', { images: updatedImages })
      
      const response = await fetch(`/api/products/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: updatedImages
        })
      })
      
      console.log('📡 Product API response status:', response.status)
      console.log('📡 Product API response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error response:', errorText)
        throw new Error(`Failed to remove image: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Image removal API response:', result)

      // Update local state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === listingId 
            ? { ...listing, images: updatedImages }
            : listing
        )
      )

      console.log('✅ Image removed successfully')
    } catch (err) {
      console.error('❌ Error removing image:', err)
      alert(`Failed to remove image: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsImageLoading(false)
    }
  }

  // Handle adding new images using multer upload
  const handleAddImages = async (listingId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    try {
      setIsImageLoading(true)
      console.log('📤 Adding images to listing:', listingId)
      console.log('📁 Files to upload:', files.length)
      
      // Create FormData for multer upload
      const formData = new FormData()
      formData.append('productId', listingId)
      formData.append('type', 'product')
      
      // Add each file to FormData
      Array.from(files).forEach((file, index) => {
        console.log(`📄 File ${index}:`, file.name, file.type, file.size)
        formData.append('files', file)
      })

      console.log('🚀 Uploading to /api/upload...')
      
      // Upload files using multer endpoint
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Upload API Error:', errorText)
        throw new Error(`Failed to upload images: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log('✅ Upload result:', uploadResult)
      
      // Extract image URLs from upload result
      let imageUrls: string[] = []
      if (uploadResult.files && Array.isArray(uploadResult.files)) {
        imageUrls = uploadResult.files.map((file: any) => file.url)
      } else if (uploadResult.urls && Array.isArray(uploadResult.urls)) {
        imageUrls = uploadResult.urls
      } else if (Array.isArray(uploadResult)) {
        imageUrls = uploadResult
      } else {
        console.error('❌ Unexpected upload response format:', uploadResult)
        throw new Error('Invalid upload response format')
      }

      console.log('🖼️ Extracted image URLs:', imageUrls)

      // Get current listing
      const listing = listings.find(l => l._id === listingId)
      if (!listing) {
        console.error('❌ Listing not found:', listingId)
        return
      }

      // Create new image objects with proper structure
      const newImages = imageUrls.map((url: string) => ({
        url: url,
        alt: '',
        isPrimary: false,
        order: 0
      }))

      // Combine existing and new images
      const updatedImages = [...listing.images, ...newImages]
      console.log('🖼️ Combined images:', updatedImages.length)

      // Update the listing with new images using a simple approach
      console.log('🔄 Updating listing with new images...')
      
      // Use the main product update endpoint for images
      console.log('🔄 Calling main product API endpoint:', `/api/products/${listingId}`)
      console.log('📤 Sending images-only update:', { images: updatedImages })
      
      const updateResponse = await fetch(`/api/products/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: updatedImages
        })
      })
      
      console.log('📡 Product API response status:', updateResponse.status)
      console.log('📡 Product API response headers:', updateResponse.headers)

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('❌ Update API Error:', errorText)
        throw new Error(`Failed to update listing with new images: ${updateResponse.status} ${updateResponse.statusText}`)
      }

      const updateResult = await updateResponse.json()
      console.log('✅ Update result:', updateResult)

      // Update local state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === listingId 
            ? { ...listing, images: updatedImages }
            : listing
        )
      )

      console.log('✅ Images added successfully')
      
      // Clear the file input
      const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      
    } catch (err) {
      console.error('❌ Error adding images:', err)
      alert(`Failed to add images: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsImageLoading(false)
    }
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

              {/* Edit Form Fields */}
              {editingListing === listing._id && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Title *</label>
                      <Input
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Product title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Condition *</label>
                      <Select 
                        value={editForm.condition || listing.condition || 'new'} 
                        onValueChange={(value) => setEditForm({ ...editForm, condition: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category and Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Category *</label>
                      <Select 
                        value={editForm.category || listing.category || undefined} 
                        onValueChange={(value) => {
                          if (value && value !== 'loading') {
                            setEditForm({ ...editForm, category: value })
                            handleCategoryChange(value)
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : (
                            categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Subcategory</label>
                      <Select 
                        value={editForm.subCategory || listing.subCategory || undefined} 
                        onValueChange={(value) => {
                          if (value && value !== 'no-subcategories') {
                            setEditForm({ ...editForm, subCategory: value })
                          }
                        }}
                        disabled={!editForm.category || subcategories.length === 0}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={!editForm.category ? "Select category first" : "Select subcategory"} />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.length === 0 ? (
                            <SelectItem value="no-subcategories" disabled>
                              {!editForm.category ? "Select category first" : "No subcategories available"}
                            </SelectItem>
                          ) : (
                            subcategories.map((subcategory) => (
                              <SelectItem key={subcategory._id} value={subcategory._id}>
                                {subcategory.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description *</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe your product in detail..."
                      className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Price and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Price ($) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.price?.amount || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          price: { 
                            amount: parseFloat(e.target.value) || 0,
                            currency: editForm.price?.currency || 'USD',
                            negotiable: editForm.price?.negotiable || false
                          } 
                        })}
                        placeholder="0.00"
                        className="mt-1"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id={`negotiable-${listing._id}`}
                          checked={editForm.price?.negotiable || false}
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            price: { 
                              ...editForm.price!,
                              negotiable: e.target.checked
                            } 
                          })}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`negotiable-${listing._id}`} className="text-xs text-muted-foreground">
                          Negotiable
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Status *</label>
                      <Select 
                        value={editForm.status || listing.status || 'active'} 
                        onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Featured</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id={`featured-${listing._id}`}
                          checked={editForm.featured || listing.featured || false}
                          onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`featured-${listing._id}`} className="text-xs text-muted-foreground">
                          Mark as Featured
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">City *</label>
                      <Input
                        value={editForm.location?.city || listing.location?.city || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          location: { 
                            city: e.target.value,
                            state: editForm.location?.state || listing.location?.state || '',
                            country: editForm.location?.country || listing.location?.country || ''
                          } 
                        })}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">State</label>
                      <Input
                        value={editForm.location?.state || listing.location?.state || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          location: { 
                            city: editForm.location?.city || listing.location?.city || '',
                            state: e.target.value,
                            country: editForm.location?.country || listing.location?.country || ''
                          } 
                        })}
                        placeholder="State"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Country *</label>
                      <Input
                        value={editForm.location?.country || listing.location?.country || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          location: { 
                            city: editForm.location?.city || listing.location?.city || '',
                            state: editForm.location?.state || listing.location?.state || '',
                            country: e.target.value
                          } 
                        })}
                        placeholder="Country"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tags</label>
                    <Input
                      value={editForm.tags?.join(', ') || listing.tags?.join(', ') || ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      placeholder="Enter tags separated by commas (e.g., vintage, classic, rare)"
                      className="mt-1"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Current Images
                      {isImageLoading && (
                        <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          Processing...
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {listing.images && Array.isArray(listing.images) && listing.images.length > 0 ? (
                        listing.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url || '/placeholder.jpg'}
                              alt={image.alt || `Image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                console.error('❌ Image failed to load:', image)
                                e.currentTarget.src = '/placeholder.jpg'
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleRemoveImage(listing._id, index)}
                                disabled={isImageLoading}
                              >
                                {isImageLoading ? '...' : 'Remove'}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground col-span-full">No images uploaded</p>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-medium text-muted-foreground">Add New Images</label>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          console.log('📁 File input change:', e.target.files)
                          handleAddImages(listing._id, e.target.files)
                        }}
                        className="mt-1"
                        disabled={isImageLoading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can select multiple images. Supported formats: JPG, PNG, GIF
                        {isImageLoading && (
                          <span className="ml-2 text-blue-600">
                            ⏳ Uploading images...
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Images are uploaded using multer and stored as file paths in the database.
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Show Phone Number</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          id={`showPhone-${listing._id}`}
                          checked={editForm.showPhoneNumber || listing.showPhoneNumber || false}
                          onChange={(e) => setEditForm({ ...editForm, showPhoneNumber: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`showPhone-${listing._id}`} className="text-xs text-muted-foreground">
                          Display phone number to buyers
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Expires At</label>
                      <Input
                        type="date"
                        value={editForm.expiresAt || listing.expiresAt || ''}
                        onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {editingListing === listing._id ? (
                  <>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleUpdateListing(listing._id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-transparent"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-transparent"
                      onClick={() => handleStartEdit(listing)}
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
                  </>
                )}
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
