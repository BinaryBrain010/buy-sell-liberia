import type { Metadata } from "next";
import { headers } from "next/headers";
import NetworkProbe from "@/components/static-pages/NetworkProbe";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/ContactForm";
import { FadeIn, FadeInStagger, AnimatedList } from "@/components/static-pages/Animated";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact Us | BuySell Liberia",
  description:
    "Get in touch with the BuySell Liberia team for support, feedback, or inquiries.",
};

// Ensure dynamic rendering so CMS updates are reflected immediately
export const dynamic = "force-dynamic";

type ContactData = {
  hero?: { title?: string; subtitle?: string };
  details?: Array<{ type: string; label?: string; value: string }>;
};

async function fetchPage() {
  try {
    const init: RequestInit =
      process.env.NODE_ENV === "production"
        ? ({ next: { revalidate: 60 } } as any)
        : { cache: "no-store" };
    const hdrs = headers();
    const host =
      hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
    const proto =
      hdrs.get("x-forwarded-proto") ||
      (host.startsWith("localhost") ? "http" : "https");
    const envBase =
      (process.env.NEXT_PUBLIC_BASE_URL &&
        process.env.NEXT_PUBLIC_BASE_URL.trim()) ||
      "";
    const base = envBase || `${proto}://${host}`;
    const res = await fetch(`${base}/api/pages/contact`, init);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const data = await fetchPage();
  const heroTitle = data?.data?.hero?.title || "Contact Us";
  const heroSubtitle =
    data?.data?.hero?.subtitle ||
    "We'd love to hear from you. Reach out and we'll respond as soon as we can.";
  const details: ContactData["details"] = data?.data?.details || [
    { type: "email", value: "info@buysell.com" },
    { type: "phone", value: "+1 (555) 123-4567" },
    { type: "location", value: "Global Marketplace" },
  ];

  const iconFor = (t: string) => {
    switch (t) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <NetworkProbe slug="contact" />

      {/* Hero */}
      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">Support</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{heroTitle}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{heroSubtitle}</p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn>
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <AnimatedList
                  className="space-y-3"
                  items={(details || []).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {iconFor(d.type)} {d.label || d.value}
                    </div>
                  ))}
                />
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn>
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle>Helpful Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Before reaching out, you might find answers here:</p>
                <AnimatedList
                  className="list-disc pl-5 space-y-1"
                  items={[
                    <a key="faq" className="underline" href="/faq">FAQ</a>,
                    <a key="safety" className="underline" href="/safety">Safety Tips</a>,
                    <a key="help" className="underline" href="/faq">Help Center</a>,
                  ]}
                />
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
