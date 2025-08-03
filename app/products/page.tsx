"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Grid, List, Filter, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { AdvancedFilters, FilterState } from "@/components/filters/advanced-filters"
import { ProductCard } from "@/components/product-card"
import axios from "axios"

interface Product {
  _id: string
  title: string
  description: string
  price: {
    amount: number
    currency: string
    negotiable: boolean
  }
  location: {
    city: string
    state?: string
    country: string
  }
  images: {
    url: string
    alt?: string
    isPrimary: boolean
    order: number
  }[]
  customFields: {
    fieldName: string
    value: any
  }[]
  status: string
  created_at: string
  expires_at: string
  slug: string
  user_id: {
    firstName: string
    lastName: string
    profile?: {
      displayName?: string
      avatar?: string
    }
  }
  views: number
  featured: boolean
}

export default function ProductsPage() {
  const { categories, loading: categoriesLoading } = useCategories()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>({})
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  
  const itemsPerPage = 30 // Show 30 products per page (10 rows × 3 columns)

  // Fetch products based on filters
  const fetchProducts = async (filtersToApply: FilterState, page = 1) => {
    try {
      setProductsLoading(true)
      
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (filtersToApply.category) params.append('category', filtersToApply.category)
      if (filtersToApply.subcategory) params.append('subcategory', filtersToApply.subcategory)
      if (filtersToApply.location) params.append('location', filtersToApply.location)
      if (filtersToApply.priceMin) params.append('priceMin', filtersToApply.priceMin.toString())
      if (filtersToApply.priceMax) params.append('priceMax', filtersToApply.priceMax.toString())
      if (filtersToApply.timeFilter && filtersToApply.timeFilter !== 'any') params.append('timeFilter', filtersToApply.timeFilter)
      if (filtersToApply.sortBy) params.append('sortBy', filtersToApply.sortBy)
      if (filtersToApply.sortOrder) params.append('sortOrder', filtersToApply.sortOrder)
      params.append('page', page.toString())
      params.append('limit', itemsPerPage.toString())
      
      // Add custom filters
      if (filtersToApply.customFilters) {
        Object.entries(filtersToApply.customFilters).forEach(([key, value]) => {
          if (value && value !== 'any') params.append(`filter_${key}`, value.toString())
        })
      }

      const response = await axios.get(`/api/products?${params.toString()}`)
      
      setProducts(response.data.products || [])
      setTotalResults(response.data.pagination?.totalItems || 0)
      setTotalPages(Math.ceil((response.data.pagination?.totalItems || 0) / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
      setTotalResults(0)
      setTotalPages(0)
    } finally {
      setProductsLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    fetchProducts(newFilters, 1)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts(filters, 1)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts(filters, page)
    // Scroll to top of products section
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      const end = Math.min(totalPages, start + maxVisible - 1)
      
      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Initial load and mount check
  useEffect(() => {
    setIsMounted(true)
    fetchProducts({})
  }, [])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
          <p className="text-xl text-muted-foreground">Discover amazing products from our marketplace</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products, brands, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-20 h-12 text-lg glass border-0"
            />
            <Button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
              disabled={productsLoading}
            >
              {productsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </div>

        {/* Filters Section - Full Width */}
        <div className="mb-8">
          {/* Filters Toggle (Mobile) */}
          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center space-x-2 glass border-0"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {showFilters && <X className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Filters Content */}
          {isMounted && (
            <div className={`${showFilters ? 'block' : 'hidden lg:block'} mb-8`}>
              <Card className="glass border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4 lg:hidden">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <AdvancedFilters
                    categories={categories}
                    currentFilters={filters}
                    onFiltersChange={handleFiltersChange}
                    totalResults={totalResults}
                    isLoading={productsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Fallback for SSR */}
          {!isMounted && (
            <div className="hidden lg:block mb-8">
              <Card className="glass border-0">
                <CardContent className="p-6">
                  <AdvancedFilters
                    categories={categories}
                    currentFilters={filters}
                    onFiltersChange={handleFiltersChange}
                    totalResults={totalResults}
                    isLoading={productsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div id="products-section">
          {/* View Mode Toggle & Results Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              {totalResults > 0 && (
                <p className="text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults.toLocaleString()} products
                  {totalPages > 1 && (
                    <span className="ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {productsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`grid gap-6 mb-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product:any, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === 'grid' ? 'compact' : 'default'}
                      onLike={(productId) => {
                        // TODO: Implement like functionality
                        console.log('Liked product:', productId)
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || productsLoading}
                      className="flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPaginationNumbers().map((page, index) => (
                        <Button
                          key={index}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                          disabled={page === '...' || productsLoading}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || productsLoading}
                      className="flex items-center space-x-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Jump to page input (for large datasets) */}
                  {totalPages > 10 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Go to:</span>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder="Page"
                        className="w-20 h-8 text-center"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const page = parseInt((e.target as HTMLInputElement).value)
                            if (page >= 1 && page <= totalPages) {
                              handlePageChange(page)
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Card className="glass border-0 max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button 
                    onClick={() => {
                      setFilters({})
                      setSearchQuery('')
                      setCurrentPage(1)
                      fetchProducts({})
                    }}
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}