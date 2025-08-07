import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const SellButton = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSellClick = () => {
    setMobileMenuOpen(false);
    router.push("/sell");
  };

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
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
