"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface ListingEditData {
  _id: string;
  title: string;
  description: string;
  price: { amount: number; currency: string; negotiable: boolean };
  status: "active" | "sold" | "draft" | "expired";
  createdAt: string;
  updatedAt: string;
  views: number;
  featured: boolean;
  category: string;
  subCategory?: string;
  condition: string;
  images: { url: string; alt?: string }[];
  location: { city: string; state?: string; country: string };
  tags: string[];
  showPhoneNumber: boolean;
}

interface CategoryOption {
  _id: string;
  name: string;
  subcategories: Array<{ _id: string; name: string }>;
}

interface ListingEditModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: ListingEditData | null;
  categories: CategoryOption[];
  isLoadingCategories: boolean;
  onSave: (id: string, data: Partial<ListingEditData>) => Promise<void>;
  saving: boolean;
  imageLoading: boolean;
}

export function ListingEditModal({
  open,
  onOpenChange,
  listing,
  categories,
  isLoadingCategories,
  onSave,
  saving,
  imageLoading,
}: ListingEditModalProps) {
  const [form, setForm] = useState<Partial<ListingEditData>>({});
  const [subcategories, setSubcategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);

  useEffect(() => {
    if (listing) {
      setForm({ ...listing });
      const cat = categories.find((c) => c._id === listing.category);
      setSubcategories(cat?.subcategories || []);
    } else {
      setForm({});
      setSubcategories([]);
    }
  }, [listing, categories]);

  const handleCategoryChange = (id: string) => {
    setForm((prev) => ({ ...prev, category: id, subCategory: undefined }));
    const cat = categories.find((c) => c._id === id);
    setSubcategories(cat?.subcategories || []);
  };

  if (!listing) return null;

  // Normalize image URL coming from parent (may be relative, absolute, or undefined)
  const resolveImageUrl = (raw?: string) => {
    if (!raw) return "/placeholder.jpg"; // fallback
    // Already absolute (http/https or data URI)
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    // Remove leading slashes
    const cleaned = raw.replace(/^\/+/, "");
    // If it already looks like an uploads path, ensure correct prefix
    if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
    if (cleaned.startsWith("uploads/")) return `/api/${cleaned}`;
    // If it contains a dot extension assume it's a stored filename
    if (/\.[a-zA-Z0-9]{2,5}$/.test(cleaned)) return `/api/uploads/${cleaned}`;
    // Otherwise return placeholder
    return "/placeholder.jpg";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Title *
              </label>
              <Input
                value={form.title || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1 h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Condition *
              </label>
              <Select
                value={form.condition || listing.condition}
                onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <Select
                value={form.category || listing.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue
                    placeholder={
                      isLoadingCategories ? "Loading..." : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Subcategory
              </label>
              <Select
                disabled={!form.category || subcategories.length === 0}
                value={form.subCategory || ""}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, subCategory: v }))
                }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue
                    placeholder={
                      !form.category
                        ? "Select category first"
                        : subcategories.length
                        ? "Select subcategory"
                        : "No subcategories"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.length === 0 ? (
                    <SelectItem value="no-subcategories" disabled>
                      No subcategories
                    </SelectItem>
                  ) : (
                    subcategories.map((sc) => (
                      <SelectItem key={sc._id} value={sc._id}>
                        {sc.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Description *
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm resize-none h-24"
            />
          </div>

          {/* Price / Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Price *
              </label>
              <Input
                type="number"
                min="0"
                value={form.price?.amount ?? listing.price.amount ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: {
                      amount: parseFloat(e.target.value) || 0,
                      currency:
                        f.price?.currency || listing.price.currency || "USD",
                      negotiable:
                        f.price?.negotiable || listing.price.negotiable,
                    },
                  }))
                }
                className="mt-1 h-9"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.price?.negotiable || listing.price.negotiable}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: {
                        amount: f.price?.amount ?? listing.price.amount,
                        currency: f.price?.currency || listing.price.currency,
                        negotiable: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
                <span className="text-xs text-muted-foreground">
                  Negotiable
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Status *
              </label>
              <Select
                value={form.status || listing.status}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    status: v as ListingEditData["status"],
                  }))
                }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div>
              <label className="text-xs font-medium text-muted-foreground">
                Featured
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.featured ?? listing.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                <span className="text-xs text-muted-foreground">
                  Mark as Featured
                </span>
              </div>
            </div> */}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["city", "state", "country"].map((field) => (
              <div key={field}>
                <label className="text-xs font-medium text-muted-foreground capitalize">
                  {field} {field !== "state" && "*"}{" "}
                </label>
                <Input
                  value={
                    (form.location as any)?.[field] ??
                    (listing.location as any)[field] ??
                    ""
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      location: {
                        city: (f.location?.city ?? listing.location.city) || "",
                        state:
                          (f.location?.state ?? listing.location.state) || "",
                        country:
                          (f.location?.country ?? listing.location.country) ||
                          "",
                        [field]: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 h-9"
                />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            <Input
              value={(form.tags || listing.tags || []).join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                }))
              }
              className="mt-1 h-9"
              placeholder="comma,separated,tags"
            />
          </div>

          {/* Images */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Images{" "}
              {imageLoading && (
                <span className="ml-2 text-blue-600 text-[11px]">
                  Processing...
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {listing.images.length ? (
                listing.images.map((img, i) => {
                  const isCover = i === 0;
                  return (
                    <div
                      key={i}
                      className="relative border rounded overflow-hidden group"
                    >
                      <img
                        src={resolveImageUrl(img.url)}
                        alt={img.alt || `Image ${i + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/placeholder.jpg";
                        }}
                      />
                      {isCover && (
                        <span className="absolute top-1 left-1 bg-primary/80 text-[10px] px-1 py-[2px] rounded text-white tracking-wide">
                          COVER
                        </span>
                      )}
                      <div className="absolute top-1 right-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                        {!isCover && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 text-[10px] bg-background/70 backdrop-blur"
                            onClick={() => {
                              setForm((f) => {
                                const current = f.images || listing.images;
                                if (!current || !current.length) return f;
                                const copy = [...current];
                                const [sel] = copy.splice(i, 1);
                                copy.unshift(sel);
                                return { ...f, images: copy };
                              });
                            }}
                            disabled={imageLoading}
                            title="Set as cover"
                          >
                            ↑
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground col-span-full">
                  No images
                </p>
              )}
            </div>
            {/* Image upload removed as per request */}
          </div>

          {/* Contact */}
          {/* <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.showPhoneNumber ?? listing.showPhoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, showPhoneNumber: e.target.checked }))
              }
              className="h-4 w-4"
            />
            <span className="text-xs text-muted-foreground">
              Display phone number
            </span>
          </div> */}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => onSave(listing._id, form)} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
