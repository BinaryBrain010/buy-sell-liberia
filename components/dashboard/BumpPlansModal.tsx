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
import BumpPaymentModal, {
  BumpPlanSummary,
} from "@/components/dashboard/BumpPaymentModal";
import { convertAmount, formatMoney } from "@/lib/currency";

interface Plan {
  id: string;
  title?: string;
  bumps: number;
  price: number;
  currency?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId?: string | null;
}

export default function BumpPlansModal({
  open,
  onOpenChange,
  productId,
}: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch("/api/monetization/plans").then((r) => r.json()).catch(() => ({})),
      fetch("/api/settings/public").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([p, s]) => {
        if (!mounted) return;
        // Unified response: json.plans.bump_listing is an object keyed by plan id
        const bumpGroup = (p as any)?.plans?.bump_listing || {};
        const mapped: Plan[] = Object.entries(bumpGroup).map(
          ([key, val]: [string, any]) => ({
            id: key,
            title: val?.label,
            bumps: Number(val?.credits ?? 0),
            price: Number(val?.price ?? 0),
            currency: (String(val?.currency || "USD").toUpperCase() as any),
            description: val?.description || "",
          })
        );
        setPlans(mapped);
        if (mapped.length > 0) setSelected(mapped[0].id);
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
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open]);

  function handleBuy() {
    const plan = plans.find((p) => p.id === selected);
    if (!plan) return;
    setPaymentOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Bumps</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a bump plan.</p>

            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No plans available
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                      selected === p.id ? "border-primary/50 bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {p.title ?? `${p.bumps} bump${p.bumps > 1 ? "s" : ""}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {p.bumps} bump{p.bumps > 1 ? "s" : ""}
                      </div>
                      <div className="font-semibold flex items-baseline gap-2">
                        <span>
                          {(() => {
                            const from = String(p.currency || "USD").toUpperCase();
                            const to = platformCurrency;
                            const r = rates ?? { usdToLrdRate: 200, lrdToUsdRate: 0.005 };
                            const converted = convertAmount(Number(p.price || 0), from, to, r);
                            return formatMoney(converted, to);
                          })()}
                        </span>
                        <span className="text-xs text-muted-foreground">(
                          {formatMoney(Number(p.price || 0), String(p.currency || "USD").toUpperCase())}
                        )</span>
                      </div>
                      <input
                        type="radio"
                        name="plan"
                        checked={selected === p.id}
                        onChange={() => setSelected(p.id)}
                        className="h-4 w-4"
                      />
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleBuy} disabled={!selected || loading}>
                Buy
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <BumpPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        plan={(() => {
          const p = plans.find((x) => x.id === selected);
          if (!p) return null;
          const planSummary: BumpPlanSummary = {
            id: p.id,
            title: p.title,
            bumps: p.bumps,
            price: p.price,
            currency: p.currency,
            description: p.description,
          };
          return planSummary;
        })()}
        productId={productId ?? null}
      />
    </>
  );
}
// End of file
