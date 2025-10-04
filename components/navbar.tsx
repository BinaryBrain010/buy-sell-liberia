"use client";

import React, { useState, useEffect, useCallback } from "react";
// import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from "next/dynamic";
const AuthModal = dynamic(
  () => import("@/components/auth-modal").then((mod) => mod.AuthModal),
  { ssr: false }
) as any;
import { useAuth } from "@/components/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
// import MobileMenu from "./navbar/mobileMenu";

import DropDownMenu from "@/components/navbar/dropDownMenu";
import SearchBar from "@/components/navbar/searchBar";
import NavigationLinks from "@/components/navbar/navigationLinks";
import AuthButtons from "@/components/navbar/authButton";
import UserActions from "@/components/navbar/userAction";
import SellButton from "@/components/navbar/sellButton";
import LogoRaw from "@/components/ui/logo";
// MobileMenu toggle is implemented inline for better control on small screens
const MobileMenuAnimated = dynamic(
  () => import("@/components/navbar/mobileMenuAnimated"),
  { ssr: false }
);
const Logo = React.memo(LogoRaw);

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggleRaw from "./theme-toggle";
const ThemeToggle = React.memo(ThemeToggleRaw);

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMobileMenu = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMobileMenuOpen(false);
  }, []);

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    // Don't reset authMode here - let it stay as user intended
  };

  // Lock body scroll and enable ESC to close when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileMenuOpen]);

  // Chat button now visible directly in navbar via UserActions; removed from mobile hamburger list.

  // const handleSellClick = () => {
  //   // Handle sell button click for logged in users
  //   // Add your logic here
  //   setMobileMenuOpen(false); // Close mobile menu
  // };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label="Main"
        className="sticky top-0 z-50 glass border-b navbar-shadow"
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center h-full">
              <Logo />
            </div>

            {/* Search Bar - Inline on lg+, icon trigger on md */}
            <div className="hidden lg:flex flex-1 mx-2">
              <SearchBar variant="inline" />
            </div>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center mx-2">
              <NavigationLinks />
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {user && <SellButton />}
              {!user && <ThemeToggle />}
              {user ? (
                <>
                  <UserActions />
                  <DropDownMenu includeThemeToggle />
                </>
              ) : (
                <AuthButtons onAuthClick={handleAuthClick} />
              )}
            </div>

            {/* Mobile/Tablet controls */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* md: show search icon to open overlay */}
              <Button
                variant="ghost"
                size="sm"
                aria-label="Open search"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 btn-shadow"
                type="button"
              >
                {/* simple magnifier icon via lucide already included in SearchBar; reuse with text to keep bundle small */}
                <span className="sr-only">Search</span>
                {/* small inline svgs can be replaced with lucide Search, but we avoid duplicate imports here */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </Button>
              {/* Keep mobile header uncluttered: show theme toggle (optional) and hamburger only */}
              <ThemeToggle />
              {/* Hamburger on far right */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 btn-shadow ml-1 relative z-50"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                type="button"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 pointer-events-none" />
                ) : (
                  <Menu className="h-5 w-5 pointer-events-none" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Animated */}
      <div id="mobile-menu">
        <MobileMenuAnimated
          isOpen={mobileMenuOpen}
          setIsOpen={(open) => setMobileMenuOpen(open)}
          onAuthClick={handleAuthClick}
          onSellClick={() => {
            setMobileMenuOpen(false);
            window.location.href = "/sell";
          }}
        />
      </div>

      {/* Search Overlay for md screens */}
      {isSearchOpen && (
        <SearchBar variant="overlay" onClose={() => setIsSearchOpen(false)} />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
        onLoginSuccess={() => {
          // Close auth modal after successful login/signup
          setIsAuthModalOpen(false);
        }}
      />
    </>
  );
}
