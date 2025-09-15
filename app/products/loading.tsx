"use client";

import ProductListSkeleton from "@/components/ProductListSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="mb-6">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse mb-2" />
          <div className="h-4 w-80 rounded-md bg-muted animate-pulse" />
        </div>
        <ProductListSkeleton variant="grid" count={12} />
      </div>
    </div>
  );
}
