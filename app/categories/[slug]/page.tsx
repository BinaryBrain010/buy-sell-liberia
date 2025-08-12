"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { ProductCard, type Product } from "@/components/product-card"
import Image from "next/image"

// Color mappings for categories
const categoryColors: { [key: string]: string } = {
  electronics: "from-blue-500 to-cyan-500",
  vehicles: "from-green-500 to-emerald-500",
  "real-estate": "from-purple-500 to-pink-500",
  "home-furniture": "from-amber-500 to-orange-500",
  "fashion-beauty": "from-orange-500 to-red-500",
  "babies-kids": "from-pink-500 to-rose-500",
  "tools-equipment": "from-gray-500 to-slate-500",
  services: "from-indigo-500 to-purple-500",
  jobs: "from-emerald-500 to-teal-500",
  "sports-outdoors": "from-red-500 to-pink-500",
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const subcategorySlug = searchParams?.get("subcategory")

  const [currentCategory, setCurrentCategory] = useState<any>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const itemsPerPage = 20

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  const handleLike = (productId: string) => {
    // Placeholder for like functionality
    console.log(`Product ${productId} liked`)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  const getPaginationNumbers = () => {
    const paginationNumbers: (number | string)[] = []
    const maxPagesToShow = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    for (let i = startPage; i <= endPage; i++) {
      paginationNumbers.push(i)
    }

    if (startPage > 1) {
      paginationNumbers.unshift("...")
    }

    if (endPage < totalPages) {
      paginationNumbers.push("...")
    }

    return paginationNumbers
  }

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories?slug=${slug}`)
        if (!res.ok) throw new Error("Failed to fetch category")
        const data = await res.json()
        const category = data.categories?.find((cat: any) => cat.slug === slug)
        setCurrentCategory(category)

        // Find subcategory if specified in URL
        if (subcategorySlug && category?.subcategories) {
          const subcategory = category.subcategories.find((sub: any) => sub.slug === subcategorySlug)
          setSelectedSubcategory(subcategory)
        }
      } catch (error) {
        console.error("Error fetching category:", error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategory()
    }
  }, [slug, subcategorySlug])

  // Fetch products for this category/subcategory
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentCategory?._id) return

      setLoadingProducts(true)
      try {
        let url = `/api/products?category_id=${encodeURIComponent(currentCategory._id)}&limit=${itemsPerPage}&page=${currentPage}&search=${encodeURIComponent(searchQuery)}`

        // Add subcategory filter if selected
        if (selectedSubcategory?._id) {
          url += `&subcategory_id=${encodeURIComponent(selectedSubcategory._id)}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setProducts(data.products || [])
        setTotalProducts(data.total || 0)
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [currentCategory?._id, selectedSubcategory?._id, currentPage, searchQuery])

  // Add function to handle subcategory selection
  const handleSubcategorySelect = (subcategory: any) => {
    setSelectedSubcategory(subcategory)
    setCurrentPage(1)
    // Update URL without page reload
    const newUrl = subcategory ? `/categories/${slug}?subcategory=${subcategory.slug}` : `/categories/${slug}`
    window.history.pushState({}, "", newUrl)
  }

  // Update the category header section to show subcategory selection
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{currentCategory?.name}</span>
          {selectedSubcategory && (
            <>
              <span>/</span>
              <span className="text-foreground font-medium">{selectedSubcategory.name}</span>
            </>
          )}
        </nav>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-background to-muted/30 rounded-2xl p-8 mb-8 border border-border/50 card-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${
                  categoryColors[currentCategory?.slug] || "from-gray-500 to-gray-600"
                } flex items-center justify-center text-4xl shadow-lg text-white`}
              >
                {selectedSubcategory?.icon || currentCategory?.icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {selectedSubcategory ? selectedSubcategory.name : currentCategory?.name}
                </h1>
                <p className="text-muted-foreground text-lg">{totalProducts} products available</p>

                {/* Subcategory Selection */}
                {currentCategory?.subcategories?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-3">Filter by subcategory:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={!selectedSubcategory ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSubcategorySelect(null)}
                        className="text-xs h-8"
                      >
                        All {currentCategory.name}
                      </Button>
                      {currentCategory.subcategories.map((sub: any) => (
                        <Button
                          key={sub._id}
                          variant={selectedSubcategory?._id === sub._id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSubcategorySelect(sub)}
                          className="text-xs h-8 pl-1 pr-3 flex items-center gap-2"
                        >
                          {/* Small subcategory image */}
                          <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                sub.image?.url ||
                                `/placeholder.svg?height=20&width=20&text=${encodeURIComponent(sub.name.charAt(0))}`
                              }
                              alt={sub.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `/placeholder.svg?height=20&width=20&text=${encodeURIComponent(sub.name.charAt(0))}`
                              }}
                            />
                          </div>
                          {sub.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Link href="/categories">
              <Button variant="outline" className="btn-shadow bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Rest of the component remains the same... */}
        {/* Search and Filters section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background/50 rounded-xl p-6 border border-border/50 card-shadow mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search in ${selectedSubcategory?.name || currentCategory?.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-shadow"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 input-shadow">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Button */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="btn-shadow">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-border/50"
            >
              <div className="space-y-4">
                {/* Condition Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <div className="flex flex-wrap gap-2">
                    {["Brand New", "Like New", "Good", "Fair", "Poor"].map((condition) => (
                      <Button key={condition} variant="outline" size="sm" className="btn-shadow bg-transparent">
                        {condition}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Price</label>
                    <Input placeholder="$0" className="input-shadow" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                    <Input placeholder="$10,000" className="input-shadow" />
                  </div>
                </div>

                {/* Apply Filters Button */}
                <div className="flex justify-end">
                  <Button className="btn-shadow">Apply Filters</Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Products Grid/List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {loadingProducts ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">{selectedSubcategory?.icon || currentCategory?.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : `Be the first to list a product in ${selectedSubcategory?.name || currentCategory?.name}.`}
              </p>
              <div className="space-x-4">
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
                <Link href="/sell">
                  <Button>List Your Product</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    <Link href={`/products/${product._id}`} passHref>
                      <ProductCard product={product} onLike={handleLike} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loadingProducts}
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
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => (typeof page === "number" ? handlePageChange(page) : null)}
                          disabled={page === "..." || loadingProducts}
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
                      disabled={currentPage === totalPages || loadingProducts}
                      className="flex items-center space-x-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
