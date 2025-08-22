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
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center bg-background py-10 md:py-10 lg:py-18">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-4xl flex flex-col items-center justify-center min-h-[70vh] w-full">
        {/* Content Column */}
        <div className="flex flex-col items-center text-center w-full gap-8">
          {/* <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 mb-3">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            Trusted by 10,000+ users worldwide
          </div> */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your Ultimate Buy & Sell{" "}
            <span className="bg-gradient-to-b from-v0-dark-blue via-v0-green to-v0-orange bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-1 max-w-2xl mx-auto">
            Connect with buyers and sellers in your area. Discover amazing deals
            on quality products or turn your unused items into cash with our
            secure, user-friendly platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-2 justify-center">
            <Button
              className="px-5 py-3 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md"
              onClick={handleStartShopping}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Start Shopping
            </Button>
            <Button
              variant="outline"
              className="px-5 py-3 text-sm font-semibold border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md bg-transparent"
              onClick={handleStartSelling}
              disabled={loadingAuth} // Disable until auth status is known
            >
              <Tag className="w-4 h-4 mr-2" />
              {loadingAuth ? "Checking status..." : "Start Selling"}{" "}
              {/* Show loading text */}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-8 text-sm text-muted-foreground justify-center">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Secure Payments
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-blue-500" />
              24/7 Support
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-500" />
              Fast Delivery
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
