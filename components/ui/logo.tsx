"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getClientSettings } from "@/lib/settings";

export default function Logo() {
  const [logoPath, setLogoPath] = useState("/logo/buySellLogo.png");
  const [logoKey, setLogoKey] = useState(Date.now());

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const settings = await getClientSettings();
        if (settings.logo_path !== logoPath) {
          setLogoPath(settings.logo_path);
          setLogoKey(Date.now()); // Force re-render when logo changes
        }
      } catch (error) {
        console.error('Failed to load logo path:', error);
      }
    };
    
    loadLogo();
    
    // Poll for logo changes every 30 seconds
    const interval = setInterval(loadLogo, 30000);
    return () => clearInterval(interval);
  }, [logoPath]);

  return (
    <Link href="/" className="inline-block">
      <Image
        key={logoKey} // Force re-render when logo changes
        src={`${logoPath}?v=${logoKey}`} // Add cache-busting parameter
        alt="BuySell Logo"
        width={100} // adjust width for desired size
        height={60} // match your image's true height
        className="transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        priority
        unoptimized // Disable Next.js image optimization for dynamic logos
      />
    </Link>
  );
}
