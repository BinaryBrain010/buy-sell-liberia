import { Metadata } from "next";
import { headers } from "next/headers";
import NetworkProbe from "@/components/static-pages/NetworkProbe";
import {
  FadeIn,
  FadeInStagger,
  AnimatedList,
} from "@/components/static-pages/Animated";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Use | BuySell Liberia",
  description:
    "Read the Terms of Use for BuySell Liberia. Learn about acceptable use, listings, payments, safety, and more.",
};

// Ensure this page is rendered dynamically so it always reflects CMS updates
export const dynamic = "force-dynamic";

async function fetchPage() {
  try {
    const init: RequestInit =
      process.env.NODE_ENV === "production"
        ? { next: { revalidate: 60 } as any }
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
    const res = await fetch(`${base}/api/pages/terms`, init);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

type Section = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export default async function TermsPage() {
  const cms = await fetchPage();
  // Normalize possible data shapes
  let sections: Section[] | null = null;
  const data = cms?.data;
  if (Array.isArray(data)) {
    sections = data as Section[];
  } else if (data?.sections && Array.isArray(data.sections)) {
    sections = data.sections as Section[];
  } else if (
    data &&
    (Array.isArray((data as any).list) ||
      Array.isArray((data as any).paragraphs))
  ) {
    const s: Section = {
      title: (data as any).title || "Terms",
      paragraphs: (data as any).paragraphs || undefined,
      list: (data as any).list || undefined,
    };
    sections = [s];
  }

  const htmlFromData: string | null =
    (typeof data?.content === "string" && data.content.trim()
      ? data.content
      : typeof (data as any)?.html === "string" && (data as any).html.trim()
      ? (data as any).html
      : null) || null;

  // If CMS provides an HTML content (no structured sections), render it directly
  if (cms && !sections && (cms.content || htmlFromData)) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
          <NetworkProbe slug="terms" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">📜</span>
                  <span className="text-sm font-semibold text-primary">
                    Policy
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {cms.title || "Terms of Use"}
                </h1>
                <p className="mt-2 text-muted-foreground text-sm md:text-base">
                  Last updated: {new Date().getFullYear()}
                </p>
              </div>
            </section>
          </FadeIn>
          <FadeIn className="prose prose-zinc dark:prose-invert max-w-none">
            <div
              className="rounded-2xl border-2 border-border/40 bg-background/60 backdrop-blur p-6 md:p-10 shadow-xl"
              dangerouslySetInnerHTML={{ __html: htmlFromData || cms.content }}
            />
          </FadeIn>
        </div>
      </main>
    );
  }

  // If CMS provides structured sections
  if (sections && sections.length > 0) {
    const toc = sections.map((s, i) => ({
      id: `section-${i}`,
      title: s.title || `Section ${i + 1}`,
    }));
    return (
      <main className="min-h-screen">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
          <NetworkProbe slug="terms" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">📜</span>
                  <span className="text-sm font-semibold text-primary">
                    Policy
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {cms?.title || "Terms of Use"}
                </h1>
                <p className="mt-2 text-muted-foreground text-sm md:text-base">
                  Last updated: {new Date().getFullYear()}
                </p>
              </div>
            </section>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
            <aside className="hidden md:block">
              <Card className="sticky top-24 border-2 border-border/40 bg-background/60 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">On this page</CardTitle>
                  <CardDescription>Quick navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {toc.map((t) => (
                      <a
                        key={t.id}
                        href={`#${t.id}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t.title}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>
            <section>
              <FadeInStagger className="space-y-8">
                {sections.map((s, idx) => (
                  <Card
                    key={idx}
                    id={`section-${idx}`}
                    className="scroll-mt-32 relative overflow-hidden border-2 border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 shadow-xl"
                  >
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent)]" />
                    <CardHeader className="relative z-10 pb-3">
                      <CardTitle className="text-xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {s.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 prose prose-zinc dark:prose-invert max-w-none">
                      {s.paragraphs?.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {s.list && s.list.length > 0 && (
                        <AnimatedList
                          className="list-disc pl-6"
                          items={s.list.map((item, i) => (
                            <span key={i}>{item}</span>
                          ))}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </FadeInStagger>
            </section>
          </div>
        </div>
      </main>
    );
  }

  // Fallback: original hardcoded content
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
        <NetworkProbe slug="terms" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">📜</span>
                <span className="text-sm font-semibold text-primary">
                  Policy
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Terms of Use
              </h1>
              <p className="mt-2 text-muted-foreground text-sm md:text-base">
                Last updated: {new Date().getFullYear()}
              </p>
            </div>
          </section>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          <aside className="hidden md:block">
            <Card className="sticky top-24 border-2 border-border/40 bg-background/60 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">On this page</CardTitle>
                <CardDescription>Quick navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2 text-sm">
                  <span className="block hover:text-primary transition-colors">
                    1. Introduction
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    2. Eligibility & Account
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    3. Acceptable Use
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    4. Listings & Transactions
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    5. Safety
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    6. Intellectual Property
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    7. Disclaimers
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    8. Limitation of Liability
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    9. Termination
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    10. Changes to these Terms
                  </span>
                  <span className="block hover:text-primary transition-colors">
                    11. Contact
                  </span>
                </nav>
              </CardContent>
            </Card>
          </aside>
          <section>
            <FadeInStagger className="space-y-8">
              {[
                {
                  title: "1. Introduction",
                  body: (
                    <p>
                      Welcome to BuySell Liberia (the "Platform"). By accessing
                      or using the Platform, you agree to these Terms of Use. If
                      you do not agree, please do not use the Platform.
                    </p>
                  ),
                },
                {
                  title: "2. Eligibility & Account",
                  list: [
                    "You must be at least 18 years old or have parental consent.",
                    "You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.",
                  ],
                },
                {
                  title: "3. Acceptable Use",
                  list: [
                    "No unlawful, fraudulent, or harmful activities.",
                    "No spam, misleading content, or impersonation.",
                    "No uploading of malicious code.",
                  ],
                },
                {
                  title: "4. Listings & Transactions",
                  list: [
                    "Listings must be accurate, lawful, and placed in the correct category.",
                    "Prohibited items/services are not allowed. We may remove listings that violate our policies.",
                    "Except where specified (e.g., manual payment verification), payments are arranged directly between buyer and seller.",
                  ],
                },
                {
                  title: "5. Safety",
                  list: [
                    "Meet in public places where possible and verify items before paying.",
                    "Report suspicious behavior using the reporting tools on listings.",
                  ],
                },
                {
                  title: "6. Intellectual Property",
                  body: (
                    <p>
                      You retain ownership of the content you post, but grant us
                      a license to host and display it on the Platform. Do not
                      post content you do not have rights to use.
                    </p>
                  ),
                },
                {
                  title: "7. Disclaimers",
                  body: (
                    <p>
                      The Platform is provided on an "as is" basis without
                      warranties of any kind. We do not control user-generated
                      listings nor guarantee transactions.
                    </p>
                  ),
                },
                {
                  title: "8. Limitation of Liability",
                  body: (
                    <p>
                      To the maximum extent permitted by law, we are not liable
                      for indirect, incidental, or consequential damages arising
                      from your use of the Platform.
                    </p>
                  ),
                },
                {
                  title: "9. Termination",
                  body: (
                    <p>
                      We may suspend or terminate accounts that violate these
                      Terms. You may also delete your account at any time
                      through your settings.
                    </p>
                  ),
                },
                {
                  title: "10. Changes to these Terms",
                  body: (
                    <p>
                      We may update these Terms occasionally. Continued use
                      after changes constitutes acceptance of the updated Terms.
                    </p>
                  ),
                },
                {
                  title: "11. Contact",
                  body: (
                    <p>
                      Questions about these Terms? Contact us via the Contact
                      page on the Platform.
                    </p>
                  ),
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
                  <CardContent className="relative z-10 prose prose-zinc dark:prose-invert max-w-none">
                    {sec.body}
                    {sec.list && (
                      <AnimatedList
                        className="list-disc pl-6"
                        items={sec.list.map((item, idx2) => (
                          <span key={idx2}>{item}</span>
                        ))}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </FadeInStagger>
          </section>
        </div>
      </div>
    </main>
  );
}
