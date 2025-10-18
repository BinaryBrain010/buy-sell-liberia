"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth-modal";
import { clearStoredTokens, getLocalAuthStatus } from "@/lib/jwt";
import {
  UserPlus,
  Camera,
  CreditCard,
  Handshake,
  ArrowRight,
  CheckCircle,
  Search,
  MessageCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";

const sellingSteps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up for free in minutes with your email or phone number. Get verified to build trust with buyers.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    icon: Camera,
    title: "List Your Item",
    description:
      "Take photos, write a description, set your price, and choose your location. Your listing goes live instantly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Connect with Buyers",
    description:
      "Receive messages from interested buyers, answer questions, and negotiate prices through our secure chat.",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "04",
    icon: Handshake,
    title: "Complete Sale",
    description:
      "Meet safely with verified buyers, exchange payment, and mark your item as sold. Leave reviews for each other.",
    color: "from-orange-500 to-red-500",
  },
];

const buyingSteps = [
  {
    step: "01",
    icon: Search,
    title: "Browse & Search",
    description:
      "Explore thousands of listings by category, location, or price. Use filters to find exactly what you need.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Contact Seller",
    description:
      "Ask questions, request more photos, or negotiate the price through our built-in messaging system.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    step: "03",
    icon: Shield,
    title: "Verify & Meet",
    description:
      "Check seller reviews and verification status. Arrange a safe meeting location to inspect the item.",
    color: "from-emerald-500 to-green-500",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Buy with Confidence",
    description:
      "Complete your purchase, leave feedback for the seller, and enjoy your new item from a trusted local seller.",
    color: "from-violet-500 to-purple-500",
  },
];

export function HowItWorksSection() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const { isLoggedIn } = getLocalAuthStatus();
    setIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) clearStoredTokens();
    setLoadingAuth(false);
  }, []);

  const handleStartSelling = (routerPush: (path: string) => void) => {
    if (isLoggedIn) {
      routerPush("/sell");
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-visible z-0">
      {/* Background Elements (non-interactive) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-4 md:-left-20 h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-4 md:-right-20 h-12 w-12 sm:h-20 sm:w-20 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Whether you're buying or selling, our platform makes it simple,
            safe, and secure
          </p>
        </div>

        {/* Selling Process - Enhanced Design */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-4 md:mb-6">
              <span className="text-xl md:text-2xl">🚀</span>
              <span className="text-xs md:text-sm font-semibold text-primary">
                Seller Journey
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">
              Selling Made Simple
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Turn your unused items into cash with our easy 4-step process
            </p>
          </div>

          {/* Enhanced Step Layout */}
          <div className="relative max-w-full mx-auto mb-8 md:mb-12">
            {/* Progress Line (visible from md) */}
            <div className="absolute md:top-16 lg:top-20 left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 h-0.5 md:h-1 bg-gradient-to-r from-primary via-v0-green to-v0-orange rounded-full hidden md:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-4 px-2 sm:px-4">
              {sellingSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative group hover:scale-105 transition-all duration-300"
                >
                  {/* Step Number Badge */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-v0-dark-blue text-white flex items-center justify-center font-bold text-xs sm:text-sm md:text-lg shadow-lg md:shadow-2xl z-20 border-2 md:border-4 border-background mx-auto mb-3 md:mb-0 md:absolute md:-top-7 md:left-1/2 md:transform md:-translate-x-1/2">
                    {step.step}
                  </div>

                  <Card className="relative bg-gradient-to-br from-background/90 via-primary/5 to-background/90 backdrop-blur-sm border border-border/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 h-full overflow-hidden md:mt-6">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-v0-green opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 sm:p-5 md:p-6 pt-8 sm:pt-10 md:pt-12 text-center">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg md:shadow-2xl ring-2 md:ring-4 lg:ring-8 ring-white/10 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <step.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white relative z-10" />
                      </div>

                      <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {/* Decorative Bottom Accent */}
                      <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-auto"></div>
                    </CardContent>
                  </Card>

                  {/* Connection Arrow (visible on lg) */}
                  {index < sellingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-primary/40 group-hover:text-primary/80 transition-colors z-10">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buying Process - Enhanced Design */}
        <div>
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-v0-green/10 to-v0-orange/10 border border-v0-green/20 mb-4 md:mb-6">
              <span className="text-xl md:text-2xl">🛍️</span>
              <span className="text-xs md:text-sm font-semibold text-v0-green">
                Buyer Journey
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">
              Buying with Confidence
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Find amazing deals from verified sellers in your area
            </p>
          </div>

          {/* Enhanced Step Layout */}
          <div className="relative max-w-full mx-auto mb-8 md:mb-12">
            {/* Progress Line (visible from md) */}
            <div className="absolute md:top-16 lg:top-20 left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 h-0.5 md:h-1 bg-gradient-to-r from-v0-green via-v0-orange to-primary rounded-full hidden md:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-4 px-2 sm:px-4">
              {buyingSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative group hover:scale-105 transition-all duration-300"
                >
                  {/* Step Number Badge */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-v0-green to-v0-orange text-white flex items-center justify-center font-bold text-xs sm:text-sm md:text-lg shadow-lg md:shadow-2xl z-20 border-2 md:border-4 border-background mx-auto mb-3 md:mb-0 md:absolute md:-top-7 md:left-1/2 md:transform md:-translate-x-1/2">
                    {step.step}
                  </div>

                  <Card className="relative bg-gradient-to-br from-background/90 via-v0-green/5 to-background/90 backdrop-blur-sm border border-border/30 hover:border-v0-green/60 hover:shadow-lg hover:shadow-v0-green/20 transition-all duration-300 h-full overflow-hidden md:mt-6">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-v0-green to-v0-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 sm:p-5 md:p-6 pt-8 sm:pt-10 md:pt-12 text-center">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg md:shadow-2xl ring-2 md:ring-4 lg:ring-8 ring-white/10 relative overflow-hidden group-hover:scale-105 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <step.icon className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white relative z-10" />
                      </div>

                      <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 group-hover:text-v0-green transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {/* Decorative Bottom Accent */}
                      <div className="mt-3 sm:mt-4 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-v0-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-auto"></div>
                    </CardContent>
                  </Card>

                  {/* Connection Arrow (visible on lg) */}
                  {index < buyingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-v0-green/40 group-hover:text-v0-green/80 transition-colors z-10">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/products" passHref>
              <div className="hover:scale-105 transition-transform">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold border-2 border-v0-green/30 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-v0-green/60 transition-all duration-300 rounded-xl md:rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <span className="text-xl sm:text-2xl mr-2 sm:mr-3">🛍️</span>
                  Browse Products
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
                </Button>
              </div>
            </Link>
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
            window.location.assign("/sell");
          }}
        />
      )}
    </section>
  );
}
