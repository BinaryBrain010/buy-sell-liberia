"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Camera, 
  CreditCard, 
  Handshake,
  ArrowRight,
  CheckCircle,
  Search,
  MessageCircle,
  Shield
} from "lucide-react";
import Link from "next/link";

const sellingSteps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up for free in minutes with your email or phone number. Get verified to build trust with buyers.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02", 
    icon: Camera,
    title: "List Your Item",
    description: "Take photos, write a description, set your price, and choose your location. Your listing goes live instantly.",
    color: "from-green-500 to-emerald-500",
  },
  {
    step: "03",
    icon: MessageCircle,
    title: "Connect with Buyers",
    description: "Receive messages from interested buyers, answer questions, and negotiate prices through our secure chat.",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "04",
    icon: Handshake,
    title: "Complete Sale",
    description: "Meet safely with verified buyers, exchange payment, and mark your item as sold. Leave reviews for each other.",
    color: "from-orange-500 to-red-500",
  },
];

const buyingSteps = [
  {
    step: "01",
    icon: Search,
    title: "Browse & Search",
    description: "Explore thousands of listings by category, location, or price. Use filters to find exactly what you need.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Contact Seller",
    description: "Ask questions, request more photos, or negotiate the price through our built-in messaging system.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    step: "03",
    icon: Shield,
    title: "Verify & Meet",
    description: "Check seller reviews and verification status. Arrange a safe meeting location to inspect the item.",
    color: "from-emerald-500 to-green-500",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Buy with Confidence",
    description: "Complete your purchase, leave feedback for the seller, and enjoy your new item from a trusted local seller.",
    color: "from-violet-500 to-purple-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're buying or selling, our platform makes it simple, safe, and secure
          </p>
        </div>

        {/* Selling Process - Enhanced Design */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-semibold text-primary">Seller Journey</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Selling Made Simple
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Turn your unused items into cash with our easy 4-step process
            </p>
          </div>

          {/* Enhanced Step Layout */}
          <div className="relative max-w-6xl mx-auto mb-16">
            {/* Progress Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-v0-green to-v0-orange rounded-full hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
              {sellingSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative group hover:scale-105 transition-all duration-500"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-v0-dark-blue text-white flex items-center justify-center font-bold text-xl shadow-2xl z-20 border-4 border-background">
                    {step.step}
                  </div>

                  <Card className="relative bg-gradient-to-br from-background/90 via-primary/5 to-background/90 backdrop-blur-sm border-2 border-border/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 h-full overflow-hidden mt-8">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-v0-green opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <CardContent className="p-8 pt-12 text-center">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl ring-8 ring-white/20 relative overflow-hidden group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                        <step.icon className="h-12 w-12 text-white relative z-10" />
                      </div>
                      
                      <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {step.description}
                      </p>

                      {/* Decorative Bottom Accent */}
                      <div className="mt-6 w-20 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mx-auto"></div>
                    </CardContent>
                  </Card>

                  {/* Connection Arrow */}
                  {index < sellingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary/40 group-hover:text-primary/80 transition-colors z-10">
                      <ArrowRight className="w-12 h-12" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/sell" passHref>
              <div className="hover:scale-105 transition-transform">
                <Button
                  size="lg"
                  className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 rounded-2xl shadow-xl hover:shadow-2xl"
                >
                  <span className="text-2xl mr-3">🚀</span>
                  Start Selling Today
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </Link>
          </div>
        </div>

        {/* Buying Process - Enhanced Design */}
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-v0-green/10 to-v0-orange/10 border border-v0-green/20 mb-6">
              <span className="text-2xl">🛍️</span>
              <span className="text-sm font-semibold text-v0-green">Buyer Journey</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Buying with Confidence
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find amazing deals from verified sellers in your area
            </p>
          </div>

          {/* Enhanced Step Layout */}
          <div className="relative max-w-6xl mx-auto mb-16">
            {/* Progress Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-v0-green via-v0-orange to-primary rounded-full hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
              {buyingSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="relative group hover:scale-105 transition-all duration-500"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-v0-green to-v0-orange text-white flex items-center justify-center font-bold text-xl shadow-2xl z-20 border-4 border-background">
                    {step.step}
                  </div>

                  <Card className="relative bg-gradient-to-br from-background/90 via-v0-green/5 to-background/90 backdrop-blur-sm border-2 border-border/30 hover:border-v0-green/60 hover:shadow-2xl hover:shadow-v0-green/25 transition-all duration-500 h-full overflow-hidden mt-8">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-v0-green to-v0-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <CardContent className="p-8 pt-12 text-center">
                      <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl ring-8 ring-white/20 relative overflow-hidden group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                        <step.icon className="h-12 w-12 text-white relative z-10" />
                      </div>
                      
                      <h4 className="text-2xl font-bold mb-4 group-hover:text-v0-green transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {step.description}
                      </p>

                      {/* Decorative Bottom Accent */}
                      <div className="mt-6 w-20 h-1 bg-gradient-to-r from-transparent via-v0-green/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mx-auto"></div>
                    </CardContent>
                  </Card>

                  {/* Connection Arrow */}
                  {index < buyingSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-v0-green/40 group-hover:text-v0-green/80 transition-colors z-10">
                      <ArrowRight className="w-12 h-12" />
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
                  className="px-12 py-6 text-lg font-semibold border-2 border-v0-green/30 text-foreground hover:bg-gradient-to-r hover:from-v0-green/10 hover:to-v0-orange/10 hover:border-v0-green/60 transition-all duration-300 rounded-2xl backdrop-blur-sm shadow-xl hover:shadow-2xl"
                >
                  <span className="text-2xl mr-3">🛍️</span>
                  Browse Products
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
