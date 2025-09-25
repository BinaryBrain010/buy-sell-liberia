"use client";

import { motion } from "framer-motion";
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
    <section className="py-20 bg-muted/30 overflow-x-clip">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            Join the first wave of users building Liberia's trusted online
            marketplace.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="glass border-0 text-center hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
