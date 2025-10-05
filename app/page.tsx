import { AnnouncementBar } from "@/components/announcement-bar";
import { HeroSection } from "@/components/hero-section";
import { CategoriesSection } from "@/components/categories-section";
import { FeaturedListings } from "@/components/featured-listings";
import { StatsSection } from "@/components/stats-section";
// import { TestimonialsSection } from "@/components/testimonials-section"; // Disabled for redesign
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TrustBadgesSection } from "@/components/trust-badges-section";
// import { NewsletterSection } from "@/components/newsletter-section"; // Disabled for redesign
import { FadeIn } from "@/components/static-pages/Animated";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageLoaderOverlay from "@/components/loader/PageLoader";

export default function Home() {
  return (
    <div className="relative overflow-x-hidden overflow-y-visible bg-gradient-to-b from-background to-muted/20">
      {/* Full-page loader until page assets complete */}
      <PageLoaderOverlay
        label="Loading marketplace"
        minDuration={6000}
        waitForWindowLoad={false}
      />
      {/* Enhanced decorative background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 sm:-top-16 sm:-right-16 lg:-top-20 lg:-right-20 h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-10 sm:-left-16 lg:-left-20 h-24 w-24 sm:h-36 sm:w-36 lg:h-48 lg:w-48 rounded-full bg-gradient-to-br from-v0-green/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-v0-orange/15 to-transparent blur-3xl"
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

      {/* How It Works */}
      <FadeIn>
        <HowItWorksSection />
      </FadeIn>

      {/* Trust Badges */}
      {/* <FadeIn>
        <TrustBadgesSection />
      </FadeIn> */}
    </div>
  );
}
