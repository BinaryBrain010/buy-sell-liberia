import AnnouncementBar from "@/components/AnnouncementBar";
import { HeroSection } from "@/components/hero-section";
import { CategoriesSection } from "@/components/categories-section";
import { FeaturedListings } from "@/components/featured-listings";
import { StatsSection } from "@/components/stats-section";
import { FadeIn } from "@/components/static-pages/Animated";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Decorative background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl"
      />

      <AnnouncementBar />

      {/* Hero */}
      <FadeIn>
        <HeroSection />
      </FadeIn>

      {/* Categories */}
      <FadeIn>
        <CategoriesSection />
      </FadeIn>

      {/* Featured Listings */}
      <FadeIn>
        <FeaturedListings />
      </FadeIn>

      {/* Stats */}
      <FadeIn>
        <StatsSection />
      </FadeIn>

      {/* Call to Action */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-none md:rounded-xl border-y md:border mx-0 md:mx-4 my-0 md:my-10 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Join the marketplace today
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-6">
              List your items in minutes or discover great deals from trusted
              sellers near you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/sell">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Selling
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
          />
        </section>
      </FadeIn>
    </div>
  );
}
