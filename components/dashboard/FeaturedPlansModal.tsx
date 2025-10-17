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
import FeaturedPaymentModal, {
  FeaturedPlanSummary,
} from "./FeaturedPaymentModal";

interface Plan {
  id: string; // plan key like "3_days"
  title?: string;
  days: number;
  price: number;
  currency?: string;
  description?: string;
}

interface ListingShort {
  _id: string;
  title: string;
}
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId?: string | null; // listing to feature; if absent, show selector
  listings?: ListingShort[]; // optional list of listings to choose from
}

export default function FeaturedPlansModal({
  open,
  onOpenChange,
  productId,
  listings = [],
}: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    fetch("/api/monetization/plans")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const featuredGroup = (json as any)?.plans?.featured_listing || {};
        const currency = (json as any)?.currency || "L$";
        const mapped: Plan[] = Object.entries(featuredGroup).map(
          ([key, val]: [string, any]) => ({
            id: key,
            title: val?.label,
            days: Number(val?.duration ?? 0),
            price: Number(val?.price ?? 0),
            currency,
            description: val?.description || "",
          })
        );
        setPlans(mapped);
        if (mapped.length > 0) setSelected(mapped[0].id);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));

    // Initialize default selected listing if not provided
    if (!productId && listings && listings.length > 0) {
      setSelectedListingId(listings[0]._id);
    } else if (productId) {
      setSelectedListingId(productId);
    }

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
            <DialogTitle>Feature Listing</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!productId && listings.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Select a listing</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {listings.map((l) => (
                    <label
                      key={l._id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                        selectedListingId === l._id ? "bg-muted/50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="feature-listing"
                        checked={selectedListingId === l._id}
                        onChange={() => setSelectedListingId(l._id)}
                        className="h-4 w-4"
                      />
                      <div className="text-sm truncate">{l.title}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Choose a featured plan.
            </p>

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
                        {p.title ?? `${p.days} day${p.days > 1 ? "s" : ""}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {p.days} day{p.days > 1 ? "s" : ""}
                      </div>
                      <div className="font-semibold">
                        {p.currency} {p.price}
                      </div>
                      <input
                        type="radio"
                        name="featured-plan"
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
              <Button
                onClick={handleBuy}
                disabled={
                  !selected ||
                  loading ||
                  (!productId && listings.length > 0 && !selectedListingId)
                }
              >
                Buy
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FeaturedPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        plan={(() => {
          const p = plans.find((x) => x.id === selected);
          if (!p) return null;
          const planSummary: FeaturedPlanSummary = {
            id: p.id,
            title: p.title,
            days: p.days,
            price: p.price,
            currency: p.currency,
            description: p.description,
          };
          return planSummary;
        })()}
        productId={productId ?? selectedListingId ?? null}
      />
    </>
  );
}
// End of file
