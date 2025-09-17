import { Metadata } from "next";
import { headers } from "next/headers";
import NetworkProbe from "@/components/static-pages/NetworkProbe";

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
      <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
        <NetworkProbe slug="terms" />
        <h1>{cms.title || "Terms of Use"}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: htmlFromData || cms.content }}
        />
      </main>
    );
  }

  // If CMS provides structured sections
  if (sections && sections.length > 0) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
        <NetworkProbe slug="terms" />
        <h1>{cms?.title || "Terms of Use"}</h1>
        <p>Last updated: {new Date().getFullYear()}</p>
        {sections.map((s, idx) => (
          <section key={idx}>
            <h2>{s.title}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.list && s.list.length > 0 && (
              <ul>
                {s.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
    );
  }

  // Fallback: original hardcoded content
  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <NetworkProbe slug="terms" />
      <h1>Terms of Use</h1>
      <p>Last updated: {new Date().getFullYear()}</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to BuySell Liberia (the "Platform"). By accessing or using the
        Platform, you agree to these Terms of Use. If you do not agree, please
        do not use the Platform.
      </p>

      <h2>2. Eligibility & Account</h2>
      <ul>
        <li>You must be at least 18 years old or have parental consent.</li>
        <li>
          You are responsible for maintaining the confidentiality of your
          account credentials and all activities under your account.
        </li>
      </ul>

      <h2>3. Acceptable Use</h2>
      <ul>
        <li>No unlawful, fraudulent, or harmful activities.</li>
        <li>No spam, misleading content, or impersonation.</li>
        <li>No uploading of malicious code.</li>
      </ul>

      <h2>4. Listings & Transactions</h2>
      <ul>
        <li>
          Listings must be accurate, lawful, and placed in the correct category.
        </li>
        <li>
          Prohibited items/services are not allowed. We may remove listings that
          violate our policies.
        </li>
        <li>
          Except where specified (e.g., manual payment verification), payments
          are arranged directly between buyer and seller.
        </li>
      </ul>

      <h2>5. Safety</h2>
      <ul>
        <li>
          Meet in public places where possible and verify items before paying.
        </li>
        <li>
          Report suspicious behavior using the reporting tools on listings.
        </li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        You retain ownership of the content you post, but grant us a license to
        host and display it on the Platform. Do not post content you do not have
        rights to use.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Platform is provided on an "as is" basis without warranties of any
        kind. We do not control user-generated listings nor guarantee
        transactions.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect,
        incidental, or consequential damages arising from your use of the
        Platform.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms. You may
        also delete your account at any time through your settings.
      </p>

      <h2>10. Changes to these Terms</h2>
      <p>
        We may update these Terms occasionally. Continued use after changes
        constitutes acceptance of the updated Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Contact us via the Contact page on the
        Platform.
      </p>
    </main>
  );
}
