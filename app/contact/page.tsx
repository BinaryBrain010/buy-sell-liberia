import type { Metadata } from "next";
import { headers } from "next/headers";
import NetworkProbe from "@/components/static-pages/NetworkProbe";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/ContactForm";
import {
  FadeIn,
  FadeInStagger,
  AnimatedList,
} from "@/components/static-pages/Animated";
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
    { type: "email", value: "info@buysellliberia.com" },
    { type: "phone", value: "+231 77 7647548" },
    { type: "location", value: "Key Hole, Old Road-Sinkor Monrovia-Liberia" },
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
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <NetworkProbe slug="contact" />

        {/* Enhanced Hero (aligned with categories/products) */}
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 text-center mb-12 shadow-2xl">
            {/* Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-v0-green/20 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-gradient-to-br from-v0-orange/15 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">✉️</span>
                <span className="text-sm font-semibold text-primary">
                  Get In Touch
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {heroTitle}
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                {heroSubtitle}
              </p>

              {/* Quick trust badges */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Fast Response
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Verified Team
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Secure Channel
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <FadeIn className="lg:col-span-2">
            <Card className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-xl">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-v0-green/10 rounded-full blur-3xl" />
              </div>
              <CardHeader className="relative z-10 pb-4">
                <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent flex items-center gap-2">
                  <span className="text-3xl">💬</span> Send us a Message
                </CardTitle>
                <p className="text-muted-foreground text-sm md:text-base max-w-prose mt-2">
                  Fill out the form below and a member of our team will get back
                  to you promptly.
                </p>
              </CardHeader>
              <CardContent className="relative z-10">
                <ContactForm />
              </CardContent>
            </Card>
          </FadeIn>

          {/* Sidebar */}
          <div className="space-y-8">
            <FadeIn>
              <Card className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background/90 to-muted/40 shadow-lg">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 text-sm md:text-base text-muted-foreground">
                  <AnimatedList
                    className="space-y-4"
                    items={(details || []).map((d, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/50 hover:border-primary/40 transition-colors"
                      >
                        <div className="mt-0.5 text-primary">
                          {iconFor(d.type)}
                        </div>
                        <div className="flex-1 break-words text-foreground/90 font-medium">
                          {d.label || d.value}
                        </div>
                      </div>
                    ))}
                  />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn>
              <Card className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background/90 to-muted/40 shadow-lg">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-v0-green/10 rounded-full blur-2xl" />
                </div>
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    Helpful Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 text-sm md:text-base text-muted-foreground">
                  <p className="leading-relaxed">
                    Before reaching out, you might find quick answers here:
                  </p>
                  <AnimatedList
                    className="space-y-2"
                    items={[
                      <a
                        key="faq"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 border border-border/50 hover:border-primary/40 hover:text-primary transition-colors"
                        href="/faq"
                      >
                        <span className="text-sm font-medium">FAQ</span>
                      </a>,
                      <a
                        key="safety"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 border border-border/50 hover:border-primary/40 hover:text-primary transition-colors"
                        href="/safety"
                      >
                        <span className="text-sm font-medium">Safety Tips</span>
                      </a>,
                      <a
                        key="help"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 border border-border/50 hover:border-primary/40 hover:text-primary transition-colors"
                        href="/faq"
                      >
                        <span className="text-sm font-medium">Help Center</span>
                      </a>,
                    ]}
                  />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Optional CTA / Additional Support */}
            <FadeIn>
              <Card className="relative overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-background to-v0-green/5 shadow-md">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
                </div>
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-v0-green bg-clip-text text-transparent">
                    Need faster assistance?
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3 text-sm md:text-base text-muted-foreground">
                  <p>
                    For urgent listing or account issues, please mention
                    "URGENT" in the subject line. Our support team prioritizes
                    critical requests.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Average response time: under 24 hours on business days.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>
      </div>
    </main>
  );
}
