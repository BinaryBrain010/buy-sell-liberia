"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Variant = "grid" | "list";

interface ProductListSkeletonProps {
  variant?: Variant;
  count?: number;
}

function ProductCardSkeleton({ variant = "grid" }: { variant?: Variant }) {
  if (variant === "list") {
    return (
      <Card className="border-0">
        <CardContent className="p-4 md:p-5 flex gap-4 md:gap-6 items-start">
          {/* Thumbnail */}
          <div className="relative shrink-0">
            <Skeleton className="h-28 w-28 md:h-40 md:w-40 rounded-md" />
          </div>
          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-2 mb-3 flex items-center gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid/compact card
  return (
    <Card className="border-0">
      <CardContent className="p-4">
        <Skeleton className="h-48 w-full mb-4 rounded-lg" />
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex items-center gap-3 text-xs mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductListSkeleton({
  variant = "grid",
  count = 12,
}: ProductListSkeletonProps) {
  const items = Array.from({ length: count });
  return (
    <div
      className={
        variant === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
      }
    >
      {items.map((_, idx) => (
        <ProductCardSkeleton key={idx} variant={variant} />
      ))}
    </div>
  );
}
