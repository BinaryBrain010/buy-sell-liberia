"use client"

import { useMemo } from "react"

interface UsePaginationProps {
  currentPage: number
  totalPages: number
  maxVisible: number
}

export function usePagination({ currentPage, totalPages, maxVisible }: UsePaginationProps) {
  return useMemo(() => {
    const pages: (number | string)[] = []

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      const end = Math.min(totalPages, start + maxVisible - 1)

      if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push("...")
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages, maxVisible])
}
