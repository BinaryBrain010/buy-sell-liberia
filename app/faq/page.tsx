import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NetworkProbe from "@/components/static-pages/NetworkProbe";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "FAQ | BuySell Liberia",
  description:
    "Answers to common questions about using BuySell Liberia for buying and selling products and services.",
};

const fallbackFaqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is BuySell Liberia?",
        a: "BuySell Liberia is a marketplace to buy and sell products and services locally. Create an account, post listings, and connect with buyers or sellers.",
      },
      {
        q: "Do I need an account to use the site?",
        a: "You can browse without an account. You'll need an account to post listings, contact sellers, and manage favorites.",
      },
    ],
  },
  {
    category: "Posting & Managing Listings",
    items: [
      {
        q: "How do I post a listing?",
        a: "Go to the Sell page, fill in the details (title, category, price, photos), and publish. Your listing will appear after a quick review.",
      },
      {
        q: "How long do listings stay active?",
        a: "Listings remain active for 30 days by default. You can renew, edit, or delete them anytime from your dashboard.",
      },
      {
        q: "Can I feature my listing?",
        a: "Yes. Featured listings get priority placement in search and category pages. Look for the 'Feature' option on your listing.",
      },
    ],
  },
  {
    category: "Safety & Payments",
    items: [
      {
        q: "How do I stay safe when buying or selling?",
        a: "Meet in public places, verify items before paying, and avoid sharing sensitive information. Report suspicious activity from the listing page.",
      },
      {
        q: "Does BuySell Liberia handle payments?",
        a: "Some categories support manual payment verification. Otherwise, payment is arranged directly between buyer and seller.",
      },
    ],
  },
  {
    category: "Account & Support",
    items: [
      {
        q: "I forgot my password. What should I do?",
        a: "Use the 'Forgot password' link on the sign-in page to reset your password via email.",
      },
      {
        q: "How do I contact support?",
        a: "Use the Contact page or the 'Report' button on a listing. Our team will respond as soon as possible.",
      },
    ],
  },
];

async function fetchPage() {
  try {
    const init: RequestInit =
      process.env.NODE_ENV === "production"
        ? ({ next: { revalidate: 60 } } as any)
        : { cache: "no-store" };
    const base =
      (process.env.NEXT_PUBLIC_BASE_URL &&
        process.env.NEXT_PUBLIC_BASE_URL.trim()) ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const res = await fetch(`${base}/api/pages/faq`, init);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

type FAQGroup = { category: string; items: Array<{ q: string; a: string }> };

export default async function FAQPage() {
  const cms = await fetchPage();
  const groups: FAQGroup[] | null = cms?.data?.groups || null;

  // If CMS provides an HTML content (no structured groups), render it
  if (cms && !groups && cms.content) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
          <NetworkProbe slug="faq" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl text-center">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">❓</span>
                  <span className="text-sm font-semibold text-primary">
                    Help
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {cms.title || "Frequently Asked Questions"}
                </h1>
              </div>
            </section>
          </FadeIn>
          <FadeIn className="prose prose-zinc dark:prose-invert max-w-none">
            <div
              className="rounded-2xl border-2 border-border/40 bg-background/60 backdrop-blur p-6 md:p-10 shadow-xl"
              dangerouslySetInnerHTML={{ __html: cms.content }}
            />
          </FadeIn>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
        <NetworkProbe slug="faq" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl text-center">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">❓</span>
                <span className="text-sm font-semibold text-primary">Help</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Quick answers to the most common questions about using the
                marketplace.
              </p>
            </div>
          </section>
        </FadeIn>
        <section className="space-y-14">
          <FadeInStagger>
            {(groups || fallbackFaqs).map((group, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 p-6 shadow-xl"
              >
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent)]" />
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    {group.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {group.items.map((item, i) => (
                      <AccordionItem key={i} value={`${group.category}-${i}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </FadeInStagger>
        </section>
      </div>
    </main>
  );
}
