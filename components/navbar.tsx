"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/components/auth-provider"
import { Plus, Heart, MessageCircle, Bell, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import MobileMenu from "./navbar/mobileMenu"

import DropDownMenu from "@/components/navbar/dropDownMenu"
import SearchBar from "@/components/navbar/searchBar"
import NavigationLinks from "@/components/navbar/navigationLinks"

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
    setMobileMenuOpen(false) // Close mobile menu when auth modal opens
  }

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open)
    // Don't reset authMode here - let it stay as user intended
  }

  const handleSellClick = () => {
    // Handle sell button click for logged in users
    // Add your logic here
    setMobileMenuOpen(false) // Close mobile menu
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-50 glass border-b navbar-shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center card-shadow">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <span className="font-bold text-xl">BuySell</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <SearchBar />

            {/* Navigation Links - Hidden on mobile */}
            <NavigationLinks />

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {/* Prominent Sell Button for all users */}
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => user ? handleSellClick() : handleAuthClick("signup")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white btn-shadow"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-medium">Sell</span>
              </Button>
              
              <ThemeToggle />

              {user ? (
                <>
                  {/* User Action Icons - Responsive */}
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
                      <Heart className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
                        3
                      </Badge>
                    </Button>

                    <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
                      <MessageCircle className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
                        2
                      </Badge>
                    </Button>

                    <Button variant="ghost" size="sm" className="relative p-2 btn-shadow">
                      <Bell className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs card-shadow">
                        5
                      </Badge>
                    </Button>
                  </div>

                  <DropDownMenu />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleAuthClick("login")} className="btn-shadow">
                    Login
                  </Button>
                  <Button size="sm" onClick={() => handleAuthClick("signup")} className="btn-shadow">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button - Only visible on mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu 
            isOpen={mobileMenuOpen} 
            onAuthClick={handleAuthClick} 
            onSellClick={handleSellClick}
          />
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
      />
    </>
  )
}
