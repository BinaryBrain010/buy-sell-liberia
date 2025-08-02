"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/components/auth-provider"
import { Plus, User, Settings, LogOut, Heart, MessageCircle, Bell, Menu, X, Search, MoreVertical } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-50">
        <div className="flex justify-center mt-3 px-4">
          {/* Desktop Navbar */}
          <div className={`w-full max-w-7xl h-14 rounded-full flex items-center justify-between px-6 shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-black border border-white/20' 
              : 'bg-white border border-gray-200'
          }`}>
            {/* Left Side - Logo and Search */}
            <div className="flex items-center space-x-4 flex-1">
              {/* BuySell Logo */}
              <Link href="/" className={`px-3 py-2 rounded-full cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/5' 
                  : 'hover:bg-gray-100'
              }`}>
                <span className={`font-semibold text-lg transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>BuySell</span>
              </Link>

              {/* Search Bar - Hidden on Mobile */}
              <div className="relative hidden md:block flex-1 max-w-md">
                <Input 
                  placeholder="Search products..." 
                  className={`w-full rounded-full pl-4 pr-12 h-10 border-0 shadow-sm transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-900 text-white placeholder-gray-400 border border-white/10' 
                      : 'bg-gray-50'
                  }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Search className="text-white h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Center Navigation - Hidden on Mobile */}
            <div className={`hidden lg:flex items-center space-x-6 px-4`}>
              <Link href="/categories" className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-700 hover:text-black'
              }`}>
                Categories
              </Link>
              <Link href="/products" className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-700 hover:text-black'
              }`}>
                Products
              </Link>
              <Link href="/about" className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-700 hover:text-black'
              }`}>
                About
              </Link>
              <Link href="/contact" className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:text-gray-300' 
                  : 'text-gray-700 hover:text-black'
              }`}>
                Contact
              </Link>
            </div>

            {/* Right Side - Hidden on Mobile */}
            <div className="flex items-center space-x-3 flex-1 justify-end hidden md:flex">
              {/* Heart Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`w-10 h-10 rounded-full p-0 transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/5' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Heart className="text-red-500 h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Sell Button */}
                              <Link href="/sell">
                  <Button 
                    size="sm"
                    className={`font-medium h-10 px-4 transition-colors flex items-center space-x-2 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Sell</span>
                  </Button>
                </Link>

              {user ? (
                <>
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}>{user.name || "User"}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.name || ""} />
                        <AvatarFallback className={`transition-colors ${
                          theme === 'dark' 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-gray-100 text-black'
                        }`}>
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 glass border-0 modal-shadow" align="end">
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">{user.name || "User"}</p>
                            <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAuthClick("login")} 
                    className={`rounded-full h-10 px-4 transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'text-white hover:bg-white/5' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleAuthClick("signup")} 
                    className={`rounded-full h-10 px-4 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/5' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                ) : (
                  <Menu className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden fixed top-16 left-4 right-4 z-40 rounded-2xl shadow-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-black border border-white/10' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Input 
                  placeholder="Search products..." 
                  className={`w-full rounded-full pl-4 pr-12 h-10 border-0 shadow-sm transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-900 text-white placeholder-gray-400 border border-white/10' 
                      : 'bg-gray-50'
                  }`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Search className="text-white h-4 w-4" />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <Link 
                  href="/categories" 
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/5' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  href="/products" 
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/5' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link 
                  href="/about" 
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/5' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/5' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-10 h-10 rounded-full p-0 transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-white/5' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="text-red-500 h-4 w-4" />
                  </Button>
                </div>
                <Button 
                 
                  size="sm"
                  className={`font-medium h-10 px-4 transition-colors flex items-center space-x-2 rounded-full ${
                    theme === 'dark' 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Sell</span>
                </Button>
              </div>

              {/* Auth Buttons */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200 dark:border-white/10">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleAuthClick("login")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full h-10 transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'text-white hover:bg-white/5' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      handleAuthClick("signup")
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full h-10 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white text-black hover:bg-gray-100' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* User Profile - Mobile */}
              {user && (
                <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user.name || ""} />
                      <AvatarFallback className={`transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-100 text-black'
                      }`}>
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        {user.name || "User"}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className={`p-2 rounded-full ${
                        theme === 'dark' 
                          ? 'text-white hover:bg-white/5' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
      />
    </>
  )
}
