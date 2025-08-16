"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthModal } from "./auth-modal";
import { clearStoredTokens, getLocalAuthStatus } from "@/lib/jwt";
import {
  Star,
  ShoppingCart,
  Tag,
  CheckCircle,
  Headphones,
  Truck,
  Search,
  BadgeDollarSign,
  Heart,
  MessageSquare,
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
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center bg-background py-4 md:py-6 lg:py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl grid lg:grid-cols-2 gap-6 items-center">
        {/* Left Column */}
        <div className="flex flex-col items-start text-left">
          {/* <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 mb-3">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            Trusted by 10,000+ users worldwide
          </div> */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Your Ultimate Buy & Sell{" "}
            <span className="bg-gradient-to-b from-v0-dark-blue via-v0-green to-v0-orange bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-5 max-w-lg">
            Connect with buyers and sellers in your area. Discover amazing deals
            on quality products or turn your unused items into cash with our
            secure, user-friendly platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
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
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 text-xs text-muted-foreground">
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

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3 flex flex-col items-start text-left">
              <div className="p-2 rounded-full bg-blue-100 mb-2">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold mb-1">Smart Search</h3>
              <p className="text-muted-foreground text-xs">
                Find exactly what you need with our advanced filtering system
              </p>
            </Card>
            <Card className="p-3 flex flex-col items-start text-left">
              <div className="p-2 rounded-full bg-green-100 mb-2">
                <BadgeDollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base font-semibold mb-1">Best Prices</h3>
              <p className="text-muted-foreground text-xs">
                Compare prices and get the best deals from verified sellers
              </p>
            </Card>
            <Card className="p-3 flex flex-col items-start text-left">
              <div className="p-2 rounded-full bg-purple-100 mb-2">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold mb-1">Wishlist</h3>
              <p className="text-muted-foreground text-xs">
                Save your favorite items and get notified of price drops
              </p>
            </Card>
            <Card className="p-3 flex flex-col items-start text-left">
              <div className="p-2 rounded-full bg-orange-100 mb-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-base font-semibold mb-1">Live Chat</h3>
              <p className="text-muted-foreground text-xs">
                Connect directly with sellers for instant communication
              </p>
            </Card>
          </div>

          {/* Statistics Section */}
          {/* <Card className="p-2 flex flex-col sm:flex-row justify-around items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">10K+</span>
              <span className="text-muted-foreground text-sm">
                Active Users
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-green-600">50K+</span>
              <span className="text-muted-foreground text-sm">
                Products Sold
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-600">4.8★</span>
              <span className="text-muted-foreground text-sm">User Rating</span>
            </div>
          </Card> */}

          {/* Ready to get started CTA */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-v0-dark-blue to-v0-green text-white flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-bold mb-0.5">
                Ready to get started?
              </h3>
              <p className="text-xs opacity-90">
                Join our community today and discover endless possibilities
              </p>
            </div>
            <Button
              variant="secondary"
              className="px-4 py-2 text-xs font-semibold text-v0-dark-blue bg-white hover:bg-gray-100 transition-colors rounded-md"
              onClick={handleSignUpFree}
            >
              Sign Up Free
            </Button>
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
