import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SellButton = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  const handleSellClick = () => {
    // Handle sell button click for logged in users
    // Add your logic here
    setMobileMenuOpen(false); // Close mobile menu
  };

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu when auth modal opens
  };
  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => (user ? handleSellClick() : handleAuthClick("signup"))}
      className="flex items-center gap-1 px-3 py-2 border bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white btn-shadow transition-all duration-150"
      style={{ minWidth: 0 }}
    >
      <Plus className="h-4 w-4" />
      <span className="font-semibold text-base">Sell</span>
    </Button>
  );
};

export default SellButton;
