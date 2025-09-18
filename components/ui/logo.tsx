"use client";

import Link from "next/link";
import Image from "next/image";
import { LogoMain } from "@/lib/media";

export default function Logo() {
  return (
    <Link href="/" className="inline-block">
      <Image
        src={LogoMain}
        alt="BuySell Logo"
        width={100} // adjust width for desired size
        height={60} // match your image’s true height
        className="transition-all dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        priority
      />
    </Link>
  );
}
