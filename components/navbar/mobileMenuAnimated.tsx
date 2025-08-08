import React from "react";
import { AnimatePresence } from "framer-motion";
import MobileMenu from "./mobileMenu";
import SellButton from "./sellButton";

interface MobileMenuAnimatedProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAuthClick: (mode: "login" | "signup") => void;
  onSellClick: () => void;
}

const MobileMenuAnimated = ({
  isOpen,
  setIsOpen,
  onAuthClick,
  onSellClick
}: MobileMenuAnimatedProps) => {
  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            isOpen={isOpen}
            onAuthClick={onAuthClick}
            onSellClick={onSellClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenuAnimated;
