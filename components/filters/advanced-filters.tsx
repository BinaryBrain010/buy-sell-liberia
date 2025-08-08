"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Clock, 
  Tag,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react"
import { Category, Subcategory } from "@/hooks/useCategories"

export interface FilterState {
  category?: string
  subcategory?: string
  location?: string
  priceMin?: number
  priceMax?: number
  timeFilter?: string
  customFilters?: { [key: string]: any }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  categories: Category[]
  currentFilters: FilterState
  onFiltersChange: (filters: FilterState) => void
  totalResults?: number
  isLoading?: boolean
  className?: string
}

export function AdvancedFilters({
  categories,
  currentFilters,
  onFiltersChange,
  totalResults = 0,
  isLoading = false,
  className = ""
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters)
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  // Time filter options
  const timeFilterOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' }
  ]

  // Sort options
  const sortOptions = [
    { value: 'created_at', label: 'Date: Newest first', order: 'desc' },
    { value: 'created_at', label: 'Date: Oldest first', order: 'asc' },
    { value: 'price.amount', label: 'Price: Low to high', order: 'asc' },
    { value: 'price.amount', label: 'Price: High to low', order: 'desc' },
    { value: 'title', label: 'Name: A to Z', order: 'asc' },
    { value: 'views', label: 'Most viewed', order: 'desc' }
  ]

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(currentFilters)
    if (currentFilters.priceMin !== undefined || currentFilters.priceMax !== undefined) {
      setPriceRange([
        currentFilters.priceMin || 0,
        currentFilters.priceMax || 10000000
      ])
    }
  }, [currentFilters])

  // Update selected category and subcategory
  useEffect(() => {
    if (localFilters.category) {
      const category = categories.find(cat => cat._id === localFilters.category)
      setSelectedCategory(category || null)
      
      if (localFilters.subcategory && category) {
        const subcategory = category.subcategories.find(sub => sub._id === localFilters.subcategory)
        setSelectedSubcategory(subcategory || null)
      } else {
        setSelectedSubcategory(null)
      }
    } else {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    }
  }, [localFilters.category, localFilters.subcategory, categories])

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    
    // Clear subcategory if category changes
    if (key === 'category') {
      newFilters.subcategory = undefined
      newFilters.customFilters = {}
    }
    
    // Clear custom filters if subcategory changes
    if (key === 'subcategory') {
      newFilters.customFilters = {}
    }
    
    setLocalFilters(newFilters)
  }

  const updateCustomFilter = (fieldName: string, value: any) => {
    const newCustomFilters = {
      ...localFilters.customFilters,
      [fieldName]: value
    }
    setLocalFilters({
      ...localFilters,
      customFilters: newCustomFilters
    })
  }

  const applyFilters = () => {
    const filtersToApply = {
      ...localFilters,
      priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
      priceMax: priceRange[1] < 10000000 ? priceRange[1] : undefined
    }
    onFiltersChange(filtersToApply)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {}
    setLocalFilters(clearedFilters)
    setPriceRange([0, 10000000])
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.category) count++
    if (localFilters.subcategory) count++
    if (localFilters.location) count++
    if (localFilters.priceMin || localFilters.priceMax) count++
    if (localFilters.timeFilter && localFilters.timeFilter !== 'any') count++
    if (localFilters.customFilters) {
      count += Object.values(localFilters.customFilters).filter(v => v && v !== 'any').length
    }
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className={`glass border-0 ${className}`}>
      <CardContent className="p-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {totalResults > 0 && (
              <span className="text-sm text-muted-foreground">
                {totalResults.toLocaleString()} results
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Filters (Always Visible) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* Category */}
          <div>
            <Label className="text-xs mb-1 block">Category</Label>
            <Select
              value={localFilters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label className="text-xs mb-1 block">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City, State"
                value={localFilters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value || undefined)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <Label className="text-xs mb-1 block">Posted</Label>
            <Select
              value={localFilters.timeFilter || 'any'}
              onValueChange={(value) => updateFilter('timeFilter', value === 'any' ? undefined : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                {timeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <Label className="text-xs mb-1 block">Sort by</Label>
            <Select
              value={`${localFilters.sortBy || 'created_at'}_${localFilters.sortOrder || 'desc'}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('_')
                updateFilter('sortBy', sortBy)
                updateFilter('sortOrder', sortOrder as 'asc' | 'desc')
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option, index) => (
                  <SelectItem key={index} value={`${option.value}_${option.order}`}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-4 space-y-4">
                {/* Subcategory */}
                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <Label className="text-sm mb-2 block">Subcategory</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {selectedCategory.subcategories.map((subcategory) => (
                        <div key={subcategory._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subcategory._id}
                            checked={localFilters.subcategory === subcategory._id}
                            onCheckedChange={(checked) => {
                              updateFilter('subcategory', checked ? subcategory._id : undefined)
                            }}
                          />
                          <Label htmlFor={subcategory._id} className="text-sm font-normal">
                            {subcategory.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <Label className="text-sm mb-2 block items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price Range
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      step={5000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
                          }}
                          className="w-24 h-8 text-xs"
                          placeholder="Min"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 10000000
                            setPriceRange([priceRange[0], Math.max(value, priceRange[0])])
                          }}
                          className="w-24 h-8 text-xs"
                          placeholder="Max"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rs. {priceRange[0].toLocaleString()} - Rs. {priceRange[1].toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                {selectedSubcategory && selectedSubcategory.customFields.length > 0 && (
                  <div>
                    <Label className="text-sm mb-2 block items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Specifications
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSubcategory.customFields.map((field) => (
                        <div key={field.fieldName}>
                          <Label className="text-xs mb-1 block">{field.label}</Label>
                          {field.fieldType === 'select' && field.options ? (
                            <Select
                              value={localFilters.customFilters?.[field.fieldName] || 'any'}
                              onValueChange={(value) => updateCustomFilter(field.fieldName, value === 'any' ? undefined : value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder={`Any ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">Any {field.label.toLowerCase()}</SelectItem>
                                {field.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field.fieldType === 'boolean' ? (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={field.fieldName}
                                checked={localFilters.customFilters?.[field.fieldName] || false}
                                onCheckedChange={(checked) => updateCustomFilter(field.fieldName, checked)}
                              />
                              <Label htmlFor={field.fieldName} className="text-sm">
                                {field.label}
                              </Label>
                            </div>
                          ) : (
                            <Input
                              placeholder={field.placeholder || field.label}
                              value={localFilters.customFilters?.[field.fieldName] || ''}
                              onChange={(e) => updateCustomFilter(field.fieldName, e.target.value || undefined)}
                              className="h-9"
                              type={field.fieldType === 'number' ? 'number' : 'text'}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear</span>
          </Button>
          
          <Button
            onClick={applyFilters}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>{isLoading ? 'Applying...' : 'Apply Filters'}</span>
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {localFilters.category && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{categories.find(c => c._id === localFilters.category)?.name}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('category', undefined)}
                  />
                </Badge>
              )}
              {localFilters.location && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{localFilters.location}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('location', undefined)}
                  />
                </Badge>
              )}
              {localFilters.timeFilter && localFilters.timeFilter !== 'any' && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>{timeFilterOptions.find(o => o.value === localFilters.timeFilter)?.label}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('timeFilter', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
