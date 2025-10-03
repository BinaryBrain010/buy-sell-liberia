"use client";

import { useEffect, useState } from "react";
import { FaHandshake, FaRocket, FaUsers } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { Badge } from "@/components/ui/badge";
import NetworkProbe from "@/components/static-pages/NetworkProbe";

type AboutData = {
  hero?: { title?: string; subtitle?: string };
  sections?: Array<{ icon?: string; title: string; text: string }>;
  coreValues?: string[];
};

export default function AboutPage() {
  type PagePayload = {
    exists?: boolean;
    title?: string;
    content?: string;
    data?: AboutData;
  };
  const [page, setPage] = useState<PagePayload | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/pages/about", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.exists) setPage(json);
      } catch {}
    };
    load();
  }, []);

  const iconMap: Record<string, JSX.Element> = {
    rocket: <FaRocket className="text-primary w-8 h-8 mx-auto mb-3" />,
    verified: <MdVerified className="text-primary w-8 h-8 mx-auto mb-3" />,
    users: <FaUsers className="text-primary w-8 h-8 mx-auto mb-3" />,
    handshake: <FaHandshake className="text-primary w-8 h-8 mx-auto mb-3" />,
  };

  // If CMS provided pure HTML content (no structured data), render that page instead
  if (page && !page.data && page.content) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
          <NetworkProbe slug="about" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 text-center mb-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/15 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">ℹ️</span>
                  <span className="text-sm font-semibold text-primary">
                    About
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {page.title || "About BuySell"}
                </h1>
              </div>
            </section>
          </FadeIn>
          <FadeIn className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="rounded-2xl border border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-6 md:p-10 shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          </FadeIn>
        </div>
      </main>
    );
  }

  const heroTitle = page?.data?.hero?.title || (
    <>
      About <span className="text-primary">BuySell</span>
    </>
  );
  const heroSubtitle =
    page?.data?.hero?.subtitle ||
    "BuySell is a modern marketplace platform where users can buy, sell, and explore a wide variety of products — all in one place.";

  const sections = page?.data?.sections || [
    {
      icon: "rocket",
      title: "Our Mission",
      text: "To empower individuals and businesses to buy and sell safely, easily, and efficiently through an intuitive digital experience.",
    },
    {
      icon: "verified",
      title: "Our Vision",
      text: "To become the most trusted and accessible digital marketplace in the region, enabling growth and opportunity for all.",
    },
    {
      icon: "users",
      title: "Our Community",
      text: "We value transparency, trust, and inclusion — creating a safe and vibrant environment for all our users.",
    },
  ];

  const coreValues = page?.data?.coreValues || [
    "Integrity",
    "Innovation",
    "Customer First",
    "Accountability",
    "Simplicity",
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
        <NetworkProbe slug="about" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 text-center mb-16 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">🏪</span>
                <span className="text-sm font-semibold text-primary">
                  About Us
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {heroTitle}
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                {heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-300">
                  Trusted Marketplace
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm font-medium text-green-700 dark:text-green-300">
                  Growing Community
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-300">
                  Innovation First
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Mission / Vision / Community sections */}
        <section>
          <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((s, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 p-6 shadow-xl group"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
                <div className="relative z-10 text-center">
                  {s.icon && iconMap[s.icon]}
                  <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </FadeInStagger>
        </section>

        {/* Core Values */}
        <section className="mt-24">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Our Core Values
            </h2>
          </FadeIn>
          <FadeInStagger className="flex flex-wrap justify-center gap-4">
            {coreValues.map((value, i) => (
              <div
                key={i}
                className="px-5 py-3 rounded-xl border-2 border-border/40 bg-background/70 backdrop-blur text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:shadow-md transition-colors"
              >
                {value}
              </div>
            ))}
          </FadeInStagger>
        </section>

        {/* (Optional) Future Enhancements placeholder / timeline */}
        <section className="mt-28">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/30 p-8 md:p-12 bg-gradient-to-br from-primary/5 via-background to-v0-green/5 text-center">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent)]" />
              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-primary to-v0-green bg-clip-text text-transparent">
                  Building the Future of Local Commerce
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  We're continuously improving the platform with better
                  discovery, safer transactions, and tools that empower
                  individuals and businesses. Stay tuned for upcoming features
                  and innovations.
                </p>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
