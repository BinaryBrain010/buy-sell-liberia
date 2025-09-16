import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Safety Tips | BuySell Liberia",
  description:
    "Stay safe while buying and selling on BuySell Liberia. Read our meeting, payment, and fraud prevention tips.",
};

export default function SafetyPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Safety Tips</h1>
        <p className="text-muted-foreground">
          Practical advice to help you buy and sell safely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Meeting In-Person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Meet in public, well-lit places and, if possible, bring a
                friend.
              </li>
              <li>
                Share your meeting details and location with someone you trust.
              </li>
              <li>Inspect the item thoroughly before paying.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Avoid advance payments or gift cards.</li>
              <li>Use secure, traceable payment methods where possible.</li>
              <li>Verify funds have cleared before handing over the item.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Fraud Awareness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Be cautious of deals that seem too good to be true.</li>
              <li>Watch for pressure to move conversations off-platform.</li>
              <li>Never share sensitive personal or banking information.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle>Reporting & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>
              If you encounter suspicious activity, scams, or policy violations,
              report the listing or contact our team.
            </p>
            <p>
              Visit our{" "}
              <Link href="/help" className="underline">
                Help Center
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline">
                Contact Us
              </Link>{" "}
              for assistance.
            </p>
            <p className="text-xs">
              In an emergency or if you feel unsafe, contact local authorities
              immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
