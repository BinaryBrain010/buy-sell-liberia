import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FadeIn,
  FadeInStagger,
  AnimatedList,
} from "@/components/static-pages/Animated";
import { Badge } from "@/components/ui/badge";
import NetworkProbe from "@/components/static-pages/NetworkProbe";

export const metadata: Metadata = {
  title: "Disclaimer | BuySell Liberia",
  description:
    "Read the BuySell Liberia disclaimer covering marketplace terms, responsibilities, and limitations of liability.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
        <NetworkProbe slug="disclaimer" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl text-center">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">⚖️</span>
                <span className="text-sm font-semibold text-primary">
                  Policy
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Disclaimer
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Please review this information carefully. Using our platform
                means you agree to these terms.
              </p>
            </div>
          </section>
        </FadeIn>
        <section>
          <FadeInStagger className="space-y-10">
            {[
              {
                title: "General Information",
                body: [
                  "BuySell Liberia is an online marketplace that connects buyers and sellers. We do not own, manufacture, or inspect items listed on the platform. Listings, descriptions, prices, and availability are provided by sellers.",
                  "We strive for accuracy, but we cannot guarantee that listings or communications are error-free, complete, or current. Use your best judgment and verify details before making a purchase.",
                ],
              },
              {
                title: "Transactions and Responsibility",
                body: [
                  "All transactions are directly between buyers and sellers. BuySell Liberia is not a party to any transaction and does not provide warranties of any kind for listed items.",
                ],
                list: [
                  "Meet in safe, public locations whenever possible.",
                  "Verify item condition and authenticity before paying.",
                  "Beware of suspicious requests (e.g., upfront payments, gift cards, or off-platform communications).",
                ],
              },
              {
                title: "Limitations of Liability",
                body: [
                  "To the fullest extent permitted by law, BuySell Liberia and its affiliates are not liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of the platform.",
                  "We may suspend or remove content or accounts that violate our policies. We reserve the right to modify or discontinue services at any time.",
                ],
              },
              {
                title: "Reporting and Support",
                body: [
                  "If you encounter suspicious activity, scams, or policy violations, please report it immediately using the report buttons on listings or via our contact page.",
                  "For more information, see our Privacy Policy, Terms of Service, and Safety Tips pages.",
                ],
              },
            ].map((sec, i) => (
              <Card
                key={i}
                className="relative overflow-hidden border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-xl"
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent)]" />
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {sec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 leading-relaxed text-muted-foreground">
                  {sec.body.map((p, idx2) => (
                    <p key={idx2} className="text-foreground/90">
                      {p}
                    </p>
                  ))}
                  {sec.list && (
                    <AnimatedList
                      className="list-disc pl-5 space-y-2"
                      items={sec.list.map((item, idx3) => (
                        <span key={idx3}>{item}</span>
                      ))}
                    />
                  )}
                  {sec.title === "Reporting and Support" && (
                    <p className="text-sm text-muted-foreground/70">
                      Need help? Visit{" "}
                      <Link
                        href="/privacy"
                        className="underline hover:text-primary"
                      >
                        Privacy Policy
                      </Link>
                      ,{" "}
                      <Link
                        href="/terms"
                        className="underline hover:text-primary"
                      >
                        Terms
                      </Link>
                      , or{" "}
                      <Link
                        href="/safety"
                        className="underline hover:text-primary"
                      >
                        Safety Tips
                      </Link>
                      .
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </FadeInStagger>
        </section>
      </div>
    </main>
  );
}
