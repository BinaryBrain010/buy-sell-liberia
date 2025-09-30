"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type?: string[];
}

type AnnouncementBarProps = {
  children?: React.ReactNode;
  // Speed in seconds; optional via CSS var if desired
  durationSeconds?: number;
  direction?: "ltr" | "rtl";
};

export function AnnouncementBar({
  children,
  durationSeconds = 25,
  direction = "ltr",
}: AnnouncementBarProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/announcements");
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch (err) {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  // Only show announcements that have the type 'banner'
  const displayAnnouncements = announcements.filter((a) =>
    (a.type || []).some((t) => t?.toLowerCase() === "banner")
  );

  // Build a unified items array from children, fetched announcements, or defaults
  const items: React.ReactNode[] = children
    ? Array.isArray(children)
      ? (children as React.ReactNode[])
      : [children]
    : displayAnnouncements.length > 0
    ? displayAnnouncements.map((a) => (
        <span key={a._id} className="inline-flex items-center">
          <strong className="mr-1">{a.title}:</strong>
          <span>{a.content}</span>
        </span>
      ))
    : [];

  // Insert a "•" separator after every item (including the last) so the loop seam is also separated
  const itemsWithSeparators = items.flatMap((item, idx) => [
    <span key={`item-${idx}`} className="inline-flex items-center">
      {item}
    </span>,
    <span
      key={`sep-${idx}`}
      aria-hidden="true"
      className="opacity-60 px-3 sm:px-4"
    >
      {"•"}
    </span>,
  ]);

  // If loading, don't render until we know what to show
  if (loading) return null;

  if (items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="w-full border-b border-border bg-accent text-accent-foreground py-1.5 sm:py-2 px-2 sm:px-4 overflow-hidden relative z-20"
      style={
        {
          ["--marquee-duration" as any]: `${durationSeconds}s`,
        } as React.CSSProperties
      }
    >
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden">
        <div
          ref={marqueeRef}
          className="marquee-track whitespace-nowrap font-medium text-xs sm:text-sm flex items-center"
          style={{
            minWidth: "100%",
            animation: `marquee ${durationSeconds}s linear infinite`,
            animationDirection: direction === "ltr" ? "reverse" : "normal",
            willChange: "transform",
          }}
        >
          {/* First copy */}
          <div className="flex items-center">{itemsWithSeparators}</div>
          {/* Duplicate for seamless loop */}
          <div className="flex items-center" aria-hidden="true">
            {itemsWithSeparators}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AnnouncementBar;
