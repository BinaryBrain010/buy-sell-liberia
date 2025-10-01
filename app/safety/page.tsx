import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FadeIn,
  FadeInStagger,
  AnimatedList,
} from "@/components/static-pages/Animated";
import NetworkProbe from "@/components/static-pages/NetworkProbe";

export const metadata: Metadata = {
  title: "Safety Tips | BuySell Liberia",
  description:
    "Stay safe while buying and selling on BuySell Liberia. Read our meeting, payment, and fraud prevention tips.",
};

export default function SafetyPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
        <NetworkProbe slug="safety" />

        {/* Enhanced Hero */}
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 text-center mb-14 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">🛡️</span>
                <span className="text-sm font-semibold text-primary">
                  Guides
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Safety Tips
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Practical, community-focused advice to help you buy and sell
                confidently and securely.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-300">
                  Community Driven
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300">
                  Safe Exchanges
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300">
                  Fraud Prevention
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Tips Sections */}
        <section>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-lg group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Meeting In-Person
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <AnimatedList
                  className="list-disc pl-5 space-y-1"
                  items={[
                    <span key="1">
                      Meet in public, well-lit places; bring a friend if
                      possible.
                    </span>,
                    <span key="2">
                      Share your meeting location and time with someone you
                      trust.
                    </span>,
                    <span key="3">
                      Inspect the item thoroughly before paying.
                    </span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-lg group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <AnimatedList
                  className="list-disc pl-5 space-y-1"
                  items={[
                    <span key="1">
                      Avoid advance payments, wire transfers, and gift cards.
                    </span>,
                    <span key="2">
                      Use secure and traceable methods whenever possible.
                    </span>,
                    <span key="3">
                      Confirm funds have cleared before releasing the item.
                    </span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-lg group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Fraud Awareness
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <AnimatedList
                  className="list-disc pl-5 space-y-1"
                  items={[
                    <span key="1">
                      Be skeptical of deals that seem unrealistically good.
                    </span>,
                    <span key="2">
                      Avoid pressure to move chats to unofficial channels.
                    </span>,
                    <span key="3">
                      Never share sensitive personal or banking details.
                    </span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-lg group md:col-span-2 xl:col-span-3">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent)]" />
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Reporting & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  If you encounter suspicious activity, scams, or policy
                  violations, report the listing or contact our team.
                </p>
                <p>
                  Visit our{" "}
                  <Link
                    href="/faq"
                    className="underline font-medium hover:text-primary"
                  >
                    Help Center
                  </Link>{" "}
                  or {""}
                  <Link
                    href="/contact"
                    className="underline font-medium hover:text-primary"
                  >
                    Contact Us
                  </Link>{" "}
                  for assistance.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  In an emergency or if you feel unsafe, contact local
                  authorities immediately.
                </p>
              </CardContent>
            </Card>
          </FadeInStagger>
        </section>

        {/* Extra CTA */}
        <section className="mt-24">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/30 p-8 md:p-14 bg-gradient-to-br from-primary/5 via-background to-v0-green/5 text-center">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent)]" />
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-v0-green bg-clip-text text-transparent">
                  Help Keep the Community Safe
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                  Your vigilance helps protect everyone. Report suspicious
                  listings, be transparent, and encourage safe practices.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  We continuously improve safety measures—feedback is welcome.
                </p>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
