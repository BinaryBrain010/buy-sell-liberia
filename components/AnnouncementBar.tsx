"use client";

import React, { useEffect, useState, useRef } from "react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type?: string[];
}

export default function AnnouncementBar() {
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

  if (loading || displayAnnouncements.length === 0) return null;

  // If there's only one announcement, show a static, centered message (more accessible on mobile)
  if (displayAnnouncements.length === 1) {
    const a = displayAnnouncements[0];
    return (
      <div
        className="w-full bg-black text-white dark:bg-white dark:text-black py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-center overflow-hidden relative z-20"
        role="region"
        aria-label="Announcement"
      >
        <div className="font-medium text-xs sm:text-sm text-center">
          <strong className="mr-1">{a.title}:</strong>
          <span>{a.content}</span>
        </div>
      </div>
    );
  }

  // Infinite scroll for multiple announcements
  return (
    <div
      className="w-full bg-black text-white dark:bg-white dark:text-black py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-center overflow-hidden relative z-20"
      role="region"
      aria-label="Announcements"
    >
      <div
        ref={marqueeRef}
        className="whitespace-nowrap font-medium text-xs sm:text-sm flex items-center gap-3 sm:gap-6"
        style={{
          minWidth: "100%",
          animation: `marquee 25s linear infinite`,
        }}
      >
        {Array(20)
          .fill(displayAnnouncements)
          .flat()
          .map((a, idx) => (
            <span
              key={a._id + idx}
              className="inline-flex items-center px-3 sm:px-4"
            >
              <strong className="mr-1">{a.title}:</strong>
              <span>{a.content}</span>
            </span>
          ))}
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
        /* Respect user's reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          div[style*="marquee"] {
            animation: none !important;
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
