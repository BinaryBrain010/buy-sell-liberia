"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { NewsletterSubscribe } from "./footer/newsLetterSubscribe";
import Logo from "./ui/logo";
import { FadeIn, FadeInStagger } from "@/components/static-pages/Animated";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative bg-background border-t overflow-hidden overflow-x-clip">
      {/* Decorative background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-10 h-28 w-28 rounded-full bg-purple-500/10 blur-2xl"
      />

      <div className="container mx-auto px-4 py-12">
        <FadeInStagger
          as="div"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Company Info */}
          <div>
            <Logo />
            <p className="text-muted-foreground mb-4">
              The leading marketplace connecting buyers and sellers. Safe,
              secure, and trusted by thousands.
            </p>
            <div className="flex space-x-2">
              <motion.div whileHover={{ y: -2, scale: 1.03 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-0 bg-transparent"
                  aria-label="Visit our Facebook"
                  asChild
                >
                  <Link
                    href="https://www.facebook.com/share/1ENF2C3EQM/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Visit our Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2, scale: 1.03 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-0 bg-transparent"
                  aria-label="Visit our Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2, scale: 1.03 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-0 bg-transparent"
                  aria-label="Visit our Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-muted-foreground hover:text-primary"
                >
                  Sell Item
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-muted-foreground hover:text-primary"
                >
                  Safety Tips
                </Link>
              </li>
              {/* Help Center removed as requested */}
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Connected</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">info@buysellliberia.com</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+231 77 7647548</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Key Hole, Old Road-Sinkor Monrovia-Liberia
                </span>
              </div>
            </div>

            <div>
              <NewsletterSubscribe />
            </div>
          </div>
        </FadeInStagger>

        <FadeIn>
          <Separator className="my-8" />
        </FadeIn>

        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 BuySell. All rights reserved.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
