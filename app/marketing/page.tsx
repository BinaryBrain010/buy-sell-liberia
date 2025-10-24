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

type BannerPlan = {
  label: string;
  price: number;
  duration?: number; // days (optional if configured)
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
    const res = await fetch("/api/monetization/plans", { cache: "no-store" });
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              Grow your reach
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Promote your business with Banner Ads
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Get your brand in front of thousands of local buyers. Banner
              placements drive visibility, traffic, and conversions for your
              products and services.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700 shadow-sm">
                • High-visibility placements
              </div>
              <div className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700 shadow-sm">
                • Targeted local audience
              </div>
              <div className="inline-flex items-center rounded-full bg-white border px-3 py-1 text-sm text-gray-700 shadow-sm">
                • Flexible durations & budgets
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg">
                <Link href="#plans">View banner plans</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to our team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid md:grid-cols-3 gap-6">
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
            <Card key={i} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Banner Ad Plans</h2>
            <p className="mt-2 text-gray-600">
              Choose a plan that fits your campaign. Prices are shown in{" "}
              {currency}.
            </p>
          </div>

          {!data ? (
            <p className="text-gray-600">Loading plans…</p>
          ) : !bannerEnabled ? (
            <div className="rounded-lg border bg-white p-6 text-gray-700">
              <p className="font-medium">
                Banner ads aren’t available right now.
              </p>
              <p className="mt-1">
                You can still reach out and we’ll notify you as soon as
                placements open up.
              </p>
              <Button asChild className="mt-4">
                <Link href="/contact">Contact our team</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bannerPlans.map(([key, plan]) => (
                <Card key={key} className="relative flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.label}</CardTitle>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold">
                      {plan.price}{" "}
                      <span className="text-base font-medium text-gray-600">
                        {currency}
                      </span>
                    </div>
                    {plan.duration ? (
                      <p className="text-sm text-gray-600">
                        Duration: {plan.duration}{" "}
                        {plan.duration === 1 ? "day" : "days"}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Flexible duration</p>
                    )}
                  </CardHeader>
                  <CardContent className="text-gray-600">
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
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            How the process works
          </h2>
          <p className="mt-2 text-gray-600">
            Simple steps to launch your campaign.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
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
                <CardTitle className="mt-2 text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">{s.body}</CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/contact">Start the conversation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
