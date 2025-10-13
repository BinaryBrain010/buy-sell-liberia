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

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    fetch("/api/bump-plans")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const arr = Array.isArray(json)
          ? json
          : Array.isArray((json as any)?.plans)
          ? (json as any).plans
          : [];
        const mapped = arr.map((p: any) => ({
          id: String(p.id || p._id),
          title: p.title,
          bumps: Number(p.bumps),
          price: Number(p.price),
          currency: p.currency || "L$",
          description: p.description || "",
        }));
        setPlans(mapped);
        if (mapped.length > 0) setSelected(mapped[0].id);
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
                      <div className="font-semibold">
                        {p.currency} {p.price}
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
