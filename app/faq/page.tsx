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
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <NetworkProbe slug="faq" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">Help</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{cms.title || "Frequently Asked Questions"}</h1>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </section>
        </FadeIn>
        <FadeIn className="prose prose-zinc dark:prose-invert max-w-none mt-10">
          <div dangerouslySetInnerHTML={{ __html: cms.content }} />
        </FadeIn>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <NetworkProbe slug="faq" />
      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">Help</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mt-2">Quick answers to the most common questions about using the marketplace.</p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <section className="mt-10 space-y-8">
        <FadeInStagger>
          {(groups || fallbackFaqs).map((group, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold mb-3">{group.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {group.items.map((item, i) => (
                  <AccordionItem key={i} value={`${group.category}-${i}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </FadeInStagger>
      </section>
    </main>
  );
}
