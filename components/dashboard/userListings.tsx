"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BuySellLoader from "@/components/loader/BuySellLoader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Package,
  Grid3X3,
  List,
  Eye,
  Calendar,
  MapPin,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    setViewMode("grid");
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
        body: JSON.stringify({ images: updatedImages.map((img) => img.url) }),
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
        body: JSON.stringify({ images: updatedImages.map((img) => img.url) }),
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
      <div className="p-6">
        <BuySellLoader label="Loading your listings..." />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            Failed to Load Listings
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={fetchUserListings}
            className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative">
        {/* Background accent */}
        <div className="absolute -inset-2 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-green-500/5 rounded-2xl opacity-50" />

        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    My Listings
                  </h2>
                  <p className="text-muted-foreground">
                    Manage your posted items and track their performance
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto flex-wrap">
              <Button
                variant="outline"
                onClick={fetchUserListings}
                className="px-6 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button
                onClick={() => router.push("/sell")}
                className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" /> New Listing
              </Button>
            </div>
          </div>

          {/* Enhanced Statistics */}
          {listings.length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-2xl font-bold text-primary">
                  {listings.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Listings
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="text-2xl font-bold text-green-600">
                  {listings.filter((l) => l.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-600">
                  {listings.filter((l) => l.status === "sold").length}
                </div>
                <div className="text-sm text-muted-foreground">Sold</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-600">
                  {listings.filter((l) => l.featured).length}
                </div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl opacity-50" />

        <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search your listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl text-base"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-border/30 focus:border-primary/50 transition-colors rounded-xl">
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

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                View:
              </span>
              <div className="flex border-2 border-border/30 rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-10 px-4 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-primary to-v0-dark-blue text-white shadow-lg"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-10 px-4 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-primary to-v0-dark-blue text-white shadow-lg"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Listings Display */}
      {filteredListings.length > 0 ? (
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-blue-500/5 rounded-2xl opacity-50" />

          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Your Listings ({filteredListings.length})
              </h3>
              <div className="text-sm text-muted-foreground">
                Showing {filteredListings.length} of {listings.length} listings
              </div>
            </div>

            {/* Conditional Rendering based on View Mode */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            ) : (
              <div className="space-y-4">
                {filteredListings.map((l) => (
                  <ListingListItem
                    key={l._id}
                    listing={l}
                    onEdit={() => setEditingListingId(l._id)}
                    onDelete={handleDeleteListing}
                    currencySymbol={l.price?.currency === "LRD" ? "L$" : "$"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enhanced Empty States */
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-orange-500/5 rounded-2xl opacity-50" />

          <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-12 border border-border/30">
            {searchTerm || statusFilter !== "all" ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    No listings found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    No listings match your current search criteria. Try
                    adjusting your filters.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-6 py-3 border-2 border-border/30 hover:border-primary/50 transition-colors"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-v0-dark-blue flex items-center justify-center shadow-lg">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any listings yet. Start selling by
                    creating your first listing!
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/sell")}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-v0-dark-blue hover:from-primary/90 hover:to-v0-dark-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Listing
                </Button>
              </div>
            )}
          </div>
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

// Enhanced List View Item Component
function ListingListItem({
  listing,
  onEdit,
  onDelete,
  currencySymbol,
}: {
  listing: Listing;
  onEdit: () => void;
  onDelete: (id: string) => void;
  currencySymbol: string;
}) {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const maxDescriptionLength = 150;

  // Image URL resolution function (same as ListingCard)
  const resolveImageUrl = (raw?: string) => {
    if (!raw) return "/placeholder.jpg";
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    const cleaned = raw.replace(/^\/+/, "");
    if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
    if (cleaned.startsWith("uploads/")) return `/api/${cleaned}`;
    if (/\.[a-zA-Z0-9]{2,5}$/.test(cleaned)) return `/api/uploads/${cleaned}`;
    return "/placeholder.jpg";
  };

  const truncateDescription = (text: string) => {
    if (text.length <= maxDescriptionLength) return text;
    return text.substring(0, maxDescriptionLength) + "...";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "sold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl border border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Section */}
          <div className="flex-shrink-0">
            <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden bg-muted/50">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={resolveImageUrl(listing.images[0].url)}
                  alt={listing.images[0].alt || listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {currencySymbol}
                      {listing.price.amount}
                    </span>
                    {listing.price.negotiable && (
                      <span className="text-sm text-muted-foreground">
                        (Negotiable)
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        listing.status
                      )}`}
                    >
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </span>
                    {listing.featured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 dark:from-orange-900/20 dark:to-yellow-900/20 dark:text-orange-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-muted-foreground leading-relaxed">
                  {expandedDescription
                    ? listing.description
                    : truncateDescription(listing.description)}
                </p>
                {listing.description.length > maxDescriptionLength && (
                  <button
                    onClick={() => setExpandedDescription(!expandedDescription)}
                    className="text-primary hover:text-primary/80 text-sm font-medium mt-2 transition-colors"
                  >
                    {expandedDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {formatDate(listing.createdAt)}</span>
                </div>
                {listing.location.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location.city}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md text-xs bg-muted/50 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {listing.tags.length > 4 && (
                    <span className="px-2 py-1 rounded-md text-xs bg-muted/50 text-muted-foreground">
                      +{listing.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-auto">
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 border-2 border-border/30 hover:border-primary/50 transition-colors"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(listing._id)}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
