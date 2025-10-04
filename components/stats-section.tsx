"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, MapPin, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Growing Community",
    description:
      "Every day, more buyers & sellers are joining BuySell Liberia.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Package,
    label: "Fresh Listings",
    description:
      "New items are added weekly– be the first to grab the best deals.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: MapPin,
    label: "Local Reach",
    description:
      "Built for Liberia, connecting communities across the country.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: ShieldCheck,
    label: "Safe & Secure",
    description:
      "Your safety is our priority with verified listings and trusted transactions.",
    color: "from-orange-500 to-red-500",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20 overflow-visible relative z-0">
      {/* Background Elements (non-interactive) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Join Liberia's Trusted Marketplace
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Be part of the first wave of users building Liberia's most trusted
            online marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group hover:scale-105 hover:-translate-y-2 transition-all duration-300"
            >
              <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 text-center hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-8 relative z-10">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ring-4 ring-white/20 relative overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <stat.icon className="h-10 w-10 text-white relative z-10" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {stat.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
