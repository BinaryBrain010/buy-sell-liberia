import { Metadata } from "next";
import { notFound } from "next/navigation";

async function fetchPage(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Privacy Policy | BuySell Liberia",
  description:
    "Learn how BuySell Liberia collects, uses, and protects your personal information.",
};

export default async function PrivacyPage() {
  const data = await fetchPage("privacy");
  if (data) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
        <h1>{data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </main>
    );
  }
  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account information (name, email, phone, username).</li>
        <li>Listing details (titles, descriptions, photos, location).</li>
        <li>Usage data (device, log data, interactions).</li>
        <li>Communications through the Platform (messages, reports).</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and improve the Platform and its features.</li>
        <li>Facilitate user-to-user communications and transactions.</li>
        <li>Prevent fraud, abuse, and ensure safety.</li>
        <li>Send service-related notices and updates.</li>
      </ul>

      <h2>3. Sharing of Information</h2>
      <p>
        We do not sell your personal information. We may share limited data with
        service providers (e.g., hosting, analytics) under strict agreements. We
        may also share information when required by law or to protect rights and
        safety.
      </p>

      <h2>4. Data Retention</h2>
      <p>
        We keep your data as long as your account is active or as needed to
        provide services and comply with legal obligations.
      </p>

      <h2>5. Security</h2>
      <p>
        We use reasonable safeguards to protect your information. However, no
        method of transmission or storage is 100% secure.
      </p>

      <h2>6. Cookies & Tracking</h2>
      <p>
        We use cookies and similar technologies to remember preferences, analyze
        usage, and improve the Platform. You can manage cookie preferences in
        your browser settings.
      </p>

      <h2>7. Your Rights</h2>
      <ul>
        <li>Access, update, or delete your account information.</li>
        <li>Request a copy of your data, where applicable.</li>
        <li>Opt out of non-essential communications.</li>
      </ul>

      <h2>8. Children’s Privacy</h2>
      <p>
        The Platform is not intended for children under 13. If you believe a
        child provided us information, contact us to remove it.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We encourage you to
        review it periodically.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this Privacy Policy? Contact us via the Contact page on
        the Platform.
      </p>
    </main>
  );
}
