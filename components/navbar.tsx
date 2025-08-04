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
import { Search, Plus, User, Settings, LogOut, Heart, MessageCircle, Bell } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const { user, logout } = useAuth()

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleModalClose = (open: boolean) => {
    setIsAuthModalOpen(open)
    // Don't reset authMode here - let it stay as user intended
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

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search for anything..." className="pl-10 glass border-0 input-shadow" />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                Help
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Prominent Sell Button for all users */}
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => user ? undefined : handleAuthClick("signup")}
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full btn-shadow">
                        <Avatar className="h-8 w-8 card-shadow">
                          <AvatarImage src="" alt={user.name || ""} />
                          <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
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
          </div>
        </div>
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={handleModalClose}
        initialMode={authMode}
      />
    </>
  )
}
