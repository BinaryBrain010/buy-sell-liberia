"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { LoginForm } from "./auth/login-form";
import { SignupForm } from "./auth/signup-form";
import { ForgotPasswordForm } from "./auth/forgot-password-form";
import { OtpForm } from "./auth/otp-form";
import { VerificationSuccess } from "./auth/verification-success";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  onLoginSuccess: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onOpenChange,
  initialMode = "login",
  onLoginSuccess,
}: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<
    | "login"
    | "signup"
    | "forgot-password"
    | "otp"
    | "verification-success"
    | "banned"
  >(initialMode);
  const [email, setEmail] = useState("");
  const [otpContext, setOtpContext] = useState<"signup" | "forgot-password">(
    "signup"
  );
  const [googleSignupData, setGoogleSignupData] = useState<any>(null);
  const [bannedMessage, setBannedMessage] = useState<string | null>(null);
  const router = useRouter();

  // Reset state when modal opens with different initial mode
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialMode);
      setEmail("");
      setGoogleSignupData(null);
      setBannedMessage(null);
    }
  }, [isOpen, initialMode]);

  const handleStepChange = (
    step:
      | "login"
      | "signup"
      | "forgot-password"
      | "otp"
      | "verification-success"
  ) => {
    setCurrentStep(step);
  };

  const handleClose = () => {
    setCurrentStep(initialMode); // Reset to the initial mode instead of always "login"
    setEmail("");
    setGoogleSignupData(null);
    setBannedMessage(null);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && currentStep === "banned") {
      // Redirect to home when closing after banned notice
      router.push("/");
    }
    onOpenChange(open);
  };

  const handleBanned = (message?: string) => {
    setBannedMessage(
      message ||
        "You are banned. Kindly contact the help team to resolve the issue."
    );
    setCurrentStep("banned");
  };

  const getTitle = () => {
    switch (currentStep) {
      case "login":
        return "Welcome Back";
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Reset Password";
      case "otp":
        return otpContext === "signup" ? "Verify Email" : "Reset Password";
      case "verification-success":
        return "Email Verified";
      case "banned":
        return "Account Banned";
      default:
        return "Authentication";
    }
  };

  const getMaxWidth = () => {
    switch (currentStep) {
      case "signup":
        return "sm:max-w-lg";
      default:
        return "sm:max-w-md";
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "login":
        return (
          <LoginForm
            onForgotPassword={() => handleStepChange("forgot-password")}
            onSignup={(googleData?: any) => {
              if (googleData) {
                setGoogleSignupData(googleData);
              }
              handleStepChange("signup");
            }}
            onClose={() => {
              onLoginSuccess();
              handleClose();
            }}
            onBanned={(msg?: string) => handleBanned(msg)}
          />
        );
      case "signup":
        return (
          <SignupForm
            onLogin={() => handleStepChange("login")}
            onVerification={(userEmail: string) => {
              setEmail(userEmail);
              setOtpContext("signup");
              handleStepChange("otp");
            }}
            initialData={
              googleSignupData
                ? {
                    ...googleSignupData,
                    isGoogleSignup: true,
                  }
                : undefined
            }
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onBack={() => handleStepChange("login")}
            onOtpSent={(userEmail: string) => {
              setEmail(userEmail);
              setOtpContext("forgot-password");
              handleStepChange("otp");
            }}
          />
        );
      case "otp":
        return (
          <OtpForm
            email={email}
            context={otpContext}
            onBack={() => {
              if (otpContext === "signup") {
                handleStepChange("signup");
              } else {
                handleStepChange("forgot-password");
              }
            }}
            onSuccess={() => {
              if (otpContext === "signup") {
                handleStepChange("verification-success");
              } else {
                handleClose();
              }
            }}
          />
        );
      case "verification-success":
        return (
          <VerificationSuccess
            onContinue={() => {
              handleStepChange("login");
            }}
          />
        );
      case "banned":
        return (
          <div className="space-y-4" key="banned-notice">
            <p className="text-sm text-red-600">
              {bannedMessage ||
                "You are banned. Kindly contact the help team to resolve the issue."}
            </p>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => {
                  // Close the modal, wrapped handler will redirect to home
                  handleOpenChange(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${getMaxWidth()} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="px-1">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
