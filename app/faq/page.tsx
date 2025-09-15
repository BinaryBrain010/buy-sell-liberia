import { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
	title: "FAQ | BuySell Liberia",
	description: "Answers to common questions about using BuySell Liberia for buying and selling products and services.",
};

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

type FAQItem = { q: string; a: string };

type FAQGroup = { category: string; items: FAQItem[] };

const faqs: FAQGroup[] = [
	{
		category: "Getting Started",
		items: [
			{
				q: "What is BuySell Liberia?",
				a: "BuySell Liberia is a marketplace to buy and sell products and services locally. Create an account, post listings, and connect with buyers or sellers.",
			},
			{
				q: "Do I need an account to use the site?",
				a: "You can browse without an account. You'll need an account to post listings, contact sellers, and manage favorites.",
			},
		],
	},
	{
		category: "Posting & Managing Listings",
		items: [
			{
				q: "How do I post a listing?",
				a: "Go to the Sell page, fill in the details (title, category, price, photos), and publish. Your listing will appear after a quick review.",
			},
			{
				q: "How long do listings stay active?",
				a: "Listings remain active for 30 days by default. You can renew, edit, or delete them anytime from your dashboard.",
			},
					{
						q: "Can I feature my listing?",
						a: "Yes. Featured listings get priority placement in search and category pages. Look for the 'Feature' option on your listing.",
					},
		],
	},
	{
		category: "Safety & Payments",
		items: [
			{
				q: "How do I stay safe when buying or selling?",
				a: "Meet in public places, verify items before paying, and avoid sharing sensitive information. Report suspicious activity from the listing page.",
			},
			{
				q: "Does BuySell Liberia handle payments?",
				a: "Some categories support manual payment verification. Otherwise, payment is arranged directly between buyer and seller.",
			},
		],
	},
	{
		category: "Account & Support",
		items: [
			{
				q: "I forgot my password. What should I do?",
				a: "Use the 'Forgot password' link on the sign-in page to reset your password via email.",
			},
			{
				q: "How do I contact support?",
				a: "Use the Contact page or the 'Report' button on a listing. Our team will respond as soon as possible.",
			},
		],
	},
];

export default async function FAQPage() {
	const db = await fetchPage("faq");
	const groups: FAQGroup[] = db?.data?.groups || faqs;
	const title = db?.title || "Frequently Asked Questions";
	return (
		<main className="container mx-auto max-w-4xl px-4 py-10">
			<section className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				<p className="text-muted-foreground mt-2">
					Quick answers to the most common questions about using the marketplace.
				</p>
			</section>

			<div className="space-y-8">
				{groups.map((group, idx) => (
					<div key={idx}>
						<h2 className="text-xl font-semibold mb-3">{group.category}</h2>
						<Accordion type="single" collapsible className="w-full">
							{group.items.map((item, i) => (
								<AccordionItem key={i} value={`${group.category}-${i}`}>
									<AccordionTrigger>{item.q}</AccordionTrigger>
									<AccordionContent>{item.a}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				))}
			</div>
		</main>
	);
}

