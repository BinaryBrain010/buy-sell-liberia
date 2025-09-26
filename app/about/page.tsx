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
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <NetworkProbe slug="about" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">About</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{page.title || "About BuySell"}</h1>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </section>
        </FadeIn>
        <FadeIn className="prose prose-zinc dark:prose-invert max-w-none mt-10">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </FadeIn>
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
    <main className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <NetworkProbe slug="about" />
      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">About</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{heroTitle}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-2">{heroSubtitle}</p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <section className="mt-10">
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((s, i) => (
            <div key={i} className="glass p-6 rounded-2xl shadow-lg text-center">
              {s.icon && iconMap[s.icon]}
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </FadeInStagger>
      </section>

      <section className="mt-20 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold mb-6">Our Core Values</h2>
        </FadeIn>
        <FadeInStagger className="flex flex-wrap justify-center gap-4">
          {coreValues.map((value, i) => (
            <div
              key={i}
              className="glass px-5 py-3 rounded-xl shadow-md text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {value}
            </div>
          ))}
        </FadeInStagger>
      </section>
    </main>
  );
}
