"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";

import Logo from "./navbar/logo";
import DesktopLinks from "./navbar/desktopLinks";
import SearchBar from "./navbar/searchBar";
import MobileMenu from "./navbar/mobileMenu";
import UserActions from "./navbar/userAction";
import AuthButtons from "./navbar/authButton";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [redirectToSell, setRedirectToSell] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSellClick = () => {
    if (user) {
      router.push("/sell");
    } else {
      setAuthMode("signup");
      setRedirectToSell(true);
      setIsAuthModalOpen(true);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open);
    if (!open && redirectToSell && user) {
      router.push("/sell");
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass border-b navbar-shadow"
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16">
            <Logo />

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-4 sm:mx-6">
              <SearchBar />
            </div>

            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <DesktopLinks />
            </div>

            <div className="hidden lg:flex items-center space-x-4 px-3">
              <Button
                onClick={handleSellClick}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white btn-shadow px-4 py-2 rounded-md flex items-center gap-2"
              >
                <span className="font-semibold">Sell</span>
              </Button>

              <ThemeToggle />
              {user ? (
                <UserActions />
              ) : (
                <AuthButtons onAuthClick={handleAuthClick} />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <MobileMenu
              isOpen={isMobileMenuOpen}
              onAuthClick={handleAuthClick}
              onSellClick={handleSellClick}
            />
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
      />
    </>
  );
}
