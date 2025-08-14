"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/services/Auth.Service";
import { userClient } from "@/app/services/User.Service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, MessageCircle, Copy, LogIn } from "lucide-react";
import { toast } from "sonner";

interface ContactSellerButtonProps {
  sellerId: string;
  productId?: string; // Add productId prop
  productTitle: string;
  showPhoneNumber: boolean;
  sellerName: string;
  className?: string;
  variant?: "phone" | "whatsapp" | "both";
  size?: "sm" | "md" | "lg";
}

export function ContactSellerButton({
  sellerId,
  productId,
  productTitle,
  showPhoneNumber,
  sellerName,
  className = "",
  variant = "both",
  size = "sm",
}: ContactSellerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await authClient.getProfile();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const fetchSellerPhone = async () => {
    if (sellerPhone) return; // Already fetched
    setIsLoading(true);
    try {
      const data = await userClient.getUserContact(sellerId);
      setSellerPhone(data.phone);
    } catch (error) {
      console.error("Error fetching seller phone:", error);
      toast.error("Failed to get seller contact information");
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  const handleContactAction = async (action: "phone" | "chat") => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
      return;
    }

    if (!showPhoneNumber) {
      toast.error("Seller has not made their phone number public");
      return;
    }

    if (action === "phone") {
      await fetchSellerPhone();
      setIsDialogOpen(true);
    } else if (action === "chat") {
      // Route to dashboard/messages with sellerId, productId, and productTitle
      router.push(
        `/dashboard?tab=messages&sellerId=${sellerId}&productId=${encodeURIComponent(
          productId || productTitle
        )}&productTitle=${encodeURIComponent(productTitle)}`
      );
    }
  };

  const handleLogin = () => {
    // Redirect to login page or open login modal
    window.location.href = "/login";
  };

  const copyPhoneNumber = () => {
    if (sellerPhone) {
      navigator.clipboard.writeText(sellerPhone);
      toast.success("Phone number copied to clipboard");
    }
  };

  const makePhoneCall = () => {
    if (sellerPhone) {
      window.location.href = `tel:${sellerPhone}`;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "lg":
        return "h-10 px-4";
      case "md":
        return "h-9 px-3";
      case "sm":
        return "h-8 px-2";
      default:
        return "h-8 px-2";
    }
  };

  if (variant === "phone") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={`${getButtonSize()} ${className}`}
          onClick={() => handleContactAction("phone")}
          disabled={!showPhoneNumber || isCheckingAuth}
        >
          <Phone className="h-3 w-3" />
          {size === "lg" && <span className="ml-2">Call</span>}
        </Button>

        {/* Contact Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact {sellerName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Getting contact information...
                  </p>
                </div>
              ) : sellerPhone ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Phone Number
                    </p>
                    <p className="text-lg font-mono font-semibold">
                      {sellerPhone}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={makePhoneCall} className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" onClick={copyPhoneNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Unable to get contact information
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Login Required Dialog */}
        <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                You need to be logged in to view seller contact information.
              </p>
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (variant === "whatsapp") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={`${getButtonSize()} ${className}`}
          onClick={() => handleContactAction("chat")}
          disabled={isCheckingAuth}
        >
          <MessageCircle className="h-3 w-3" />
          {size === "lg" && <span className="ml-2">Chat</span>}
        </Button>

        {/* Login Required Dialog */}
        <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Login Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                You need to be logged in to chat with the seller.
              </p>
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Both phone and WhatsApp buttons
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className={`${getButtonSize()} ${className}`}
        onClick={() => handleContactAction("phone")}
        disabled={!showPhoneNumber || isCheckingAuth}
      >
        <Phone className="h-3 w-3" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        className={`${getButtonSize()} ${className}`}
        onClick={() => handleContactAction("chat")}
        disabled={isCheckingAuth}
      >
        <MessageCircle className="h-3 w-3" />
      </Button>

      {/* Contact Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {sellerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Getting contact information...
                </p>
              </div>
            ) : sellerPhone ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Phone Number
                  </p>
                  <p className="text-lg font-mono font-semibold">
                    {sellerPhone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={makePhoneCall}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContactAction("chat")}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={copyPhoneNumber}
                  className="w-full bg-transparent"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Number
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Unable to get contact information
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Required Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              You need to be logged in to view seller contact information.
            </p>
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContactSellerButton;
