"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Monrovia",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "I've been using BuySell Liberia for 6 months now and it's amazing! I've sold over 20 items and bought some great deals. The platform is so easy to use and the community is trustworthy.",
    product: "Electronics & Home Items",
  },
  {
    id: 2,
    name: "Michael Brown",
    location: "Buchanan",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "Finally, a marketplace built specifically for Liberia! I found my dream car here at a fraction of what dealers were asking. The seller was verified and the whole process was smooth.",
    product: "Vehicle Purchase",
  },
  {
    id: 3,
    name: "Grace Williams",
    location: "Gbarnga",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "As a small business owner, this platform has been a game-changer. I can reach customers across Liberia and grow my business. The support team is always helpful when I have questions.",
    product: "Fashion & Accessories",
  },
  {
    id: 4,
    name: "James Doe",
    location: "Kakata",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "The security features give me peace of mind when buying or selling. I love how I can verify sellers and read reviews before making any transactions. Highly recommended!",
    product: "Tools & Equipment",
  },
  {
    id: 5,
    name: "Patience Kollie",
    location: "Zwedru",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "I was skeptical at first, but this platform is legit! I've made several successful transactions and even made new friends in the process. It's more than just a marketplace.",
    product: "Home & Furniture",
  },
  {
    id: 6,
    name: "Robert Taylor",
    location: "Voinjama",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    text: "The mobile experience is fantastic. I can browse, buy, and sell from anywhere in Liberia. The app loads fast even with limited internet, which is perfect for our country.",
    product: "Sports & Outdoors",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 h-32 w-32 rounded-full bg-gradient-to-br from-v0-green/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of satisfied users who have found success buying and selling on Liberia's most trusted marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group hover:scale-105 hover:-translate-y-2 transition-all duration-300"
            >
              <Card className="relative bg-background/80 backdrop-blur-sm border border-border/50 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-primary/20 group-hover:text-primary/40 transition-colors">
                  <Quote className="w-8 h-8" />
                </div>

                <CardContent className="p-8 relative z-10">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>

                  {/* Product Category */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {testimonial.product}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-v0-green/20 text-foreground font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Trusted by 10,000+ users across Liberia
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
