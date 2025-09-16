import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact Us | BuySell Liberia",
  description: "Get in touch with the BuySell Liberia team for support, feedback, or inquiries.",
};

export default function ContactPage() {
  // Using a mailto action avoids backend dependencies. Replace with a real API later if needed.
  const mailto =
    "mailto:info@buysell.com?subject=" +
    encodeURIComponent("BuySell Liberia Support") +
    "&body=" +
    encodeURIComponent("Please include your name and details of your request.");

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground">We'd love to hear from you. Reach out and we'll respond as soon as we can.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={mailto} method="post" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your full name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Write your message..." className="min-h-[120px]" required />
              </div>
              <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                Send Message
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@buysell.com</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Global Marketplace</div>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Helpful Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Before reaching out, you might find answers here:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><a className="underline" href="/faq">FAQ</a></li>
                <li><a className="underline" href="/safety">Safety Tips</a></li>
                <li><a className="underline" href="/help">Help Center</a></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
