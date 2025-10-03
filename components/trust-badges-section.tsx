"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Users, 
  CheckCircle, 
  Eye, 
  Smartphone,
  Globe,
  Award,
  Zap,
  Heart
} from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data and transactions are protected with enterprise-grade security and encryption.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lock,
    title: "Verified Users",
    description: "All sellers go through our verification process to ensure authenticity and trust.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by Liberians, for Liberians. We understand local needs and preferences.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Our team reviews listings to maintain high standards and prevent fraud.",
    color: "from-orange-500 to-red-500",
  },
];

const platformFeatures = [
  {
    icon: Eye,
    title: "Transparent Reviews",
    description: "Read authentic reviews from real buyers and sellers before making decisions.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Access our platform seamlessly on any device, anywhere in Liberia.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Local Focus",
    description: "Connect with people in your area for easier meetups and faster transactions.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Quick loading times and 99.9% uptime, even with limited internet connectivity.",
    color: "from-violet-500 to-purple-500",
  },
];

const trustBadges = [
  {
    icon: Award,
    title: "Liberia's #1 Marketplace",
    description: "Trusted by thousands of users nationwide",
    stat: "10,000+",
    label: "Active Users",
  },
  {
    icon: Heart,
    title: "Community Trusted",
    description: "Built with love for the Liberian community",
    stat: "98%",
    label: "Satisfaction Rate",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Zero fraud incidents since launch",
    stat: "100%",
    label: "Secure",
  },
];

export function TrustBadgesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-primary">Trusted & Secure</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Why Trust BuySell Liberia?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your safety and satisfaction are our top priorities. Here's how we ensure a secure and trustworthy marketplace experience.
          </p>
        </div>

        {/* Security Features - Vertical Timeline Style */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              🔒 Security First
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced security measures to protect your data and transactions
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-green-500 to-purple-500 rounded-full hidden lg:block"></div>
            
            <div className="space-y-12">
              {securityFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:gap-12`}
                >
                  {/* Content */}
                  <div className="flex-1 group hover:scale-105 transition-all duration-300">
                    <Card className="relative bg-gradient-to-br from-background/90 to-muted/30 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl ring-4 ring-white/30 relative overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                            <feature.icon className="h-10 w-10 text-white relative z-10" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                              {feature.title}
                            </h4>
                            <p className="text-muted-foreground leading-relaxed text-base">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline Node */}
                  <div className="hidden lg:block w-8 h-8 rounded-full bg-gradient-to-br from-primary to-v0-dark-blue border-4 border-background shadow-lg z-10 flex-shrink-0"></div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Features - Hexagonal Grid Style */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              ⚡ Platform Excellence
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for Liberia's unique needs and challenges
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Hexagonal Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
              {platformFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group hover:scale-105 hover:-translate-y-3 transition-all duration-500"
                >
                  <Card className="relative bg-gradient-to-br from-background/80 via-muted/10 to-background/80 backdrop-blur-sm border-2 border-border/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 h-full overflow-hidden">
                    {/* Hexagonal accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 rotate-45 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="p-8 relative z-10">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-24 h-24 mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl ring-8 ring-white/20 relative overflow-hidden group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                          <feature.icon className="h-12 w-12 text-white relative z-10" />
                        </div>
                        
                        <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {feature.description}
                        </p>

                        {/* Decorative element */}
                        <div className="mt-6 w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges - Circular Stats Style */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              🏆 Trusted by the Community
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to excellence is reflected in our growing community and success metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => (
              <div
                key={badge.title}
                className="group hover:scale-110 hover:-translate-y-4 transition-all duration-500"
              >
                <Card className="relative bg-gradient-to-br from-background/90 via-primary/5 to-background/90 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 h-full overflow-hidden">
                  {/* Animated background rings */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-primary/10 group-hover:border-primary/30 transition-all duration-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-primary/5 group-hover:border-primary/20 transition-all duration-700"></div>
                  </div>
                  
                  <CardContent className="p-8 text-center relative z-10">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-2xl ring-8 ring-primary/20 relative overflow-hidden group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                        <badge.icon className="h-12 w-12 text-white relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                      
                      {/* Floating stat number */}
                      <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-v0-green to-v0-orange flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <span className="text-white font-bold text-lg">{badge.stat}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                        {badge.label}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {badge.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {badge.description}
                    </p>

                    {/* Decorative bottom accent */}
                    <div className="mt-6 w-20 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mx-auto"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Message */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-lg font-semibold text-green-700 dark:text-green-300">
              Join Liberia's Most Trusted Marketplace Today
            </span>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
