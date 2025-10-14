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
  const [method, setMethod] = useState<string>("MTN");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const [p, d] = await Promise.all([
          fetch("/api/monetization/plans")
            .then((r) => r.json())
            .catch(() => ({})),
          fetch("/api/monetization/details")
            .then((r) => r.json())
            .catch(() => ({})),
        ]);
        if (!mounted) return;
        setPlans(p);
        setPaymentDetails(d?.paymentDetails || null);
        const firstKey =
          Object.keys(p?.plans?.account_verification || {})[0] || null;
        setSelectedPlan(firstKey);
        const available = [
          d?.paymentDetails?.mtn ? "MTN" : null,
          d?.paymentDetails?.orange ? "Orange" : null,
          d?.paymentDetails?.bank ? "Bank" : null,
        ].filter(Boolean) as string[];
        if (available.length > 0) setMethod(available[0]);
      } catch (e) {}
    })();
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
          method,
          screenshot,
          transactionId,
          userNotes: `Account verification: ${selectedPlan}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data?.error || "Failed to submit verification payment");
      onOpenChange(false);
      alert(
        "Verification request submitted. You will be notified after admin review."
      );
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasPlans = Object.keys(accountPlans).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Account Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Payment Method</div>
              <div className="flex gap-3 text-sm mt-2">
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
            <div>
              <div className="text-sm font-medium">Transaction ID</div>
              <input
                className="mt-1 w-full border rounded px-3 h-9 text-sm"
                placeholder="e.g., MM230914XYZ"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <div className="text-sm font-medium mt-3">Screenshot</div>
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
              disabled={submitting || !selectedPlan}
            >
              Submit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
