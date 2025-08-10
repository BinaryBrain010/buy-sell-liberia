import { HeroSection } from "@/components/hero-section"
import  { CategoriesSection }  from "@/components/categories-section"
import { FeaturedListings } from "@/components/featured-listings"
import { StatsSection } from "@/components/stats-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <FeaturedListings />
      <StatsSection />
    </div>
  )
}
