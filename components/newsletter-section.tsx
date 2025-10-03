"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  Bell, 
  Gift, 
  TrendingUp,
  CheckCircle,
  Sparkles
} from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail("");
  };

  const benefits = [
    {
      icon: Bell,
      title: "New Listings Alerts",
      description: "Get notified when items in your favorite categories are posted",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Gift,
      title: "Exclusive Deals",
      description: "Access special offers and discounts available only to subscribers",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Receive weekly reports on trending items and pricing insights",
      color: "from-purple-500 to-pink-500",
    },
  ];

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">
                Welcome to BuySell Liberia!
              </h2>
              <p className="text-lg text-green-600 dark:text-green-400 mb-6">
                Thank you for subscribing! You'll receive our weekly newsletter with the latest deals, market insights, and platform updates.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-green-500">
                <Sparkles className="w-4 h-4" />
                <span>You're now part of the BuySell Liberia community!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Stay in the Loop
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Get the latest updates, exclusive deals, and market insights delivered straight to your inbox
            </p>
          </div>

          {/* Newsletter Form */}
          <Card className="max-w-2xl mx-auto mb-16 bg-background/80 backdrop-blur-sm border border-border/50">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Subscribe to Our Newsletter</h3>
                    <p className="text-muted-foreground">Never miss out on great deals again</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 text-base"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading || !email}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-v0-dark-blue text-primary-foreground hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <Mail className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="group hover:scale-105 hover:-translate-y-2 transition-all duration-300"
              >
                <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg ring-4 ring-white/20 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      <benefit.icon className="h-8 w-8 text-white relative z-10" />
                    </div>
                    
                    <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Trust Message */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Join 5,000+ subscribers getting weekly updates
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
