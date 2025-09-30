import { AnnouncementBar } from "@/components/announcement-bar";
import { HeroSection } from "@/components/hero-section";
import { CategoriesSection } from "@/components/categories-section";
import { FeaturedListings } from "@/components/featured-listings";
import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TrustBadgesSection } from "@/components/trust-badges-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { FadeIn } from "@/components/static-pages/Animated";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
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

      {/* Testimonials */}
      <FadeIn>
        <TestimonialsSection />
      </FadeIn>

      {/* How It Works */}
      <FadeIn>
        <HowItWorksSection />
      </FadeIn>

      {/* Trust Badges */}
      <FadeIn>
        <TrustBadgesSection />
      </FadeIn>

      {/* Newsletter */}
      <FadeIn>
        <NewsletterSection />
      </FadeIn>

      {/* Call to Action */}
      <FadeIn>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-v0-green/5 py-16 md:py-20">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-gradient-to-br from-v0-orange/10 to-transparent blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Join thousands of users buying and selling on Liberia's most
                trusted marketplace. List your items in minutes or discover
                amazing deals from verified sellers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <div className="hover:scale-105 transition-transform">
                  <Link href="/sell">
                    <Button
                      size="lg"
                      className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group"
                    >
                      <svg
                        className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Start Selling Today
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>

                <div className="hover:scale-105 transition-transform">
                  <Link href="/products">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-base font-semibold border-2 border-primary/20 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-primary/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Browse Products
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>100% Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Secure Transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Local Community</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
