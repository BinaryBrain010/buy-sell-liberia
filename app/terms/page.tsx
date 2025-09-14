import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | BuySell Liberia",
  description:
    "Read the Terms of Use for BuySell Liberia. Learn about acceptable use, listings, payments, safety, and more.",
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
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
        <li>Listings must be accurate, lawful, and placed in the correct category.</li>
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
        <li>Meet in public places where possible and verify items before paying.</li>
        <li>Report suspicious behavior using the reporting tools on listings.</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        You retain ownership of the content you post, but grant us a license to
        host and display it on the Platform. Do not post content you do not
        have rights to use.
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
