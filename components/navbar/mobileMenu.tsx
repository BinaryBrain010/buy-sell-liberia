"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function MobileMenu({
  isOpen,
  onAuthClick,
  onSellClick,
  onClose,
}: {
  isOpen: boolean;
  onAuthClick: (mode: "login" | "signup") => void;
  onSellClick: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside the menu
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element;

      // Don't close if clicking on the hamburger menu button
      const isHamburgerButton =
        target.closest('[aria-label*="menu"]') ||
        target.closest('button[aria-label*="Close menu"]') ||
        target.closest('button[aria-label*="Open menu"]');

      if (isHamburgerButton) {
        return;
      }

      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    // Add a small delay before attaching listeners to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="lg:hidden fixed top-16 left-0 right-0 z-40 px-4 pt-4 pb-6 space-y-4 glass border-t shadow-lg"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search..."
          className="w-full pl-10 glass input-shadow"
        />
      </div>

      <div className="flex flex-col space-y-3 text-base font-medium">
        {["categories", "products", "about", "contact"].map((link) => (
          <Link
            key={link}
            href={`/${link}`}
            className="text-muted-foreground hover:text-primary transition-colors capitalize"
            onClick={() => onClose()}
          >
            {link}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-3">
        <Button
          onClick={() => {
            if (user) {
              onSellClick();
            } else {
              onAuthClick("login");
            }
            onClose();
          }}
          className="w-full"
        >
          Sell
        </Button>

        {!user && (
          // Show auth actions only on mobile; hide on tablets and up
          <div className="flex gap-2 md:hidden">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onAuthClick("login");
                onClose();
              }}
            >
              Login
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                onAuthClick("signup");
                onClose();
              }}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
