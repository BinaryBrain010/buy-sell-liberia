import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Disclaimer | BuySell Liberia",
  description:
    "Read the BuySell Liberia disclaimer covering marketplace terms, responsibilities, and limitations of liability.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Disclaimer</h1>
            <p className="text-muted-foreground">
              Please review this information carefully. Using our platform means you agree to these terms.
            </p>
          </div>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                BuySell Liberia is an online marketplace that connects buyers and sellers. We do not own, manufacture,
                or inspect items listed on the platform. Listings, descriptions, prices, and availability are provided by sellers.
              </p>
              <p>
                We strive for accuracy, but we cannot guarantee that listings or communications are error-free, complete,
                or current. Use your best judgment and verify details before making a purchase.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Transactions and Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                All transactions are directly between buyers and sellers. BuySell Liberia is not a party to any transaction and
                does not provide warranties of any kind for listed items.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Meet in safe, public locations whenever possible.</li>
                <li>Verify item condition and authenticity before paying.</li>
                <li>Beware of suspicious requests (e.g., upfront payments, gift cards, or off-platform communications).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                To the fullest extent permitted by law, BuySell Liberia and its affiliates are not liable for any direct,
                indirect, incidental, consequential, or punitive damages resulting from your use of the platform.
              </p>
              <p>
                We may suspend or remove content or accounts that violate our policies. We reserve the right to modify
                or discontinue services at any time.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader>
              <CardTitle>Reporting and Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>
                If you encounter suspicious activity, scams, or policy violations, please report it immediately using the
                report buttons on listings or via our contact page.
              </p>
              <p>
                For more information, see our {" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>, {" "}
                <Link href="/terms" className="underline">Terms of Service</Link>, and {" "}
                <Link href="/safety" className="underline">Safety Tips</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
