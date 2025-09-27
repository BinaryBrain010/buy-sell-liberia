"use client";

import { useState, useEffect } from "react";
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
import { 
  Package, 
  Plus, 
  Search, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";
import Link from "next/link";

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
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Featured Listings
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Handpicked deals from trusted sellers - discover quality products at unbeatable prices
          </p>
        </div>

        {loading ? (
          <FeaturedCarouselSkeleton
            count={skeletonCount}
            slidesToScroll={slidesToScroll}
          />
        ) : products.length === 0 ? (
          <FeaturedListingsEmptyState />
        ) : (
          <div>
            <Carousel
              className="w-full overflow-x-clip"
              opts={{ align: "start", loop: true, slidesToScroll }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products.map((product: any, index: number) => (
                  <CarouselItem
                    key={product._id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div
                      className={`cursor-pointer h-full group transition-all duration-300 ${
                        canHover ? "hover:scale-105 hover:-translate-y-2" : ""
                      }`}
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/30">
                        <ProductCard
                          product={product}
                          variant="compact"
                          platformCurrency={platformCurrency}
                          onLike={(productId) =>
                            console.log("Liked product:", productId)
                          }
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-4 bg-background/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" />
              <CarouselNext className="hidden sm:flex -right-4 bg-background/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300" />
            </Carousel>
          </div>
        )}

        <div className="text-center mt-12 md:mt-16">
          <div className="hover:scale-105 transition-transform">
            <Button
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-primary/5 to-v0-green/5 border-2 border-primary/20 text-foreground hover:from-primary/10 hover:to-v0-green/10 hover:border-primary/40 transition-all duration-300 rounded-xl px-8 py-3 font-semibold backdrop-blur-sm"
              onClick={() => router.push("/products")}
              aria-label="View all product listings"
            >
              View All Listings
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedListingsEmptyState() {
  const router = useRouter();

  const quickActions = [
    {
      icon: Plus,
      title: "Be the First Seller",
      description: "List your items and become a featured seller",
      action: () => router.push("/sell"),
      color: "from-primary to-v0-dark-blue",
    },
    {
      icon: Search,
      title: "Browse All Products",
      description: "Explore all available listings",
      action: () => router.push("/products"),
      color: "from-v0-green to-v0-orange",
    },
    {
      icon: TrendingUp,
      title: "Check Categories",
      description: "See what categories are available",
      action: () => router.push("/categories"),
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="text-center py-16 md:py-20">
      {/* Main Empty State */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-v0-green/20 flex items-center justify-center mb-6">
            <Package className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-v0-orange to-primary flex items-center justify-center animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
          No Featured Listings Yet
        </h3>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          We're just getting started! Be among the first to showcase your products as featured listings on Liberia's newest marketplace.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              className="group hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              onClick={action.action}
            >
              <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/sell" passHref>
            <div className="hover:scale-105 transition-transform">
              <Button
                size="lg"
                className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Selling Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Link>
          
          <Link href="/products" passHref>
            <div className="hover:scale-105 transition-transform">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-base font-semibold border-2 border-primary/20 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-primary/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
              >
                <Search className="w-5 h-5 mr-2" />
                Browse All Products
              </Button>
            </div>
          </Link>
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <Star className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Be a pioneer in Liberia's marketplace revolution!
          </span>
        </div>
      </div>
    </div>
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
