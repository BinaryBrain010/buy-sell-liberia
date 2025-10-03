"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Make sure 'sonner' is installed and setup
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setError("Enter a valid email");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          tags: ["website"],
          preferences: {
            frequency: "weekly",
            categories: ["general"],
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Subscribed successfully!");
        setEmail("");
        setSuccessOpen(true);
      } else {
        toast.error(data.error || "Failed to subscribe");
        setError(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
      setError("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Subscribe to our newsletter
        </p>
        <div className="flex space-x-2">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder={error || "Your email"}
            className={`glass border-0 ${error ? "placeholder-red-500" : ""}`}
          />
          <Button size="sm" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              You're subscribed!
            </DialogTitle>
            <DialogDescription>
              Thanks for subscribing. You’ll receive updates and news from
              BuySell Liberia straight to your inbox. You can unsubscribe
              anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
