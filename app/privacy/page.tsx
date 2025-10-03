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
        <FadeIn className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="rounded-2xl border-2 border-border/40 bg-background/60 backdrop-blur p-6 md:p-10 shadow-xl">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                This Privacy Policy explains how BuySell Liberia ("we", "our",
                or "us") collects, uses, and protects your information.
              </p>
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    1. Information We Collect
                  </h2>
                  <p className="mb-2">We may collect:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name, phone number, and email address</li>
                    <li>Location (optional)</li>
                    <li>Listings you post and messages you send</li>
                    <li>IP address, browser type, and device information</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    2. How We Use Your Data
                  </h2>
                  <p className="mb-2">We use your data to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Create and manage your account</li>
                    <li>Display your listings and content</li>
                    <li>Enable communication between users</li>
                    <li>Improve and secure our platform</li>
                    <li>Notify you of updates or changes</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    3. Sharing of Data
                  </h2>
                  <p className="mb-2">
                    We do not sell your personal data. We may share it only:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      With third-party tools we use (e.g., Firebase,
                      authentication services)
                    </li>
                    <li>With law enforcement if legally required</li>
                    <li>With payment processors if integrated in the future</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    4. Cookies & Tracking
                  </h2>
                  <p>
                    We may use cookies and analytics tools to understand user
                    behavior and improve the platform.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    5. Data Retention
                  </h2>
                  <p>
                    We retain your data as long as your account is active, or as
                    required for legal, regulatory, or security purposes.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Access or correct your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Security</h2>
                  <p>
                    We take steps to protect your information, but no platform
                    is completely secure. Use strong passwords and report any
                    suspicious activity immediately.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    8. Children’s Privacy
                  </h2>
                  <p>
                    Our platform is not intended for users under 13. If you
                    believe a child is using the platform, please contact us.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">
                    9. Changes to Privacy Policy
                  </h2>
                  <p>
                    We may update this policy periodically. Continued use of the
                    platform means you accept the latest version.
                  </p>
                </section>
                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                  <p>support@buysellliberia.com</p>
                </section>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
