import { Suspense } from "react";
import BuySellLoader from "@/components/loader/BuySellLoader";

// Global route-level loading UI (Next.js app router). Automatically shown while layouts/pages load.
export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Suspense fallback={null}>
        <BuySellLoader label="Loading marketplace" />
        <div className="mt-6 text-center max-w-md text-sm text-muted-foreground leading-relaxed">
          Preparing content... If this takes long, please refresh or check your
          connection.
        </div>
      </Suspense>
    </div>
  );
}
