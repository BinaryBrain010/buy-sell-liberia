"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductService } from "@/app/services/Product.Service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Cache the in-flight fetch to avoid duplicate requests in React Strict Mode (dev)
let featuredProductsPromise: Promise<{ products?: any[] }> | null = null;

const fetchFeaturedProducts = (svc: ProductService) => {
  if (!featuredProductsPromise) {
    featuredProductsPromise = svc
      .getFeaturedProducts({ page: 1, limit: 10 }, { featured: -1 })
      .catch((err) => {
        // Reset cache on failure to allow retries
        featuredProductsPromise = null;
        throw err;
      });
  }
  return featuredProductsPromise;
};

export function FeaturedListings() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canHover, setCanHover] = useState(false);
  const router = useRouter();
  const productService = new ProductService();
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );

  // Simple media query hook for responsiveness
  function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const mql = window.matchMedia(query);
      const onChange = () => setMatches(mql.matches);
      onChange();
      mql.addEventListener?.("change", onChange);
      return () => mql.removeEventListener?.("change", onChange);
    }, [query]);
    return matches;
  }

  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  const slidesToScroll = isLg ? 4 : isMd ? 3 : isSm ? 2 : 1;
  const skeletonCount = isLg ? 10 : isMd ? 8 : isSm ? 6 : 4;

  useEffect(() => {
    setCanHover(
      typeof window !== "undefined" &&
        window.matchMedia("(hover: hover)").matches
    );
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await fetchFeaturedProducts(productService);
        setProducts(data.products ?? []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Fetch platform currency once to pass to cards
  useEffect(() => {
    let cancelled = false;
    const getCurrency = async () => {
      try {
        const res = await fetch("/api/admin/settings/currency", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (
          !cancelled &&
          (data?.currency === "USD" || data?.currency === "LRD")
        ) {
          setPlatformCurrency(data.currency);
        }
      } catch {}
    };
    getCurrency();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Featured Listings
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Discover the best deals available
          </p>
        </motion.div>

        {loading ? (
          <FeaturedCarouselSkeleton
            count={skeletonCount}
            slidesToScroll={slidesToScroll}
          />
        ) : products.length === 0 ? (
          <div className="text-center py-16 md:py-20 text-base md:text-lg text-muted-foreground">
            Sorry, there are no featured products at the moment.
          </div>
        ) : (
          <Carousel
            className="w-full overflow-x-clip"
            opts={{ align: "start", loop: true, slidesToScroll }}
          >
            <CarouselContent>
              {products.map((product: any, index: number) => (
                <CarouselItem
                  key={product._id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    whileHover={canHover ? { scale: 1.02 } : undefined}
                    className="cursor-pointer h-full"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <ProductCard
                      product={product}
                      variant="compact"
                      platformCurrency={platformCurrency}
                      onLike={(productId) =>
                        console.log("Liked product:", productId)
                      }
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="glass border-0 bg-transparent"
            onClick={() => router.push("/products")}
            aria-label="View all product listings"
          >
            View All Listings
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedCarouselSkeleton({
  count = 8,
  slidesToScroll = 1,
}: {
  count?: number;
  slidesToScroll?: number;
}) {
  return (
    <Carousel
      className="w-full overflow-x-clip"
      opts={{ align: "start", loop: true, slidesToScroll }}
    >
      <CarouselContent>
        {Array.from({ length: count }).map((_, idx) => (
          <CarouselItem
            key={idx}
            className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <Card className="border-0">
              <CardContent className="p-4">
                <Skeleton className="h-40 sm:h-44 md:h-48 lg:h-56 w-full mb-4 rounded-lg" />
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
