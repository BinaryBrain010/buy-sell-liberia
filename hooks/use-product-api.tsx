"use client"

import { useState, useCallback } from "react"
import axios from "axios"
import type { FilterState } from "@/types/filters"

interface FetchProductsParams {
  filters: FilterState
  page: number
  search: string
  itemsPerPage: number
}

export function useProductsApi() {
  const [products, setProducts] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildApiParams = useCallback((params: FetchProductsParams) => {
    const urlParams = new URLSearchParams()

    urlParams.append("limit", params.itemsPerPage.toString())
    urlParams.append("page", params.page.toString())

    // Category & Subcategory
    if (params.filters.category) urlParams.append("category", params.filters.category)
    if (params.filters.subcategory) urlParams.append("subCategory", params.filters.subcategory)

    // Location
    if (params.filters.location) urlParams.append("location", params.filters.location)

    // Price
    if (params.filters.priceMin !== undefined) urlParams.append("priceMin", params.filters.priceMin.toString())
    if (params.filters.priceMax !== undefined) urlParams.append("priceMax", params.filters.priceMax.toString())

    // Time filter
    if (params.filters.timeFilter) urlParams.append("timeFilter", params.filters.timeFilter)

    // Sort
    if (params.filters.sortBy) urlParams.append("sortBy", params.filters.sortBy)
    if (params.filters.sortOrder) urlParams.append("sortOrder", params.filters.sortOrder)

    // Custom filters
    if (params.filters.customFilters) {
      Object.entries(params.filters.customFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "any") {
          urlParams.append(`cf_${key}`, value.toString())
        }
      })
    }

    // Search query
    if (params.search) {
      urlParams.append("search", params.search)
    }

    return urlParams
  }, [])

  const fetchProducts = useCallback(
    async (params: FetchProductsParams) => {
      const isSearch = Boolean(params.search)

      if (isSearch) setIsSearching(true)
      setIsLoading(true)
      setError(null)

      try {
        const urlParams = buildApiParams(params)
        const response = await axios.get(`/api/products?${urlParams.toString()}`)

        const productsData = response.data.products || []
        const totalItems = response.data.totalItems || productsData.length || 0

        setProducts(productsData)
        setTotalResults(totalItems)
        setTotalPages(Math.ceil(totalItems / params.itemsPerPage))
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again.")
        setProducts([])
        setTotalResults(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
        setIsSearching(false)
      }
    },
    [buildApiParams],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    products,
    totalResults,
    totalPages,
    isLoading,
    isSearching,
    error,
    fetchProducts,
    clearError,
  }
}
