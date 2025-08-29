"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/components/auth-provider";

export type ReportReason = "scam" | "fake" | "duplicate" | "inappropriate";

interface ReportProductButtonProps {
  productId: string;
  currentUserId?: string | null; // reporter id
  disabled?: boolean;
  className?: string;
  onSubmitted?: (report: any) => void;
  triggerLabel?: string;
  size?: "sm" | "md" | "lg"; // map md->default
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export const ReportProductButton: React.FC<ReportProductButtonProps> = ({
  productId,
  currentUserId,
  disabled,
  className,
  onSubmitted,
  triggerLabel = "Report",
  size = "sm",
  variant = "destructive",
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("scam");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const effectiveUserId = currentUserId || user?.id || null;

  useEffect(() => {
    if (!open) {
      setReason("scam");
      setDescription("");
      setSubmitting(false);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUserId) {
      setError("Please sign in to report.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          reported_by: effectiveUserId,
          reason,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");
      setSuccess(true);
      onSubmitted?.(data.report);
      setTimeout(() => setOpen(false), 900);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size === "md" ? "default" : size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={disabled || submitting}
      >
        {triggerLabel}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md p-5 relative border border-gray-200 dark:border-neutral-700">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close report modal"
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Report This Listing</h3>
            {effectiveUserId ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-full rounded px-2 py-2 text-sm border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-colors"
                    required
                  >
                    <option
                      className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                      value="scam"
                    >
                      Scam / Fraud
                    </option>
                    <option
                      className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                      value="fake"
                    >
                      Fake / Misleading
                    </option>
                    <option
                      className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                      value="duplicate"
                    >
                      Duplicate Listing
                    </option>
                    <option
                      className="bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                      value="inappropriate"
                    >
                      Inappropriate Content
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Additional Details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={800}
                    placeholder="Provide any extra context..."
                    className="w-full rounded px-2 py-2 text-sm resize-y border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-colors"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {description.length}/800
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded px-3 py-2">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded px-3 py-2">
                    Report submitted successfully.
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  You need to be logged in to report this listing.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    Login
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          // Parent should re-render with currentUserId; keep report modal open so form appears
        }}
        initialMode="login"
      />
    </>
  );
};

export default ReportProductButton;
