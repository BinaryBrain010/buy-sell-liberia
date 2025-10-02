"use client";

import BuySellLoader from "@/components/loader/BuySellLoader";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <BuySellLoader label="Loading products" />
      <p className="mt-6 text-xs text-muted-foreground tracking-wide uppercase">
        Fetching latest listings...
      </p>
    </div>
  );
}
