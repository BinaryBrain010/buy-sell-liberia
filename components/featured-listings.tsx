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
  const router = useRouter();
  const productService = new ProductService();

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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Listings
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover the best deals available
          </p>
        </motion.div>

        {loading ? (
          <FeaturedCarouselSkeleton count={10} />
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-lg text-muted-foreground">
            Sorry, there are no featured products at the moment.
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {products.map((product: any, index: number) => (
                <CarouselItem
                  key={product._id}
                  className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <ProductCard
                      product={product}
                      variant="compact"
                      onLike={(productId) =>
                        console.log("Liked product:", productId)
                      }
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="glass border-0 bg-transparent"
            onClick={() => router.push("/products")}
          >
            View All Listings
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {Array.from({ length: count }).map((_, idx) => (
          <CarouselItem
            key={idx}
            className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
