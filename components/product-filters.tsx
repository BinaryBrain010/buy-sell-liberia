"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Category {
  _id: string
  name: string
  slug: string
  subcategories: Array<{
    _id: string
    name: string
    slug: string
    customFields: Array<{
      _id: string
      fieldName: string
      fieldType: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'date'
      label: string
      required: boolean
      options?: string[]
      placeholder?: string
      validation?: {
        min?: number
        max?: number
        pattern?: string
      }
    }>
  }>
}

interface Filters {
  search: string
  category_id: string
  subcategory_id: string
  minPrice: string
  maxPrice: string
  city: string
  state: string
  sortBy: string
  sortOrder: string
  [key: string]: string
}

interface ProductFiltersProps {
  filters: Filters
  categories: Category[]
  onFiltersChange: (newFilters: Partial<Filters>) => void
  onClearFilters: () => void
}

export function ProductFilters({ 
  filters, 
  categories, 
  onFiltersChange, 
  onClearFilters 
}: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    category: true,
    price: true,
    location: true,
    custom: true
  })

  // Update selected category when filters change
  useEffect(() => {
    if (filters.category_id) {
      const category = categories.find(c => c._id === filters.category_id)
      setSelectedCategory(category || null)
      
      if (category && filters.subcategory_id) {
        const subcategory = category.subcategories.find(s => s._id === filters.subcategory_id)
        setSelectedSubcategory(subcategory || null)
      } else {
        setSelectedSubcategory(null)
      }
    } else {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
    }
  }, [filters.category_id, filters.subcategory_id, categories])

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
    
    onFiltersChange({
      category_id: categoryId,
      subcategory_id: ''
    })
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    if (!selectedCategory) return
    
    const subcategory = selectedCategory.subcategories.find(s => s._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
    
    onFiltersChange({
      subcategory_id: subcategoryId
    })
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      value && value !== '' && key !== 'sortBy' && key !== 'sortOrder'
    ).length
  }

  const getCustomFieldValue = (fieldName: string) => {
    return filters[`cf_${fieldName}`] || ''
  }

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    onFiltersChange({
      [`cf_${fieldName}`]: value
    })
  }

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="font-medium">Category</span>
            {openSections.category ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category_id} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={filters.subcategory_id} onValueChange={handleSubcategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <SelectItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Filter */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="font-medium">Price Range</span>
            {openSections.price ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => onFiltersChange({ minPrice: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ maxPrice: e.target.value })}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Location Filter */}
      <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="font-medium">Location</span>
            {openSections.location ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter city"
              value={filters.city}
              onChange={(e) => onFiltersChange({ city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="state">State/County</Label>
            <Input
              id="state"
              placeholder="Enter state or county"
              value={filters.state}
              onChange={(e) => onFiltersChange({ state: e.target.value })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Custom Fields Filter */}
      {selectedSubcategory && selectedSubcategory.customFields && selectedSubcategory.customFields.length > 0 && (
        <>
          <Separator />
          <Collapsible open={openSections.custom} onOpenChange={() => toggleSection('custom')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="font-medium">Product Details</span>
                {openSections.custom ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {selectedSubcategory.customFields.map((field) => (
                <div key={field._id}>
                  <Label htmlFor={field.fieldName}>{field.label}</Label>
                  {field.fieldType === 'select' && field.options ? (
                    <Select 
                      value={getCustomFieldValue(field.fieldName)} 
                      onValueChange={(value) => handleCustomFieldChange(field.fieldName, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.fieldType === 'number' ? (
                    <Input
                      id={field.fieldName}
                      type="number"
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={getCustomFieldValue(field.fieldName)}
                      onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.fieldName}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={getCustomFieldValue(field.fieldName)}
                      onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '') return null
                if (key === 'sortBy' || key === 'sortOrder') return null
                
                let label = key
                let displayValue = value
                
                // Custom field labels
                if (key.startsWith('cf_')) {
                  const fieldName = key.substring(3)
                  const customField = selectedSubcategory?.customFields?.find(
                    (f: any) => f.fieldName === fieldName
                  )
                  label = customField?.label || fieldName
                } else if (key === 'category_id') {
                  label = 'Category'
                  displayValue = selectedCategory?.name || value
                } else if (key === 'subcategory_id') {
                  label = 'Subcategory'
                  displayValue = selectedSubcategory?.name || value
                } else if (key === 'minPrice') {
                  label = 'Min Price'
                  displayValue = `$${value}`
                } else if (key === 'maxPrice') {
                  label = 'Max Price'
                  displayValue = `$${value}`
                }
                
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    <span className="text-xs">
                      {label}: {displayValue}
                    </span>
                    <button
                      onClick={() => onFiltersChange({ [key]: '' })}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
