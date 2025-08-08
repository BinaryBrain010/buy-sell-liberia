import React, { useState } from "react";
// import MobileMenu from "@/components/navbar/mobileMenu";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileMenuToggleButton = () => {
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center space-x-2">
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
  );
};

export default MobileMenuToggleButton;
