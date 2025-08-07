"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { NewsletterSubscribe } from "./footer/newsLetterSubscribe"
import Logo from "./ui/logo"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Logo />
            <p className="text-muted-foreground mb-4">
              The leading marketplace connecting buyers and sellers. Safe, secure, and trusted by thousands.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="glass border-0 bg-transparent">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="glass border-0 bg-transparent">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="glass border-0 bg-transparent">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-muted-foreground hover:text-primary">
                  Sell Item
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-muted-foreground hover:text-primary">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
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
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-muted-foreground hover:text-primary">
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
                <span className="text-sm">info@buysell.com</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Global Marketplace</span>
              </div>
            </div>

            <div>
              <NewsletterSubscribe />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© 2025 BuySell. All rights reserved.</p>
          <p className="text-muted-foreground text-sm">Made with ❤️ for everyone</p>
        </div>
      </div>
    </footer>
  )
}
