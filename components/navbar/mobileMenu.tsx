"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function MobileMenu({
  isOpen,
  onAuthClick,
  onSellClick,
}: {
  isOpen: boolean;
  onAuthClick: (mode: "login" | "signup") => void;
  onSellClick: () => void;
}) {
  const { user } = useAuth();

  return (
    <motion.div
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
        {["categories", "products", "about", "contact", "help"].map((link) => (
          <Link
            key={link}
            href={`/${link}`}
            className="text-muted-foreground hover:text-primary transition-colors capitalize"
          >
            {link}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 pt-3">
        <Button
          onClick={() => (user ? onSellClick() : onAuthClick("login"))}
          className="w-full"
        >
          Sell
        </Button>
        {!user && (
          <>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onAuthClick("login")}
            >
              Login
            </Button>
            <Button className="w-full" onClick={() => onAuthClick("signup")}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
