"use client";

import React from "react";
import { useState } from "react";
import { Suspense } from "react";
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
import MobileMenuToggleButton from "@/components/navbar/mobileMenuToggleButton";
const MobileMenuAnimated = dynamic(
  () => import("@/components/navbar/mobileMenuAnimated"),
  { ssr: false }
);
const Logo = React.memo(LogoRaw);

// test
import { Menu, X } from "lucide-react";
// Remove duplicate import since ThemeToggle is already imported above
import { Button } from "@/components/ui/button";
import ThemeToggleRaw from "./theme-toggle";
const ThemeToggle = React.memo(ThemeToggleRaw);

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    // Don't reset authMode here - let it stay as user intended
  };

  const handleChatClick = () => {
    // Navigate to dashboard with messages tab
    window.location.href = "/dashboard?tab=messages";
    setMobileMenuOpen(false); // Close mobile menu
  };

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
        className="sticky top-0 z-50 glass border-b navbar-shadow"
      >
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16 gap-2 md:gap-4">
            {/* Logo */}
            <div className="flex items-center h-full">
              <Logo />
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 mx-2">
              <SearchBar />
            </div>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center mx-2">
              <NavigationLinks />
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {/* Sell Button only for logged-in users */}
              {user && <SellButton />}
              <ThemeToggle />
              <MobileMenuToggleButton />
              {user ? (
                <>
                  {/* User Action Icons - Responsive */}
                  <UserActions />

                  {/* Drop Down Menu */}
                  <DropDownMenu />
                </>
              ) : (
                <AuthButtons onAuthClick={handleAuthClick} />
              )}
            </div>

            {/* Mobile Theme Toggle and Hamburger - Only visible on mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              {user && <DropDownMenu />}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 btn-shadow"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Animated */}
      <MobileMenuAnimated
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        onAuthClick={handleAuthClick}
        onSellClick={() => {
          setMobileMenuOpen(false);
          window.location.href = "/sell";
        }}
        onChatClick={handleChatClick}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
        onLoginSuccess={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}
