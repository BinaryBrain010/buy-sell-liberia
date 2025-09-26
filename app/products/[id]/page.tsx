"use client";

import { useEffect, useState, useRef } from "react";
import { ProductService } from "@/app/services/Product.Service";
import { useParams } from "next/navigation";
import ProductDetail from "./ProductDetail";
import { ProductDetailSkeleton } from "@/components/product-detail-skeleton";
import { FeaturedListings } from "@/components/featured-listings";
import { FadeIn } from "@/components/static-pages/Animated";

export default function ProductDetailPage() {
  const params = useParams();
  const _id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasIncrementedView = useRef(false);
  useEffect(() => {
    async function fetchProductAndIncrementView() {
      setLoading(true);
      setError("");
      try {
        // Increment view count only once per mount
        if (_id && !hasIncrementedView.current) {
          hasIncrementedView.current = true;
          const productService = new ProductService();
          productService.incrementProductViews(_id as string);
        }
        // Fetch product details
        const res = await fetch(`/api/products/${_id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();

        if (data && typeof data.product === "object" && data.product !== null) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    }

    if (_id) fetchProductAndIncrementView();
  }, [_id]);

  if (!_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Invalid Product
            </h2>
            <p className="text-muted-foreground">
              No product ID found in route.
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (loading)
    return (
      <FadeIn>
        <ProductDetailSkeleton />
      </FadeIn>
    );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </FadeIn>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground">
              The product you're looking for doesn't exist.
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <FadeIn>
        <ProductDetail {...product} />
      </FadeIn>

      <div className="border-t bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <FadeIn>
            <FeaturedListings />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
