"use client";

import { useEffect } from "react";

export default function NetworkProbe({ slug }: { slug: string }) {
  useEffect(() => {
    // Trigger a client-side fetch so it shows up in the browser Network tab
    fetch(`/api/pages/${slug}`, { cache: "no-store" }).catch(() => {});
  }, [slug]);
  return null;
}
