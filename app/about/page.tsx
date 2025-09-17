"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaHandshake, FaRocket, FaUsers } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

type AboutData = {
  hero?: { title?: string; subtitle?: string };
  sections?: Array<{ icon?: string; title: string; text: string }>;
  coreValues?: string[];
};

export default function AboutPage() {
  type PagePayload = {
    exists?: boolean;
    title?: string;
    content?: string;
    data?: AboutData;
  };
  const [page, setPage] = useState<PagePayload | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/pages/about", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.exists) setPage(json);
      } catch {}
    };
    load();
  }, []);

  const iconMap: Record<string, JSX.Element> = {
    rocket: <FaRocket className="text-primary w-8 h-8 mx-auto mb-3" />,
    verified: <MdVerified className="text-primary w-8 h-8 mx-auto mb-3" />,
    users: <FaUsers className="text-primary w-8 h-8 mx-auto mb-3" />,
    handshake: <FaHandshake className="text-primary w-8 h-8 mx-auto mb-3" />,
  };

  // If CMS provided pure HTML content (no structured data), render that page instead
  if (page && !page.data && page.content) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16 prose prose-zinc dark:prose-invert">
        <h1>{page.title || "About BuySell"}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </main>
    );
  }

  const heroTitle = page?.data?.hero?.title || (
    <>
      About <span className="text-primary">BuySell</span>
    </>
  );
  const heroSubtitle =
    page?.data?.hero?.subtitle ||
    "BuySell is a modern marketplace platform where users can buy, sell, and explore a wide variety of products — all in one place.";

  const sections = page?.data?.sections || [
    {
      icon: "rocket",
      title: "Our Mission",
      text: "To empower individuals and businesses to buy and sell safely, easily, and efficiently through an intuitive digital experience.",
    },
    {
      icon: "verified",
      title: "Our Vision",
      text: "To become the most trusted and accessible digital marketplace in the region, enabling growth and opportunity for all.",
    },
    {
      icon: "users",
      title: "Our Community",
      text: "We value transparency, trust, and inclusion — creating a safe and vibrant environment for all our users.",
    },
  ];

  const coreValues = page?.data?.coreValues || [
    "Integrity",
    "Innovation",
    "Customer First",
    "Accountability",
    "Simplicity",
  ];

  return (
    <div className="min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 py-12 bg-background text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">{heroTitle}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {heroSubtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {sections.map((s, i) => (
          <div key={i} className="glass p-6 rounded-2xl shadow-lg text-center">
            {s.icon && iconMap[s.icon]}
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </motion.div>

      <div className="mt-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-6"
        >
          Our Core Values
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {coreValues.map((value, i) => (
            <div
              key={i}
              className="glass px-5 py-3 rounded-xl shadow-md text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              {value}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
