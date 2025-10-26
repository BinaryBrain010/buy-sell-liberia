import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";
import { formatMoney } from "@/lib/currency";

type BannerPlan = {
  label: string;
  price: number;
  duration?: number; // days (optional)
};

type PlansResponse = {
  enabled: boolean;
  isBannerAdsActive?: boolean;
  currency: string;
  plans: {
    banner_ad?: Record<string, BannerPlan>;
    [key: string]: any;
  };
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPlans(): Promise<PlansResponse | null> {
  try {
    const h = headers();
    const host = h.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const url = `${protocol}://${host}/api/monetization/plans`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PlansResponse;
  } catch {
    return null;
  }
}

export default async function MarketingPage() {
  const data = await getPlans();
  const currency = data?.currency ?? "LRD";
  const bannerPlans = Object.entries(data?.plans?.banner_ad ?? {});
  const bannerEnabled =
    !!data?.enabled &&
    (data?.isBannerAdsActive ?? true) &&
    bannerPlans.length > 0;

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Decorative background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 sm:-top-16 sm:-right-16 lg:-top-20 lg:-right-20 h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-10 sm:-left-16 lg:-left-20 h-24 w-24 sm:h-36 sm:w-36 lg:h-48 lg:w-48 rounded-full bg-gradient-to-br from-v0-green/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-v0-orange/15 to-transparent blur-3xl"
      />

      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10 sm:py-14">
          <div className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-4">
                <span className="text-sm font-semibold text-primary">
                  Marketing
                </span>
                <Badge variant="secondary" className="rounded-full">
                  Banner Ads
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Promote your business with Banner Ads
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Get your brand in front of thousands of local buyers. Banner
                placements drive visibility, traffic, and conversions for your
                products and services.
              </p>
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                <div className="inline-flex items-center rounded-full bg-background/80 backdrop-blur border border-border px-3 py-1 text-xs sm:text-sm text-muted-foreground shadow-sm">
                  • High-visibility placements
                </div>
                <div className="inline-flex items-center rounded-full bg-background/80 backdrop-blur border border-border px-3 py-1 text-xs sm:text-sm text-muted-foreground shadow-sm">
                  • Targeted local audience
                </div>
                <div className="inline-flex items-center rounded-full bg-background/80 backdrop-blur border border-border px-3 py-1 text-xs sm:text-sm text-muted-foreground shadow-sm">
                  • Flexible durations & budgets
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="#plans">View banner plans</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              title: "Boost brand awareness",
              body: "Appear across high-traffic pages so shoppers remember your business.",
            },
            {
              title: "Drive qualified traffic",
              body: "Send engaged users directly to your shop, listing, or external site.",
            },
            {
              title: "Flexible placements",
              body: "Choose durations and positions that match your goals and budget.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 p-6 shadow-xl"
            >
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent)]" />
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {f.title}
                </h3>
                <p className="text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="border-y bg-muted/30">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-12 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Banner Ad Plans
            </h2>
            <p className="mt-2 text-muted-foreground">
              Choose a plan that fits your campaign. Prices are shown in{" "}
              {currency}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please provide banner images sized exactly 900 × 300 pixels (width
              × height) for optimal display.
            </p>
          </div>

          {!data ? (
            <p className="text-muted-foreground" aria-live="polite">
              Loading plans…
            </p>
          ) : !bannerEnabled ? (
            <div className="rounded-lg border bg-background p-6 text-foreground">
              <p className="font-medium">
                Banner ads aren’t available right now.
              </p>
              <p className="mt-1 text-muted-foreground">
                You can still reach out and we’ll notify you as soon as
                placements open up.
              </p>
              <Button asChild className="mt-4">
                <Link href="/contact">Contact our team</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bannerPlans.map(([key, plan]) => (
                <Card key={key} className="relative flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.label}</CardTitle>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {formatMoney(Number(plan.price), currency)}
                    </div>
                    {plan.duration ? (
                      <p className="text-sm text-muted-foreground">
                        Duration: {plan.duration}{" "}
                        {plan.duration === 1 ? "day" : "days"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Flexible duration
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                      <li>High-visibility banner placement</li>
                      <li>Premium brand exposure</li>
                      <li>Local audience reach</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button asChild className="w-full">
                      <Link
                        href={{
                          pathname: "/contact",
                          query: { topic: "banner_ad", plan: key },
                        }}
                      >
                        Contact to book
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            How the process works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Simple steps to launch your campaign.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: "Review plans",
              body: "Compare banner plans and pick what suits your goals.",
            },
            {
              step: 2,
              title: "Contact our team",
              body: "Tell us about your business, timing, and placement preferences.",
            },
            {
              step: 3,
              title: "Confirm & schedule",
              body: "We’ll align on creatives, placement, and campaign dates.",
            },
            {
              step: 4,
              title: "Launch & measure",
              body: "Go live and watch your visibility grow.",
            },
          ].map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <Badge variant="outline">Step {s.step}</Badge>
                <CardTitle className="mt-2 text-lg bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {s.body}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/contact">Start the conversation</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
