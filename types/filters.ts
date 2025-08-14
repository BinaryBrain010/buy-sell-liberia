export interface FilterState {
  category?: string
  subcategory?: string
  location?: string
  priceMin?: number
  priceMax?: number
  timeFilter?: string
  sortBy?: string
  sortOrder?: string
  customFilters?: Record<string, any>
}
