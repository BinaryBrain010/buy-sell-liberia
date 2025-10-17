"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Star, Edit, Trash2 } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { convertAmount, formatMoney } from "@/lib/currency";

export interface ListingCardProps {
  listing: any;
  onEdit: (listing: any) => void;
  onDelete: (id: string) => void;
  currencySymbol?: string;
}

const statusCap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ListingCard({
  listing,
  onEdit,
  onDelete,
  currencySymbol = "$",
}: ListingCardProps) {
  const [platformCurrency, setPlatformCurrency] = useState<"USD" | "LRD">(
    "USD"
  );
  const [rates, setRates] = useState<{
    usdToLrdRate: number;
    lrdToUsdRate: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (data?.currency === "USD" || data?.currency === "LRD") {
          setPlatformCurrency(data.currency);
        }
        if (data?.rates) {
          setRates({
            usdToLrdRate: Number(data.rates.usdToLrdRate ?? 200),
            lrdToUsdRate: Number(data.rates.lrdToUsdRate ?? 0.005),
          });
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const { primaryDisplay, secondaryDisplay } = useMemo(() => {
    const amt = Number(listing?.price?.amount ?? 0);
    const orig = String(listing?.price?.currency || "USD").toUpperCase();
    const to = platformCurrency;
    const effectiveRates = rates ?? { usdToLrdRate: 200, lrdToUsdRate: 0.005 };
    const converted = convertAmount(amt, orig, to, effectiveRates);
    const primary = formatMoney(converted, to);

    // Secondary: if original differs, show original; else show opposite converted
    let secondary = "";
    if (orig !== to) {
      secondary = formatMoney(amt, orig);
    } else {
      const opposite = to === "USD" ? "LRD" : "USD";
      const oppAmt = convertAmount(amt, to, opposite, effectiveRates);
      secondary = formatMoney(oppAmt, opposite);
    }
    return { primaryDisplay: primary, secondaryDisplay: secondary };
  }, [listing?.price, platformCurrency, rates]);
  const resolveImageUrl = (raw?: string) => {
    if (!raw) return "/placeholder.jpg";
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    const cleaned = raw.replace(/^\/+/, "");
    if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
    if (cleaned.startsWith("uploads/")) return `/api/${cleaned}`;
    if (/\.[a-zA-Z0-9]{2,5}$/.test(cleaned)) return `/api/uploads/${cleaned}`;
    return "/placeholder.jpg";
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "sold":
        return "secondary";
      case "draft":
        return "outline";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="w-full overflow-hidden rounded-t-lg bg-muted/40">
        <img
          src={resolveImageUrl(listing.images?.[0]?.url)}
          alt={listing.images?.[0]?.alt || listing.title || "Listing image"}
          className="w-full h-44 sm:h-36 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
      </div>
      {listing.images && listing.images.length > 1 && (
        <div className="flex gap-1 px-2 pt-2 overflow-x-auto">
          {listing.images.slice(1, 6).map((img: any, idx: number) => (
            <div
              key={idx}
              className="w-10 h-10 rounded overflow-hidden border flex-shrink-0 bg-muted/30"
            >
              <img
                src={resolveImageUrl(img.url)}
                alt={img.alt || `${listing.title} ${idx + 2}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/placeholder.jpg";
                }}
              />
            </div>
          ))}
          {listing.images.length > 6 && (
            <div className="w-10 h-10 flex items-center justify-center text-[10px] bg-muted rounded border text-muted-foreground">
              +{listing.images.length - 6}
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className="text-base line-clamp-1 break-words overflow-hidden">
              {listing.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1 text-sm break-words overflow-hidden">
              {listing.description}
            </CardDescription>
          </div>
          {listing.featured && (
            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-semibold">{primaryDisplay}</span>
            <span className="text-[11px] text-muted-foreground">
              {secondaryDisplay}
            </span>
            {listing.price?.negotiable && (
              <span className="text-xs font-normal text-muted-foreground mt-0.5">
                Negotiable
              </span>
            )}
          </div>
          <Badge
            className="text-[11px]"
            variant={getStatusColor(listing.status) as any}
          >
            {statusCap(listing.status)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 gap-y-1 text-xs text-muted-foreground justify-start sm:justify-between">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {listing.views} views
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />{" "}
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 bg-transparent"
            onClick={() => onEdit(listing)}
          >
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:flex-1 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(listing._id)}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
