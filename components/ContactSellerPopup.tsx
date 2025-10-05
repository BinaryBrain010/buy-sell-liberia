"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearStoredTokens, getLocalAuthStatus } from "@/lib/jwt";
import { userClient } from "@/app/services/User.Service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, MessageCircle, Copy, LogIn } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { toast } from "sonner";

interface ContactInfo {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

interface ContactSellerButtonProps {
  sellerId: string;
  productId?: string; // Add productId prop
  productTitle: string;
  showPhoneNumber: boolean;
  sellerName: string;
  contactInfo?: ContactInfo; // Optional pre-fetched contact info from product response
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
  contactInfo,
  className = "",
  variant = "both",
  size = "sm",
}: ContactSellerButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [sellerPhone, setSellerPhone] = useState<string | null>(
    contactInfo?.phone?.trim() ? contactInfo!.phone! : null
  );
  const [sellerEmail, setSellerEmail] = useState<string | null>(
    contactInfo?.email?.trim() ? contactInfo!.email! : null
  );
  const [sellerWhatsapp, setSellerWhatsapp] = useState<string | null>(
    contactInfo?.whatsapp?.trim() ? contactInfo!.whatsapp! : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { isLoggedIn } = getLocalAuthStatus();
    setIsAuthenticated(isLoggedIn);
    if (!isLoggedIn) clearStoredTokens();
    setIsCheckingAuth(false);
  };

  const fetchSellerPhone = async () => {
    if (sellerPhone || !showPhoneNumber) return; // Already have it or phone not public
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
    if (action === "phone") {
      // Always open the dialog for phone actions. If the user is not
      // authenticated, show the login prompt immediately. If authenticated,
      // fetch seller phone only when needed.
      setIsDialogOpen(true);
      if (!isAuthenticated) {
        // Let the dialog show the login prompt; do not fetch profile.
        return;
      }
      // If authenticated, fetch contact details unless already present.
      try {
        await fetchSellerPhone();
      } catch (err) {
        // fetchSellerPhone will handle errors and toasts; swallow here.
      }
      return;
    }
    if (action === "chat") {
      if (!isAuthenticated) {
        setIsDialogOpen(true);
        return;
      }
      // Route to dashboard/messages with sellerId, productId, and productTitle
      router.push(
        `/dashboard?tab=messages&sellerId=${sellerId}&productId=${encodeURIComponent(
          productId || productTitle
        )}&productTitle=${encodeURIComponent(productTitle)}`
      );
    }
  };

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const copyPhoneNumber = () => {
    if (sellerPhone) {
      navigator.clipboard.writeText(sellerPhone);
      toast.success("Phone number copied to clipboard");
    }
  };

  const copyEmail = () => {
    if (sellerEmail) {
      navigator.clipboard.writeText(sellerEmail);
      toast.success("Email copied to clipboard");
    }
  };

  const copyWhatsapp = () => {
    if (sellerWhatsapp) {
      navigator.clipboard.writeText(sellerWhatsapp);
      toast.success("WhatsApp number copied to clipboard");
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
    if (!showPhoneNumber) return null; // Hide phone trigger if phone is not public
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className={`${getButtonSize()} ${className}`}
          onClick={() => handleContactAction("phone")}
          disabled={isCheckingAuth}
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
              {!isAuthenticated ? (
                <div className="text-center space-y-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    You need to be logged in to view seller contact details.
                  </p>
                  <Button onClick={handleLogin} className="w-full">
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Getting contact information...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Phone Section - only if available and public */}
                  {showPhoneNumber && sellerPhone && (
                    <>
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
                    </>
                  )}

                  {/* Email Section - only if available */}
                  {sellerEmail && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Email
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`mailto:${sellerEmail}`}
                          className="text-sm underline"
                        >
                          {sellerEmail}
                        </a>
                        <Button variant="outline" size="sm" onClick={copyEmail}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Section - only if available */}
                  {sellerWhatsapp && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        WhatsApp
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/${sellerWhatsapp.replace(
                            /[^\d]/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          {sellerWhatsapp}
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyWhatsapp}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setIsAuthModalOpen(false);
          }}
          initialMode="login"
        />
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
        {/* Login prompt now shown inside the contact dialog when unauthenticated */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setIsAuthModalOpen(false);
          }}
          initialMode="login"
        />
      </>
    );
  }

  // Both phone and WhatsApp buttons
  return (
    <>
      {showPhoneNumber && (
        <Button
          size="sm"
          variant="outline"
          className={`${getButtonSize()} ${className}`}
          onClick={() => handleContactAction("phone")}
          disabled={isCheckingAuth}
        >
          <Phone className="h-3 w-3" />
        </Button>
      )}

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
            {!isAuthenticated ? (
              <div className="text-center space-y-4 py-2">
                <p className="text-sm text-muted-foreground">
                  You need to be logged in to view seller contact details.
                </p>
                <Button onClick={handleLogin} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" /> Login
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Getting contact information...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Phone Section - only if available and public */}
                {showPhoneNumber && sellerPhone && (
                  <>
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
                  </>
                )}

                {/* Email Section - only if available */}
                {sellerEmail && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-2">Email</p>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={`mailto:${sellerEmail}`}
                        className="text-sm underline"
                      >
                        {sellerEmail}
                      </a>
                      <Button variant="outline" size="sm" onClick={copyEmail}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* WhatsApp Section - only if available */}
                {sellerWhatsapp && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      WhatsApp
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${sellerWhatsapp.replace(
                          /[^\d]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        {sellerWhatsapp}
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyWhatsapp}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
        initialMode="login"
      />
    </>
  );
}

export default ContactSellerButton;
