"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface FeaturedPlanSummary {
  id: string; // plan key
  title?: string;
  days: number;
  price: number;
  currency?: string;
  description?: string;
}

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
  plan: FeaturedPlanSummary | null;
  productId: string | null;
}

export default function FeaturedPaymentModal({
  open,
  onOpenChange,
  plan,
  productId,
}: Props) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [method, setMethod] = useState<string>("MTN");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setError(null);
    fetch("/api/monetization/details")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        setPaymentDetails(json?.paymentDetails || {});
        const available = [
          json?.paymentDetails?.mtn ? "MTN" : null,
          json?.paymentDetails?.orange ? "Orange" : null,
          json?.paymentDetails?.bank ? "Bank" : null,
        ].filter(Boolean) as string[];
        if (available.length > 0) setMethod(available[0]);
      })
      .catch(() => {
        if (!mounted) return;
        setPaymentDetails(null);
      });
    return () => {
      mounted = false;
    };
  }, [open]);

  async function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(null);
      if (!plan) {
        setError("No plan selected");
        return;
      }
      if (!productId) {
        setError("Please select a listing to feature");
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
          featureType: "featured_listing",
          listing: productId,
          plan: plan.id, // e.g., "7_days"
          method,
          screenshot,
          transactionId,
          userNotes: `Featured plan: ${plan.title ?? `${plan.days} days`} for ${
            plan.price
          } ${plan.currency ?? ""}`.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to submit payment");
      }
      onOpenChange(false);
      alert("Payment submitted. You will be notified after admin approval.");
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Featured Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Plan Summary */}
          <div className="rounded border p-3">
            <div className="font-medium">Selected Plan</div>
            <div className="text-sm text-muted-foreground">
              {plan ? (
                <>
                  <div>
                    {plan.title ??
                      `${plan.days} day${plan.days > 1 ? "s" : ""}`}
                  </div>
                  <div>
                    {plan.currency ?? "L$"} {plan.price}
                  </div>
                  {plan.description ? <div>{plan.description}</div> : null}
                </>
              ) : (
                <div>No plan selected</div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="font-medium">Pay to</div>
            {!paymentDetails ? (
              <div className="text-sm text-muted-foreground">
                Loading payment details…
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {paymentDetails.mtn && (
                  <div className="rounded border p-2">
                    <div className="font-medium">MTN Mobile Money</div>
                    <div>Name: {paymentDetails.mtn.name ?? "-"}</div>
                    <div>Number: {paymentDetails.mtn.number ?? "-"}</div>
                  </div>
                )}
                {paymentDetails.orange && (
                  <div className="rounded border p-2">
                    <div className="font-medium">Orange Money</div>
                    <div>Name: {paymentDetails.orange.name ?? "-"}</div>
                    <div>Number: {paymentDetails.orange.number ?? "-"}</div>
                  </div>
                )}
                {paymentDetails.bank && (
                  <div className="rounded border p-2">
                    <div className="font-medium">Bank Transfer</div>
                    <div>Bank: {paymentDetails.bank.bankName ?? "-"}</div>
                    <div>
                      Account Name: {paymentDetails.bank.accountName ?? "-"}
                    </div>
                    <div>
                      Account Number: {paymentDetails.bank.accountNumber ?? "-"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Method Select */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Payment Method</div>
            <div className="flex gap-3 text-sm">
              {paymentDetails?.mtn && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    checked={method === "MTN"}
                    onChange={() => setMethod("MTN")}
                  />{" "}
                  MTN
                </label>
              )}
              {paymentDetails?.orange && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    checked={method === "Orange"}
                    onChange={() => setMethod("Orange")}
                  />{" "}
                  Orange
                </label>
              )}
              {paymentDetails?.bank && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    checked={method === "Bank"}
                    onChange={() => setMethod("Bank")}
                  />{" "}
                  Bank
                </label>
              )}
            </div>
          </div>

          {/* Transaction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Transaction ID</div>
              <input
                className="mt-1 w-full border rounded px-3 h-9 text-sm"
                placeholder="e.g., MM230914XYZ"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div>
              <div className="text-sm font-medium">Screenshot</div>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
              />
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
              disabled={submitting || !plan || !productId}
            >
              Post
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
