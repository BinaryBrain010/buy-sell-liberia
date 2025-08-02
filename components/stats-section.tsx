"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, MapPin, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Users",
    description: "Trusted community members",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Package,
    value: "25,000+",
    label: "Active Listings",
    description: "Items available for sale",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: MapPin,
    value: "Global",
    label: "Reach",
    description: "Worldwide marketplace",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "Success Rate",
    description: "Successful transactions",
    color: "from-orange-500 to-red-500",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose BuySell?</h2>
          <p className="text-xl text-muted-foreground">Join thousands of satisfied users</p>
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
              <Card className="glass border-0 text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                  <p className="font-semibold mb-2">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
