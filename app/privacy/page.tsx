import { Metadata } from "next";
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
  title: "Privacy Policy | BuySell Liberia",
  description:
    "Learn how BuySell Liberia collects, uses, and protects your personal information.",
};

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
    const res = await fetch(`${base}/api/pages/privacy`, init);
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

export default async function PrivacyPage() {
  const cms = await fetchPage();
  const sections: Section[] | null = cms?.data?.sections || null;

  // If CMS provides an HTML content (no structured sections), render it directly
  if (cms && !sections && cms.content) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto max-w-6xl md:max-w-7xl px-4 py-10">
          <NetworkProbe slug="privacy" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm font-semibold text-primary">
                    Policy
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {cms.title || "Privacy Policy"}
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
              dangerouslySetInnerHTML={{ __html: cms.content }}
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
          <NetworkProbe slug="privacy" />
          <FadeIn>
            <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm font-semibold text-primary">
                    Policy
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  {cms?.title || "Privacy Policy"}
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
        <NetworkProbe slug="privacy" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 md:p-16 mb-12 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-gradient-to-br from-v0-green/25 to-transparent blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-v0-orange/20 to-transparent blur-2xl" />
            </div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-v0-green/10 border border-primary/20 mb-6">
                <span className="text-2xl">🔒</span>
                <span className="text-sm font-semibold text-primary">
                  Policy
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="mt-2 text-muted-foreground text-sm md:text-base">
                Last updated: {new Date().getFullYear()}
              </p>
            </div>
          </section>
        </FadeIn>
        <FadeInStagger className="space-y-8">
          {[
            {
              title: "1. Information We Collect",
              list: [
                "Account information (name, email, phone, username).",
                "Listing details (titles, descriptions, photos, location).",
                "Usage data (device, log data, interactions).",
                "Communications through the Platform (messages, reports).",
              ],
            },
            {
              title: "2. How We Use Your Information",
              list: [
                "Provide and improve the Platform and its features.",
                "Facilitate user-to-user communications and transactions.",
                "Prevent fraud, abuse, and ensure safety.",
                "Send service-related notices and updates.",
              ],
            },
            {
              title: "3. Sharing of Information",
              body: (
                <p>
                  We do not sell your personal information. We may share limited
                  data with service providers (e.g., hosting, analytics) under
                  strict agreements. We may also share information when required
                  by law or to protect rights and safety.
                </p>
              ),
            },
            {
              title: "4. Data Retention",
              body: (
                <p>
                  We keep your data as long as your account is active or as
                  needed to provide services and comply with legal obligations.
                </p>
              ),
            },
            {
              title: "5. Security",
              body: (
                <p>
                  We use reasonable safeguards to protect your information.
                  However, no method of transmission or storage is 100% secure.
                </p>
              ),
            },
            {
              title: "6. Cookies & Tracking",
              body: (
                <p>
                  We use cookies and similar technologies to remember
                  preferences, analyze usage, and improve the Platform. You can
                  manage cookie preferences in your browser settings.
                </p>
              ),
            },
            {
              title: "7. Your Rights",
              list: [
                "Access, update, or delete your account information.",
                "Request a copy of your data, where applicable.",
                "Opt out of non-essential communications.",
              ],
            },
            {
              title: "8. Children’s Privacy",
              body: (
                <p>
                  The Platform is not intended for children under 13. If you
                  believe a child provided us information, contact us to remove
                  it.
                </p>
              ),
            },
            {
              title: "9. Changes to this Policy",
              body: (
                <p>
                  We may update this Privacy Policy from time to time. We
                  encourage you to review it periodically.
                </p>
              ),
            },
            {
              title: "10. Contact",
              body: (
                <p>
                  Questions about this Privacy Policy? Contact us via the
                  Contact page on the Platform.
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
      </div>
    </main>
  );
}
