import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FadeIn,
  FadeInStagger,
  AnimatedList,
} from "@/components/static-pages/Animated";
import { Badge } from "@/components/ui/badge";
import NetworkProbe from "@/components/static-pages/NetworkProbe";

export const metadata: Metadata = {
  title: "Disclaimer | BuySell Liberia",
  description:
    "Read the BuySell Liberia disclaimer covering marketplace terms, responsibilities, and limitations of liability.",
};

export default function DisclaimerPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <NetworkProbe slug="disclaimer" />
      <FadeIn>
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-8 md:p-12 text-center">
          <div className="relative z-10">
            <Badge className="mb-3" variant="secondary">
              Policy
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Disclaimer
            </h1>
            <p className="text-muted-foreground mt-2">
              Please review this information carefully. Using our platform means
              you agree to these terms.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        </section>
      </FadeIn>

      <section className="mt-10 space-y-8">
        <FadeInStagger>
          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                BuySell Liberia is an online marketplace that connects buyers
                and sellers. We do not own, manufacture, or inspect items listed
                on the platform. Listings, descriptions, prices, and
                availability are provided by sellers.
              </p>
              <p>
                We strive for accuracy, but we cannot guarantee that listings or
                communications are error-free, complete, or current. Use your
                best judgment and verify details before making a purchase.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Transactions and Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                All transactions are directly between buyers and sellers.
                BuySell Liberia is not a party to any transaction and does not
                provide warranties of any kind for listed items.
              </p>
              <AnimatedList
                className="list-disc pl-5 space-y-2"
                items={[
                  <span key="1">
                    Meet in safe, public locations whenever possible.
                  </span>,
                  <span key="2">
                    Verify item condition and authenticity before paying.
                  </span>,
                  <span key="3">
                    Beware of suspicious requests (e.g., upfront payments, gift
                    cards, or off-platform communications).
                  </span>,
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                To the fullest extent permitted by law, BuySell Liberia and its
                affiliates are not liable for any direct, indirect, incidental,
                consequential, or punitive damages resulting from your use of
                the platform.
              </p>
              <p>
                We may suspend or remove content or accounts that violate our
                policies. We reserve the right to modify or discontinue services
                at any time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Reporting and Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                If you encounter suspicious activity, scams, or policy
                violations, please report it immediately using the report
                buttons on listings or via our contact page.
              </p>
              <p>
                For more information, see our{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link href="/terms" className="underline">
                  Terms of Service
                </Link>
                , and{" "}
                <Link href="/safety" className="underline">
                  Safety Tips
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </FadeInStagger>
      </section>
    </main>
  );
}
