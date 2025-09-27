"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/app/services/Category.Service";
import { useAuthLogout } from "@/hooks/use-auth-logout";
import { ListingCard } from "./ListingCard";
import { ListingEditModal } from "./ListingEditModal";

export interface Listing {
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
  expiresAt?: string;
}

interface UserListingsProps {
  userId: string;
}

export default function UserListings({ userId }: UserListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{
      _id: string;
      name: string;
      subcategories: Array<{ _id: string; name: string }>;
    }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const router = useRouter();

  useAuthLogout(() => {
    setListings([]);
    setLoading(false);
    setError(null);
    setSearchTerm("");
    setStatusFilter("all");
    setEditingListingId(null);
    setIsUpdating(false);
    setIsImageLoading(false);
    setCategories([]);
  });

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/products/user/${userId}`);
      if (!response.ok)
        throw new Error(`Failed to fetch listings: ${response.status}`);
      const data = await response.json();
      const mapped: Listing[] = (data.products || []).map((p: any) => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        price: p.price || { amount: 0, currency: "USD", negotiable: false },
        status: p.status || "active",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        views: p.views || 0,
        featured: !!p.featured,
        category: p.category_id || p.category || "",
        subCategory: p.subcategory_id || p.subCategory,
        condition: p.condition || "good",
        images: Array.isArray(p.images)
          ? p.images.map((img: any) =>
              typeof img === "string" ? { url: img, alt: p.title } : img
            )
          : [],
        location: p.location || { city: "", state: "", country: "" },
        tags: Array.isArray(p.tags) ? p.tags : [],
        showPhoneNumber: !!p.showPhoneNumber,
        expiresAt: p.expiresAt,
      }));
      setListings(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const service = new CategoryService();
      const data = await service.getCategories();
      setCategories(
        (data.categories || []).map((c: any) => ({
          _id: c._id ?? c.slug,
          name: c.name,
          subcategories: (c.subcategories || []).map((s: any) => ({
            _id: s._id ?? s.slug,
            name: s.name,
          })),
        }))
      );
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID is required to fetch listings");
      setLoading(false);
      return;
    }
    fetchUserListings();
    fetchCategories();
  }, [userId]);

  const handleUpdateListing = async (
    listingId: string,
    partial: Partial<Listing>
  ) => {
    try {
      setIsUpdating(true);
      const updateData: any = { ...partial };
      if (partial.category) {
        updateData.category_id = partial.category;
        delete updateData.category;
      }
      if (partial.subCategory) {
        updateData.subcategory_id = partial.subCategory;
        delete updateData.subCategory;
      }
      if (partial.images) {
        // Ensure we send back just raw URLs if server expects strings
        updateData.images = partial.images.map((img) => img.url || img);
      }
      updateData.user_id = userId;
      const response = await fetch(`/api/products/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new Error(e.error || "Failed to update listing");
      }
      const updated = await response.json();
      const up = updated.product || updated;
      setListings((prev) =>
        prev.map((l) =>
          l._id === listingId
            ? {
                ...l,
                ...partial,
                // Normalize any returned fields
                category: up.category_id || up.category || l.category,
                subCategory:
                  up.subcategory_id || up.subCategory || l.subCategory,
                images: Array.isArray(up.images)
                  ? up.images.map((img: any) =>
                      typeof img === "string"
                        ? { url: img, alt: up.title || l.title }
                        : img
                    )
                  : l.images,
                updatedAt: up.updatedAt || new Date().toISOString(),
              }
            : l
        )
      );
      setEditingListingId(null);
    } catch (e: any) {
      alert(e.message || "Failed to update listing");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveImage = async (listingId: string, imageIndex: number) => {
    if (!confirm("Remove this image?")) return;
    try {
      setIsImageLoading(true);
      const listing = listings.find((l) => l._id === listingId);
      if (!listing) return;
      const updatedImages = listing.images.filter((_, i) => i !== imageIndex);
      const response = await fetch(`/api/products/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages.map(img => img.url) }),
      });
      if (!response.ok) throw new Error("Failed to remove image");
      await response.json();
      setListings((prev) =>
        prev.map((l) =>
          l._id === listingId ? { ...l, images: updatedImages } : l
        )
      );
    } catch (e: any) {
      alert(e.message || "Failed to remove image");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAddImages = async (listingId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    try {
      setIsImageLoading(true);
      const formData = new FormData();
      formData.append("productId", listingId);
      formData.append("type", "product");
      Array.from(files).forEach((f) => formData.append("files", f));
      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!upload.ok) throw new Error("Upload failed");
      const result = await upload.json();
      let imageUrls: string[] = [];
      if (Array.isArray(result)) imageUrls = result;
      else if (Array.isArray(result.files))
        imageUrls = result.files.map((f: any) => f.url);
      else if (Array.isArray(result.urls)) imageUrls = result.urls;
      else throw new Error("Invalid upload response");
      const listing = listings.find((l) => l._id === listingId);
      if (!listing) return;
      const newImages = imageUrls.map((url) => ({ url, alt: "" }));
      const updatedImages = [...listing.images, ...newImages];
      const resp = await fetch(`/api/products/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages.map(img => img.url) }),
      });
      if (!resp.ok) throw new Error("Failed to save images");
      await resp.json();
      setListings((prev) =>
        prev.map((l) =>
          l._id === listingId ? { ...l, images: updatedImages } : l
        )
      );
    } catch (e: any) {
      alert(e.message || "Failed to add images");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      const resp = await fetch(`/api/products/${listingId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete listing");
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (e: any) {
      alert(e.message || "Failed to delete listing");
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch = l.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading your listings...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">Failed to load listings</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchUserListings} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="shrink-0">
          <h2 className="text-xl font-semibold">My Listings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your posted items
          </p>
        </div>
        {listings.length > 0 && (
          <div className="w-full sm:flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
              <SummaryStat
                label="Total Listings"
                value={listings.length}
                colorClass="text-primary"
              />
              <SummaryStat
                label="Active"
                value={listings.filter((l) => l.status === "active").length}
                colorClass="text-green-600"
              />
              <SummaryStat
                label="Sold"
                value={listings.filter((l) => l.status === "sold").length}
                colorClass="text-blue-600"
              />
              <SummaryStat
                label="Featured"
                value={listings.filter((l) => l.featured).length}
                colorClass="text-orange-600"
              />
            </div>
          </div>
        )}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserListings}
            className="flex-1 sm:flex-none"
          >
            <Package className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2 flex-1 sm:flex-none"
            onClick={() => router.push("/sell")}
          >
            {" "}
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredListings.map((l) => (
          <ListingCard
            key={l._id}
            listing={l}
            onEdit={() => setEditingListingId(l._id)}
            onDelete={handleDeleteListing}
            currencySymbol={l.price?.currency === "LRD" ? "L$" : "$"}
          />
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          {searchTerm || statusFilter !== "all" ? (
            <div className="space-y-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No listings found</h3>
              <p className="text-muted-foreground">
                No listings match your current search criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Package className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No listings yet</h3>
              <p className="text-muted-foreground">
                You haven't created any listings yet. Start selling by creating
                your first listing!
              </p>
              <Button onClick={() => router.push("/sell")}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Listing
              </Button>
            </div>
          )}
        </div>
      )}

      <ListingEditModal
        open={!!editingListingId}
        onOpenChange={(o) => {
          if (!o) setEditingListingId(null);
        }}
        listing={
          editingListingId
            ? listings.find((l) => l._id === editingListingId) || null
            : null
        }
        categories={categories}
        isLoadingCategories={isLoadingCategories}
        onSave={handleUpdateListing}
        saving={isUpdating}
        imageLoading={isImageLoading}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
