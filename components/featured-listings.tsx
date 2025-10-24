"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { clearStoredTokens, getLocalAuthStatus } from "@/lib/jwt";
import { ProductCard } from "@/components/product-card";
import { ProductService } from "@/app/services/Product.Service";
import {
  type CarouselApi,
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
  Star,
} from "lucide-react";
import Link from "next/link";

let featuredProductsPromise: Promise<{ products?: any[] }> | null = null;

const fetchFeaturedProducts = (svc: ProductService) => {
  if (!featuredProductsPromise) {
    featuredProductsPromise = svc
      .getFeaturedProducts({ page: 1, limit: 10 }, { featured: -1 })
      .catch((err) => {
        featuredProductsPromise = null;
        throw err;
      });
  }
  return featuredProductsPromise;
};

export function FeaturedListings() {
  const router = useRouter();
  const productService = new ProductService();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [slidesToScroll, setSlidesToScroll] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Track dragging to prevent accidental clicks during swipe on mobile
  useEffect(() => {
    if (!carouselApi) return;
    let dragging = false;
    const onPointerDown = () => {
      dragging = false;
    };
    const onScroll = () => {
      dragging = true;
    };
    const onPointerUp = () => {
      setIsDragging(dragging);
      // Reset on next tick so regular taps still work
      setTimeout(() => setIsDragging(false), 0);
    };

    carouselApi.on("pointerDown", onPointerDown);
    carouselApi.on("scroll", onScroll);
    carouselApi.on("pointerUp", onPointerUp);
    return () => {
      carouselApi.off("pointerDown", onPointerDown);
      carouselApi.off("scroll", onScroll);
      carouselApi.off("pointerUp", onPointerUp);
    };
  }, [carouselApi]);

  // Responsive slidesToScroll based on viewport width
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesToScroll(1); // mobile
      else if (w < 1024) setSlidesToScroll(2); // tablet
      else if (w < 1280) setSlidesToScroll(3); // small laptop
      else setSlidesToScroll(4); // large screens
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Track canScrollPrev/Next for edge fade indicators
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCanPrev(carouselApi.canScrollPrev());
      setCanNext(carouselApi.canScrollNext());
    };
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  // auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { isLoggedIn } = getLocalAuthStatus();
    setIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) clearStoredTokens();
  }, []);

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchFeaturedProducts(productService);
        if (!mounted) return;
        setProducts(data.products ?? []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartSelling = () => {
    if (isLoggedIn) router.push("/sell");
    else setShowAuthModal(true);
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-visible z-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/3 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Featured Listings
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Handpicked deals from trusted sellers - discover quality products at
            unbeatable prices
          </p>
        </div>

        {loading ? (
          <FeaturedCarouselSkeleton count={8} slidesToScroll={slidesToScroll} />
        ) : products.length === 0 ? (
          <FeaturedListingsEmptyState onStartSelling={handleStartSelling} />
        ) : (
          <div className="relative">
            <Carousel
              className="w-full overflow-visible"
              opts={{ align: "start", loop: true, slidesToScroll }}
              setApi={setCarouselApi}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {products.map((product: any) => (
                  <CarouselItem
                    key={product._id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div
                      onClick={() => {
                        // Prevent accidental navigation when the user swipes on mobile
                        if (isDragging) return;
                        router.push(`/products/${product._id}`);
                      }}
                      className="cursor-pointer h-full group transition-all duration-300"
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/30">
                        <ProductCard
                          product={product}
                          variant="compact"
                          platformCurrency={platformCurrency}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}

        <div className="text-center mt-12 md:mt-16">
          <div className="hover:scale-105 transition-transform">
            <Button
              size="lg"
              variant="outline"
              className="bg-gradient-to-r from-primary/5 to-v0-green/5 border-2 border-primary/20 text-foreground"
              onClick={() => router.push("/products")}
            >
              View All Listings
            </Button>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onOpenChange={setShowAuthModal}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowAuthModal(false);
            router.push("/sell");
          }}
        />
      )}
    </section>
  );
}

function FeaturedListingsEmptyState({
  onStartSelling,
}: {
  onStartSelling: () => void;
}) {
  const router = useRouter();
  const quickActions = [
    {
      icon: Plus,
      title: "Be the First Seller",
      description: "List your items and become a featured seller",
      action: () => onStartSelling(),
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
          We're just getting started! Be among the first to showcase your
          products as featured listings on Liberia's newest marketplace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="group hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              onClick={action.action}
            >
              <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
                  >
                    {" "}
                    <action.icon className="w-8 h-8 text-white" />{" "}
                  </div>
                  <h4 className="font-bold mb-2">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="hover:scale-105 transition-transform">
            <Button
              size="lg"
              className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground"
              onClick={() => onStartSelling()}
            >
              <Plus className="w-5 h-5 mr-2" /> Start Selling Today{" "}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="hover:scale-105 transition-transform">
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              <Search className="w-5 h-5 mr-2" /> Browse All Products
            </Button>
          </div>
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
      className="w-full overflow-visible"
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
