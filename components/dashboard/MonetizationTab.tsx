"use client";

import { useEffect, useMemo, useState } from "react";
import { convertAmount, formatMoney } from "@/lib/currency";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCopied, setLastCopied] = useState<string | null>(null);
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [listResp, plansResp, publicSettingsResp] = await Promise.all([
          fetch(`/api/products/user/${userId}`),
          fetch(`/api/monetization/plans`),
          fetch(`/api/settings/public`),
        ]);
        const listJson = await listResp.json().catch(() => ({}));
        const pJson = await plansResp.json().catch(() => ({}));
        const sJson = await publicSettingsResp.json().catch(() => ({}));
        if (!mounted) return;
        const ls: ListingShort[] = (listJson.products || []).map((p: any) => ({
          _id: p._id,
          title: p.title,
        }));
        setListings(ls);
        setSelectedListingId((prev) => prev || (ls[0]?._id ?? null));
        // currency can be taken from plans; but we also read settings public as fallback
        setPlans({ ...pJson, currency: pJson?.currency ?? sJson?.currency });
        if (sJson?.rates) {
          setRates({
            usdToLrdRate: Number(sJson.rates.usdToLrdRate ?? 200),
            lrdToUsdRate: Number(sJson.rates.lrdToUsdRate ?? 0.005),
          });
        }
        const pd = sJson?.paymentDetails;
        const hasAny = Boolean(pd?.mtn || pd?.orange || pd?.bank);
        setPaymentDetails(hasAny ? pd : pJson?.paymentDetails || null);
        setError(null);
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? (e as any).message
            : undefined;
        setError((msg as string) || "Failed to load monetization data");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const currencyCode = plans?.currency ?? "LRD";
  const currencySymbol = useMemo(
    () => (currencyCode === "USD" ? "$" : "L$"),
    [currencyCode]
  );
  const bumpGroup = plans?.plans?.bump_listing ?? {};
  const featuredGroup = plans?.plans?.featured_listing ?? {};
  // Normalized paid categories shape with legacy fallback
  const paidCategories = {
    enabled: plans?.paidCategories?.enabled ?? !!plans?.paidCategoriesEnabled,
    enforceActive: plans?.paidCategories?.enforceActive ?? false,
  };

  const handleCopy = async (label: string, text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setLastCopied(label);
      setTimeout(() => setLastCopied(null), 1500);
    } catch {
      // noop
    }
  };

  const SectionHeader = ({ title, hint }: { title: string; hint?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
      <CardTitle>{title}</CardTitle>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Monetization</h2>
          <p className="text-sm text-muted-foreground">
            Buy bumps, feature your listings, and view payment details.
          </p>
        </div>
        {/* Pills removed: currency and paid categories */}
      </div>

      {/* Listing selector */}
      <Card>
        <CardHeader>
          <SectionHeader
            title="Select a listing"
            hint={listings.length ? `${listings.length} found` : undefined}
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => setBumpOpen(true)}
                disabled={!selectedListingId}
              >
                Buy Bumps
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => setFeatureOpen(true)}
                disabled={!selectedListingId}
              >
                Feature Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bump plans summary */}
      <Card>
        <CardHeader>
          <SectionHeader
            title="Bump plans"
            hint="Raise your listing to the top"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded border animate-pulse bg-muted"
                />
              ))}
            </div>
          ) : Object.keys(bumpGroup).length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No bump plans available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(bumpGroup).map(([key, val]: any) => (
                <div
                  key={key}
                  className="border rounded p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="font-medium">{val.label ?? key}</div>
                  <div className="text-xs text-muted-foreground">
                    {val.credits} bump{val.credits > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 font-semibold flex items-baseline gap-2">
                    <span>
                      {(() => {
                        const from = String(
                          val?.currency || "USD"
                        ).toUpperCase();
                        const to = currencyCode;
                        const r = rates ?? {
                          usdToLrdRate: 200,
                          lrdToUsdRate: 0.005,
                        };
                        const converted = convertAmount(
                          Number(val?.price || 0),
                          from,
                          to,
                          r
                        );
                        return formatMoney(converted, to);
                      })()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (
                      {formatMoney(
                        Number(val?.price || 0),
                        String(val?.currency || "USD").toUpperCase()
                      )}
                      )
                    </span>
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
          <SectionHeader
            title="Featured plans"
            hint="Boost visibility for multiple days"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded border animate-pulse bg-muted"
                />
              ))}
            </div>
          ) : Object.keys(featuredGroup).length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No featured plans available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(featuredGroup).map(([key, val]: any) => (
                <div
                  key={key}
                  className="border rounded p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="font-medium">{val.label ?? key}</div>
                  <div className="text-xs text-muted-foreground">
                    {val.duration} day{val.duration > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 font-semibold flex items-baseline gap-2">
                    <span>
                      {(() => {
                        const from = String(
                          val?.currency || "USD"
                        ).toUpperCase();
                        const to = currencyCode;
                        const r = rates ?? {
                          usdToLrdRate: 200,
                          lrdToUsdRate: 0.005,
                        };
                        const converted = convertAmount(
                          Number(val?.price || 0),
                          from,
                          to,
                          r
                        );
                        return formatMoney(converted, to);
                      })()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (
                      {formatMoney(
                        Number(val?.price || 0),
                        String(val?.currency || "USD").toUpperCase()
                      )}
                      )
                    </span>
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
          <SectionHeader
            title="Payment details"
            hint="Use these to send your payment"
          />
        </CardHeader>
        <CardContent className="text-sm">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded border animate-pulse bg-muted"
                />
              ))}
            </div>
          ) : !paymentDetails ? (
            <div className="text-muted-foreground">
              No payment details available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paymentDetails.mtn && (
                <div className="rounded border p-3">
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
                <div className="rounded border p-3">
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
                <div className="rounded border p-3">
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
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
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
