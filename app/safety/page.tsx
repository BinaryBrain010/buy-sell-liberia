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
    <main className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <NetworkProbe slug="safety" />

      {/* Hero */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">
              Guides
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Safety Tips
            </h1>
            <p className="mt-2 text-muted-foreground">
              Practical advice to help you buy and sell safely.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      {/* Content */}
      <section className="mt-10">
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting In-Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <AnimatedList
                className="list-disc pl-5 space-y-1"
                items={[
                  <span key="1">
                    Meet in public, well-lit places and, if possible, bring a
                    friend.
                  </span>,
                  <span key="2">
                    Share your meeting details and location with someone you
                    trust.
                  </span>,
                  <span key="3">
                    Inspect the item thoroughly before paying.
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <AnimatedList
                className="list-disc pl-5 space-y-1"
                items={[
                  <span key="1">Avoid advance payments or gift cards.</span>,
                  <span key="2">
                    Use secure, traceable payment methods where possible.
                  </span>,
                  <span key="3">
                    Verify funds have cleared before handing over the item.
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Awareness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <AnimatedList
                className="list-disc pl-5 space-y-1"
                items={[
                  <span key="1">
                    Be cautious of deals that seem too good to be true.
                  </span>,
                  <span key="2">
                    Watch for pressure to move conversations off-platform.
                  </span>,
                  <span key="3">
                    Never share sensitive personal or banking information.
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reporting & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                If you encounter suspicious activity, scams, or policy
                violations, report the listing or contact our team.
              </p>
              <p>
                Visit our{" "}
                <Link href="/faq" className="underline">
                  Help Center
                </Link>{" "}
                or {""}
                <Link href="/contact" className="underline">
                  Contact Us
                </Link>{" "}
                for assistance.
              </p>
              <p className="text-xs">
                In an emergency or if you feel unsafe, contact local authorities
                immediately.
              </p>
            </CardContent>
          </Card>
        </FadeInStagger>
      </section>
    </main>
  );
}
