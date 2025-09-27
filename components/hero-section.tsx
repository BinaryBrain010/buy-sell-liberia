"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";
import { clearStoredTokens, getLocalAuthStatus } from "@/lib/jwt";
import {
  ShoppingCart,
  Tag,
  CheckCircle,
  Headphones,
  Truck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // Still useful for disabling buttons

  useEffect(() => {
    // Prefer local JWT check to avoid API call
    const { isLoggedIn } = getLocalAuthStatus();
    setIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      clearStoredTokens();
    }
    setLoadingAuth(false);
  }, []);

  const handleStartShopping = () => {
    router.push("/products");
  };

  const handleStartSelling = () => {
    if (isLoggedIn) {
      router.push("/sell");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    router.push("/sell");
  };

  const handleSignUpFree = () => {
    setShowAuthModal(true);
  };

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 py-10 md:py-10 lg:py-18 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-60 w-60 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-6xl flex flex-col items-center justify-center min-h-[70vh] w-full relative z-10">
        {/* Content Column */}
        <div className="flex flex-col items-center text-center w-full gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 px-4 py-2 text-sm font-medium text-foreground border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-v0-orange" />
            Trusted by thousands in Liberia
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
            Your Ultimate Buy & Sell{" "}
            <span className="bg-gradient-to-r from-v0-dark-blue via-v0-green to-v0-orange bg-clip-text text-transparent animate-gradient">
              Marketplace
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed text-balance">
            Connect with buyers and sellers in your area. Discover amazing deals
            on quality products or turn your unused items into cash with our
            secure, user-friendly platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <div className="hover:scale-105 transition-transform">
              <Button
                size="lg"
                className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group"
                onClick={handleStartShopping}
              >
                <ShoppingCart className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="hover:scale-105 transition-transform">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-base font-semibold border-2 border-primary/20 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-primary/40 transition-all duration-300 rounded-xl backdrop-blur-sm"
                onClick={handleStartSelling}
                disabled={loadingAuth}
              >
                <Tag className="w-5 h-5 mr-2" />
                {loadingAuth ? "Checking status..." : "Start Selling"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-col sm:flex-row gap-6 md:gap-8 text-sm text-muted-foreground justify-center items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
              <Headphones className="w-4 h-4 text-blue-600" />
              <span className="font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform">
              <Truck className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onOpenChange={setShowAuthModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </section>
  );
}

export default HeroSection;
