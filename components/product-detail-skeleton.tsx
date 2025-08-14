import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <Skeleton className="aspect-square w-full rounded-xl" />

          {/* Thumbnails */}
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="w-20 h-20 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-10 w-1/2 mb-4" />
          </div>

          {/* Meta Information */}
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Seller */}
          <div className="border-t pt-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
