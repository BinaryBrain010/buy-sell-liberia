import SellForm from "./SellForm"
import { FadeIn } from "@/components/static-pages/Animated"
import { ArrowLeft, Package, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SellPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Enhanced Hero Section - Compact for landscape */}
      <FadeIn>
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background py-6 md:py-8 lg:py-12">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 h-40 w-40 md:h-60 md:w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-30 w-30 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Back Button */}
              <div className="flex justify-start mb-4">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="default"
                    className="border-2 border-border/30 hover:border-primary/50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>

              {/* Hero Content - Responsive sizing */}
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-4">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Sell Your Items</span>
              </div> */}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                List Your Product
              </h1>
              
              {/* <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
                Turn your unused items into cash! Follow our simple 3-step process to create your listing and start selling today.
              </p> */}

              {/* Benefits - Compact for landscape */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <Sparkles className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Free to List
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Reach Thousands
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Secure & Safe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Form Section - Better positioned for landscape */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-4xl mx-auto">
          <SellForm />
        </div>
      </div>
    </div>
  )
}
