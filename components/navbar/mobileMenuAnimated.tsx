import React from "react";
import { AnimatePresence } from "framer-motion";
import MobileMenu from "./mobileMenu";
import SellButton from "./sellButton";

interface MobileMenuAnimatedProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAuthClick: (mode: "login" | "signup") => void;
  onSellClick: () => void;
  onChatClick: () => void;
}

const MobileMenuAnimated = ({
  isOpen,
  setIsOpen,
  onAuthClick,
  onSellClick,
  onChatClick
}: MobileMenuAnimatedProps) => {
  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            isOpen={isOpen}
            onAuthClick={onAuthClick}
            onSellClick={onSellClick}
            onChatClick={onChatClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenuAnimated;
