import type { Metadata } from "next";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | BuySell Liberia",
  description:
    "Get in touch with the BuySell Liberia team for support, feedback, or inquiries.",
};

type ContactData = {
  hero?: { title?: string; subtitle?: string };
  details?: Array<{ type: string; label?: string; value: string }>;
};

async function fetchPage() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pages/contact`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const data = await fetchPage();
  const heroTitle = data?.data?.hero?.title || "Contact Us";
  const heroSubtitle =
    data?.data?.hero?.subtitle ||
    "We'd love to hear from you. Reach out and we'll respond as soon as we can.";
  const details: ContactData["details"] = data?.data?.details || [
    { type: "email", value: "info@buysell.com" },
    { type: "phone", value: "+1 (555) 123-4567" },
    { type: "location", value: "Global Marketplace" },
  ];

  const iconFor = (t: string) => {
    switch (t) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">{heroTitle}</h1>
        <p className="text-muted-foreground">{heroSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {(details || []).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  {iconFor(d.type)} {d.label || d.value}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader>
              <CardTitle>Helpful Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Before reaching out, you might find answers here:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <a className="underline" href="/faq">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="underline" href="/safety">
                    Safety Tips
                  </a>
                </li>
                <li>
                  <a className="underline" href="/help">
                    Help Center
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
