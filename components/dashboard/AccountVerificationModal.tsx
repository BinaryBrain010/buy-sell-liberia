"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type PaymentDetails = {
  mtn?: { name?: string; number?: string } | null;
  orange?: { name?: string; number?: string } | null;
  bank?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  } | null;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AccountVerificationModal({
  open,
  onOpenChange,
}: Props) {
  const [plans, setPlans] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const accountPlans = useMemo(
    () => plans?.plans?.account_verification ?? {},
    [plans]
  );
  const currency = plans?.currency ?? "L$";

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const [p, s] = await Promise.all([
          fetch("/api/monetization/plans")
            .then((r) => r.json())
            .catch(() => ({})),
          fetch("/api/settings/public")
            .then((r) => r.json())
            .catch(() => ({})),
        ]);
        if (!mounted) return;
        setPlans(p);
        // prefer public settings paymentDetails; fallback to plans.paymentDetails
        const pd = s?.paymentDetails;
        const hasAny = Boolean(pd?.mtn || pd?.orange || pd?.bank);
        setPaymentDetails(hasAny ? pd : p?.paymentDetails || null);
        const firstKey =
          Object.keys(p?.plans?.account_verification || {})[0] || null;
        setSelectedPlan(firstKey);
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  // Ensure a default plan is auto-selected when plans load
  useEffect(() => {
    if (!selectedPlan) {
      const firstKey = Object.keys(accountPlans || {})[0];
      if (firstKey) setSelectedPlan(firstKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountPlans]);

  async function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleScreenshotChange(f: File | null) {
    setScreenshotFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("Screenshot must be under 2MB");
      setScreenshotFile(null);
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(null);
      if (!selectedPlan) {
        setError("Please select a plan");
        return;
      }
      if (!transactionId || !screenshotFile) {
        setError("Transaction ID and screenshot are required");
        return;
      }
      const screenshot = await toBase64(screenshotFile);
      const resp = await fetch("/api/monetization/manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureType: "account_verification",
          plan: selectedPlan,
          screenshot,
          transactionId,
          userNotes: `Account verification: ${selectedPlan}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data?.error || "Failed to submit verification payment");
      onOpenChange(false);
      toast({
        title: "Verification request sent",
        description: "We'll notify you after the review is complete.",
      });
    } catch (e: any) {
      const msg = e?.message || "Submission failed";
      setError(msg);
      toast({ title: "Error", description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const hasPlans = Object.keys(accountPlans).length > 0;

  const handleCopy = async (label: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setLastCopied(label);
      setTimeout(() => setLastCopied(null), 1500);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Apply for Account Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!hasPlans ? (
            <div className="text-sm text-muted-foreground">
              Account verification plans are not available at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-medium">Select Plan</div>
              <div className="space-y-2">
                {Object.entries(accountPlans).map(([key, val]: any) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                      selectedPlan === key
                        ? "border-primary/50 bg-muted/50"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="font-medium">{val?.label ?? key}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold">
                        {currency} {val?.price ?? 0}
                      </div>
                      <input
                        type="radio"
                        name="verif-plan"
                        checked={selectedPlan === key}
                        onChange={() => setSelectedPlan(key)}
                        className="h-4 w-4"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="font-medium text-sm tracking-wide uppercase text-muted-foreground">
              Pay To
            </div>
            {!paymentDetails ? (
              <div className="text-sm text-muted-foreground">
                Loading payment details…
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {paymentDetails.mtn && (
                  <div className="rounded border p-3 bg-background/50">
                    <div className="font-medium">MTN Mobile Money</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono">
                        {paymentDetails.mtn.number ?? "-"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy("mtn", paymentDetails.mtn?.number)
                        }
                      >
                        {lastCopied === "mtn" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}
                {paymentDetails.orange && (
                  <div className="rounded border p-3 bg-background/50">
                    <div className="font-medium">Orange Money</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono">
                        {paymentDetails.orange.number ?? "-"}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCopy("orange", paymentDetails.orange?.number)
                        }
                      >
                        {lastCopied === "orange" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}
                {paymentDetails.bank && (
                  <div className="rounded border p-3 sm:col-span-2 bg-background/50">
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-xs text-muted-foreground">
                      {paymentDetails.bank.bankName ?? "-"}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Account Name</span>
                        <span className="font-mono">
                          {paymentDetails.bank.accountName ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {paymentDetails.bank.accountNumber ?? "-"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopy(
                                "bank",
                                paymentDetails.bank?.accountNumber
                              )
                            }
                          >
                            {lastCopied === "bank" ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col">
              <div className="text-sm font-medium flex items-center justify-between">
                <span>Transaction ID</span>
                {!transactionId.trim() && (
                  <span className="text-xs text-muted-foreground">
                    Required
                  </span>
                )}
              </div>
              <input
                className="mt-1 w-full border rounded px-3 h-9 text-sm"
                placeholder="e.g., MM230914XYZ"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <div className="text-sm font-medium mt-3 flex items-center justify-between">
                <span>Screenshot</span>
                {!screenshotFile && (
                  <span className="text-xs text-muted-foreground">
                    Required
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) =>
                  handleScreenshotChange(e.target.files?.[0] || null)
                }
              />
              {preview && (
                <div className="mt-2 relative group">
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    className="h-28 w-full object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleScreenshotChange(null)}
                    className="absolute top-1 right-1 text-xs px-2 py-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground self-end">
              Tip: After sending your payment, add the transaction ID and a
              screenshot here, then submit. We’ll review your request shortly.
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting || !selectedPlan || !transactionId || !screenshotFile
              }
            >
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
