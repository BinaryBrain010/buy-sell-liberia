"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BumpPlansModal from "@/components/dashboard/BumpPlansModal";
import FeaturedPlansModal from "@/components/dashboard/FeaturedPlansModal";

type ListingShort = { _id: string; title: string };

type PaymentDetails = {
  mtn?: { name?: string; number?: string } | null;
  orange?: { name?: string; number?: string } | null;
  bank?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  } | null;
};

export default function MonetizationTab({ userId }: { userId: string }) {
  const [listings, setListings] = useState<ListingShort[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [plans, setPlans] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [bumpOpen, setBumpOpen] = useState(false);
  const [featureOpen, setFeatureOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [listResp, plansResp, detResp] = await Promise.all([
          fetch(`/api/products/user/${userId}`),
          fetch(`/api/monetization/plans`),
          fetch(`/api/monetization/details`),
        ]);
        const listJson = await listResp.json().catch(() => ({}));
        const pJson = await plansResp.json().catch(() => ({}));
        const dJson = await detResp.json().catch(() => ({}));
        if (!mounted) return;
        const ls: ListingShort[] = (listJson.products || []).map((p: any) => ({
          _id: p._id,
          title: p.title,
        }));
        setListings(ls);
        setSelectedListingId((prev) => prev || (ls[0]?._id ?? null));
        setPlans(pJson);
        setPaymentDetails(dJson?.paymentDetails || null);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const currency = plans?.currency ?? "L$";
  const bumpGroup = plans?.plans?.bump_listing ?? {};
  const featuredGroup = plans?.plans?.featured_listing ?? {};

  return (
    <div className="p-4 space-y-6">
      {/* Listing selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select a listing</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 items-center">
          <Select
            value={selectedListingId ?? undefined}
            onValueChange={(v) => setSelectedListingId(v)}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Choose a listing" />
            </SelectTrigger>
            <SelectContent>
              {listings.map((l) => (
                <SelectItem key={l._id} value={l._id}>
                  {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBumpOpen(true)}
              disabled={!selectedListingId}
            >
              Buy Bumps
            </Button>
            <Button
              onClick={() => setFeatureOpen(true)}
              disabled={!selectedListingId}
            >
              Feature Listing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bump plans summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bump plans</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(bumpGroup).length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No bump plans available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(bumpGroup).map(([key, val]: any) => (
                <div key={key} className="border rounded p-3">
                  <div className="font-medium">{val.label ?? key}</div>
                  <div className="text-sm text-muted-foreground">
                    {val.credits} bump{val.credits > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 font-semibold">
                    {currency} {val.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured plans summary */}
      <Card>
        <CardHeader>
          <CardTitle>Featured plans</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(featuredGroup).length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No featured plans available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(featuredGroup).map(([key, val]: any) => (
                <div key={key} className="border rounded p-3">
                  <div className="font-medium">{val.label ?? key}</div>
                  <div className="text-sm text-muted-foreground">
                    {val.duration} day{val.duration > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 font-semibold">
                    {currency} {val.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment details overview */}
      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!paymentDetails ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BumpPlansModal
        open={bumpOpen}
        onOpenChange={setBumpOpen}
        productId={selectedListingId}
      />
      <FeaturedPlansModal
        open={featureOpen}
        onOpenChange={setFeatureOpen}
        productId={selectedListingId}
      />
    </div>
  );
}
