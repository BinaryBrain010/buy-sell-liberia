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
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <NetworkProbe slug="privacy" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">
                Policy
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {cms.title || "Privacy Policy"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Last updated: {new Date().getFullYear()}
              </p>
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

  // If CMS provides structured sections
  if (sections && sections.length > 0) {
    const toc = sections.map((s, i) => ({
      id: `section-${i}`,
      title: s.title || `Section ${i + 1}`,
    }));
    return (
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <NetworkProbe slug="privacy" />
        <FadeIn>
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
            <div className="relative z-10">
              <Badge className="mb-3" variant="secondary">
                Policy
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {cms?.title || "Privacy Policy"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Last updated: {new Date().getFullYear()}
              </p>
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
      <NetworkProbe slug="privacy" />

      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">
              Policy
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-muted-foreground">
              Last updated: {new Date().getFullYear()}
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <section className="mt-10">
        <FadeInStagger className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedList
                className="list-disc pl-6"
                items={[
                  <span key="1">
                    Account information (name, email, phone, username).
                  </span>,
                  <span key="2">
                    Listing details (titles, descriptions, photos, location).
                  </span>,
                  <span key="3">
                    Usage data (device, log data, interactions).
                  </span>,
                  <span key="4">
                    Communications through the Platform (messages, reports).
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedList
                className="list-disc pl-6"
                items={[
                  <span key="1">
                    Provide and improve the Platform and its features.
                  </span>,
                  <span key="2">
                    Facilitate user-to-user communications and transactions.
                  </span>,
                  <span key="3">Prevent fraud, abuse, and ensure safety.</span>,
                  <span key="4">
                    Send service-related notices and updates.
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Sharing of Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                We do not sell your personal information. We may share limited
                data with service providers (e.g., hosting, analytics) under
                strict agreements. We may also share information when required
                by law or to protect rights and safety.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                We keep your data as long as your account is active or as needed
                to provide services and comply with legal obligations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                We use reasonable safeguards to protect your information.
                However, no method of transmission or storage is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                We use cookies and similar technologies to remember preferences,
                analyze usage, and improve the Platform. You can manage cookie
                preferences in your browser settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedList
                className="list-disc pl-6"
                items={[
                  <span key="1">
                    Access, update, or delete your account information.
                  </span>,
                  <span key="2">
                    Request a copy of your data, where applicable.
                  </span>,
                  <span key="3">Opt out of non-essential communications.</span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Children’s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                The Platform is not intended for children under 13. If you
                believe a child provided us information, contact us to remove
                it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to this Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We
                encourage you to review it periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
              <p>
                Questions about this Privacy Policy? Contact us via the Contact
                page on the Platform.
              </p>
            </CardContent>
          </Card>
        </FadeInStagger>
      </section>
    </main>
  );
}
