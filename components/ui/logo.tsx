"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LogoMain } from "@/lib/media";

interface LogoApiResponse {
  logoUrl?: string;
  hasLogo?: boolean;
  error?: string;
}

// Public (unauthenticated) fetch wrapper: the admin logo route currently requires auth token.
// If unauthenticated access is desired, consider adding a public proxy route (e.g. /api/logo-public).
// For now we attempt fetch without token; if 401/403 returned we silently fall back.

export default function Logo() {
  const [remoteLogo, setRemoteLogo] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLogo = async () => {
      try {
        const res = await fetch("/api/admin/settings/logo", {
          cache: "no-store",
        });
        if (!res.ok) {
          // Auth required or server error – fallback silently
          return;
        }
        const data: LogoApiResponse = await res.json();
        if (!cancelled && data?.logoUrl) {
          setRemoteLogo(data.logoUrl);
        }
      } catch {
        // Ignore network errors, just use fallback
      } finally {
        if (!cancelled) setTried(true);
      }
    };
    fetchLogo();
    return () => {
      cancelled = true;
    };
  }, []);

  const finalSrc = remoteLogo || LogoMain;

  return (
    <Link href="/" className="inline-block">
      <Image
        src={finalSrc}
        alt="BuySell Logo"
        width={100} // adjust width for desired size
        height={60} // match your image’s true height
        className="transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        priority
        onError={(e) => {
          if (finalSrc !== LogoMain) {
            (e.currentTarget as any).src = LogoMain;
          }
        }}
      />
    </Link>
  );
}
