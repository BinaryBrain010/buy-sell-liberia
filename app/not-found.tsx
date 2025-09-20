"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Compass, Mail, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.25),transparent_45%)]" />

      {/* Floating shapes */}
      <motion.div
        aria-hidden
        className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-2xl"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            404 — Page not found
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Lost in the marketplace?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            The page you’re looking for doesn’t exist or has moved. Try a quick
            search or head back to familiar places.
          </p>
        </motion.div>

        {/* Quick search */}
        <motion.form
          onSubmit={onSearch}
          className="mt-6 flex items-center gap-2 mx-auto max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </motion.form>

        {/* Actions */}
        <motion.div
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur px-4 py-2 text-sm font-medium hover:border-blue-400 hover:bg-white dark:hover:bg-gray-900"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Home
          </Link>
          <Link
            href="/products"
            className="group inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur px-4 py-2 text-sm font-medium hover:border-blue-400 hover:bg-white dark:hover:bg-gray-900"
          >
            <Compass className="h-4 w-4" />
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur px-4 py-2 text-sm font-medium hover:border-blue-400 hover:bg-white dark:hover:bg-gray-900"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </motion.button>
      </div>
    </div>
  );
}
