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

  const displayAnnouncements = announcements;

  if (loading || displayAnnouncements.length === 0) return null;

  // Infinite scroll for multiple announcements
  return (
    <div className="w-full bg-black text-white py-2 px-4 flex items-center justify-center overflow-hidden relative z-20">
      <div
        ref={marqueeRef}
        className="whitespace-nowrap font-medium text-sm flex items-center gap-2"
        style={{
          minWidth: "100%",
          animation: `marquee 25s linear infinite`,
        }}
      >
        {Array(100)
          .fill(displayAnnouncements)
          .flat()
          .map((a, idx) => (
            <span key={a._id + idx} className="inline-flex items-center px-4">
              <strong>{a.title}:</strong>
              {a.content}
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
      `}</style>
    </div>
  );
}
