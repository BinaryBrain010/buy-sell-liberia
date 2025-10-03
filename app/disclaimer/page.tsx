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
                This Disclaimer explains the limitations of BuySell Liberia
                regarding the use of our platform. By accessing or using our
                services, you acknowledge and agree to the following:
              </p>
            </div>
          </section>
        </FadeIn>
        <section>
          <FadeInStagger className="space-y-10">
            {[
              {
                title: "1. Marketplace Role",
                body: [
                  "BuySell Liberia is an online classifieds platform. We do not act as a buyer, seller, agent, or delivery provider.",
                ],
              },
              {
                title: "2. No Guarantee of Listings",
                body: ["We make no guarantees regarding:"],
                list: [
                  "The quality, safety, legality, or availability of items listed",
                  "The truth or accuracy of listings, prices, or photos",
                  "The identity, conduct, or reliability of users",
                ],
              },
              {
                title: "3. Transactions at User's Risk",
                body: [
                  "All transactions are strictly between buyers and sellers. BuySell Liberia is not responsible for payment disputes, fraud, missing deliveries, or misrepresented items.",
                ],
              },
              {
                title: "4. No Endorsement or Verification",
                body: [
                  "We do not pre-screen, endorse, or guarantee any listing or user on the platform.",
                ],
              },
              {
                title: "5. Limitation of Liability",
                body: [
                  "To the fullest extent permitted by law, BuySell Liberia disclaims all liability for any direct, indirect, incidental, or consequential damages arising from use of our platform. Users assume all responsibility for their transactions.",
                ],
              },
              {
                title: "6. Changes to Disclaimer",
                body: [
                  "We may update this Disclaimer as our services evolve. Continued use indicates acceptance of the latest version.",
                ],
              },
              {
                title: "7. Contact",
                body: [
                  "For any questions or concerns regarding this disclaimer, please contact us at: support@buysellliberia.com",
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
                  {sec.title === "7. Contact" && (
                    <p className="text-sm text-muted-foreground/70">
                      For additional information, please see our{" "}
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
                        Terms of Service
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
