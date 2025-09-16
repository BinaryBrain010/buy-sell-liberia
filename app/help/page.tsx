import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Help Center | BuySell Liberia",
  description:
    "Find answers about buying, selling, safety, and account help on BuySell Liberia.",
};

async function fetchPage(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pages/${slug}`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

type HelpData = {
  blocks?: Array<{ icon?: string; title: string; text: string }>;
};

export default async function HelpPage() {
  const data = await fetchPage("help");
  const blocks: HelpData["blocks"] | undefined = data?.data?.blocks;

  // If CMS provides structured blocks, render them as cards
  if (Array.isArray(blocks) && blocks.length > 0) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Guides and tips to get the most out of BuySell Liberia.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blocks.map((b, i) => (
            <Card key={i} className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {b.icon || "❓"}
                  </span>
                  {b.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {b.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/contact" className="underline">
            Still need help? Contact us
          </Link>
        </div>
      </main>
    );
  }

  // If CMS has a static HTML page, render it
  if (data && !blocks) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16 prose prose-zinc dark:prose-invert">
        <h1>{data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </main>
    );
  }

  // Default static Help Center
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">
          Everything you need to know about buying and selling safely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ol className="list-decimal pl-5 space-y-1">
              <li>Create an account or sign in</li>
              <li>Browse categories or search for items</li>
              <li>Message sellers to ask questions</li>
              <li>Meet safely to inspect and buy</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Buying on BuySell Liberia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Check photos and description carefully</li>
              <li>Ask for proof of ownership or receipts when relevant</li>
              <li>Agree on a safe meeting place and payment method</li>
              <li>Report suspicious listings or messages</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Selling Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Use clear photos from multiple angles</li>
              <li>Write accurate titles and detailed descriptions</li>
              <li>Respond promptly to buyer inquiries</li>
              <li>Meet in public places and verify payment</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Never share sensitive personal information</li>
              <li>Avoid advance payments and gift cards</li>
              <li>Trust your instincts and walk away if unsure</li>
            </ul>
            <p>
              Read our{" "}
              <Link href="/safety" className="underline">
                Safety Tips
              </Link>{" "}
              for more.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>FAQs and More</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <p>
              Looking for answers to common questions? Visit our{" "}
              <Link href="/faq" className="underline">
                FAQ
              </Link>
              . Still need help?{" "}
              <Link href="/contact" className="underline">
                Contact us
              </Link>{" "}
              and we'll get back to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
