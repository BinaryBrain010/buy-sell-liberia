"use client";

import { useEffect, useState, useMemo } from "react";
import { convertAmount, formatMoney } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  } | null>(null);

  const canSend = useMemo(
    () =>
      !submitting &&
      !!plan &&
      !!productId &&
      !!transactionId.trim() &&
      !!screenshotFile,
    [submitting, plan, productId, transactionId, screenshotFile]
  );

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setError(null);
    Promise.all([
      fetch("/api/settings/public")
        .then((r) => r.json())
        .catch(() => ({})),
      fetch("/api/monetization/plans")
        .then((r) => r.json())
        .catch(() => ({})),
    ])
      .then(([s, p]) => {
        if (!mounted) return;
        const pd = s?.paymentDetails;
        const hasAny = Boolean(pd?.mtn || pd?.orange || pd?.bank);
        setPaymentDetails(hasAny ? pd : p?.paymentDetails || null);
        if (s?.currency === "USD" || s?.currency === "LRD") {
          setPlatformCurrency(s.currency);
        }
        if (s?.rates) {
          setRates({
            usdToLrdRate: Number(s.rates.usdToLrdRate ?? 200),
            lrdToUsdRate: Number(s.rates.lrdToUsdRate ?? 0.005),
          });
        }
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
      if (!canSend || !plan || !screenshotFile) {
        setError("Please complete required fields");
        return;
      }
      const screenshot = await toBase64(screenshotFile as File);

      const resp = await fetch("/api/monetization/manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureType: "featured_listing",
          listing: productId,
          plan: plan.id, // e.g., "7_days"
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
      toast({
        title: "Payment submitted",
        description:
          "We'll notify you once it's approved and your listing is featured.",
      });
    } catch (e: any) {
      const msg = e?.message || "Submission failed";
      setError(msg);
      toast({ title: "Error", description: msg });
    } finally {
      setSubmitting(false);
    }
  }

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
            Submit Featured Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <div className="rounded border p-4 bg-background/50">
            <div className="font-medium text-sm tracking-wide uppercase text-muted-foreground">
              Selected Plan
            </div>
            <div className="mt-1 text-sm text-foreground">
              {plan ? (
                <>
                  <div>
                    {plan.title ??
                      `${plan.days} day${plan.days > 1 ? "s" : ""}`}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">
                      {(() => {
                        const from = String(
                          plan.currency || "USD"
                        ).toUpperCase();
                        const to = platformCurrency;
                        const r = rates ?? {
                          usdToLrdRate: 200,
                          lrdToUsdRate: 0.005,
                        };
                        const converted = convertAmount(
                          Number(plan.price || 0),
                          from,
                          to,
                          r
                        );
                        return formatMoney(converted, to);
                      })()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (
                      {(() => {
                        const orig = String(
                          plan.currency || "USD"
                        ).toUpperCase();
                        return formatMoney(Number(plan.price || 0), orig);
                      })()}
                      )
                    </span>
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

          {/* Helper */}
          <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3 leading-relaxed">
            <strong className="font-medium">Tip:</strong> Send your payment then
            fill in the Transaction ID & upload the screenshot. After approval
            your listing will automatically be featured.
          </div>

          {/* Transaction */}
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
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium flex items-center justify-between">
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
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
          {!canSend && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Complete the following to enable Send:</div>
              <ul className="list-disc ml-4 space-y-0.5">
                {!plan && <li>Select a plan</li>}
                {!productId && <li>Select a listing</li>}
                {!transactionId.trim() && <li>Enter transaction ID</li>}
                {!screenshotFile && <li>Attach screenshot</li>}
              </ul>
            </div>
          )}
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
            <Button onClick={handleSubmit} disabled={!canSend}>
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
