import { Metadata } from "next";
import { headers } from "next/headers";
import NetworkProbe from "@/components/static-pages/NetworkProbe";
import { FadeIn, FadeInStagger, AnimatedList } from "@/components/static-pages/Animated";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <NetworkProbe slug="terms" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">Policy</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{cms.title || "Terms of Use"}</h1>
              <p className="mt-2 text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </section>
        </FadeIn>

        <FadeIn className="prose prose-zinc dark:prose-invert max-w-none mt-10">
          <div
            dangerouslySetInnerHTML={{ __html: htmlFromData || cms.content }}
          />
        </FadeIn>
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
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <NetworkProbe slug="terms" />

        {/* Hero */}
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">Policy</Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{cms?.title || "Terms of Use"}</h1>
              <p className="mt-2 text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          </section>
        </FadeIn>

        {/* Content with TOC */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* TOC - hidden on small screens */}
          <aside className="hidden md:block">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">On this page</CardTitle>
                <CardDescription>Quickly navigate sections</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {toc.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Sections */}
          <section>
            <FadeInStagger className="space-y-6">
              {sections.map((s, idx) => (
                <Card key={idx} id={`section-${idx}`} className="scroll-mt-24">
                  <CardHeader>
                    <CardTitle>{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
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
      </main>
    );
  }

  // Fallback: original hardcoded content
  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <NetworkProbe slug="terms" />

      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">Policy</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Use</h1>
            <p className="mt-2 text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <aside className="hidden md:block">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">On this page</CardTitle>
              <CardDescription>Quickly navigate sections</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2 text-sm text-muted-foreground">
                <span className="block">1. Introduction</span>
                <span className="block">2. Eligibility & Account</span>
                <span className="block">3. Acceptable Use</span>
                <span className="block">4. Listings & Transactions</span>
                <span className="block">5. Safety</span>
                <span className="block">6. Intellectual Property</span>
                <span className="block">7. Disclaimers</span>
                <span className="block">8. Limitation of Liability</span>
                <span className="block">9. Termination</span>
                <span className="block">10. Changes to these Terms</span>
                <span className="block">11. Contact</span>
              </nav>
            </CardContent>
          </Card>
        </aside>

        <section>
          <FadeInStagger className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  Welcome to BuySell Liberia (the "Platform"). By accessing or using the Platform, you agree to these Terms of Use. If you do not agree, please do not use the Platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Eligibility & Account</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList
                  className="list-disc pl-6"
                  items={[
                    <span key="1">You must be at least 18 years old or have parental consent.</span>,
                    <span key="2">You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Acceptable Use</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList
                  className="list-disc pl-6"
                  items={[
                    <span key="1">No unlawful, fraudulent, or harmful activities.</span>,
                    <span key="2">No spam, misleading content, or impersonation.</span>,
                    <span key="3">No uploading of malicious code.</span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Listings & Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList
                  className="list-disc pl-6"
                  items={[
                    <span key="1">Listings must be accurate, lawful, and placed in the correct category.</span>,
                    <span key="2">Prohibited items/services are not allowed. We may remove listings that violate our policies.</span>,
                    <span key="3">Except where specified (e.g., manual payment verification), payments are arranged directly between buyer and seller.</span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList
                  className="list-disc pl-6"
                  items={[
                    <span key="1">Meet in public places where possible and verify items before paying.</span>,
                    <span key="2">Report suspicious behavior using the reporting tools on listings.</span>,
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  You retain ownership of the content you post, but grant us a license to host and display it on the Platform. Do not post content you do not have rights to use.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Disclaimers</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  The Platform is provided on an "as is" basis without warranties of any kind. We do not control user-generated listings nor guarantee transactions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  We may suspend or terminate accounts that violate these Terms. You may also delete your account at any time through your settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Changes to these Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  We may update these Terms occasionally. Continued use after changes constitutes acceptance of the updated Terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Contact</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                <p>
                  Questions about these Terms? Contact us via the Contact page on the Platform.
                </p>
              </CardContent>
            </Card>
          </FadeInStagger>
        </section>
      </div>
    </main>
  );
}
