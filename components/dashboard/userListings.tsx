"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Package } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Price } from "@/app/api/modules/products/services/product.service";

// Define the shape of a product
interface Product {
  _id: string;
  title: string;
  description: string;
  price: Price;
  category: string;
  subCategory: string;
  condition: string;
  images: { url: string; alt?: string }[];
  titleImageIndex: number;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  contactInfo: object;
  seller: string;
  status: string;
  tags: string[];
  negotiable: boolean;
  showPhoneNumber: boolean;
  views: number;
  // expiresAt: string;
  createdAt: string;
  updatedAt: string;
}


// Define the shape of the API response
interface ApiResponse {
  message: string;
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Define props for UserListings
interface UserListingsProps {
  userId: string;
}

export default function UserListings({ userId }: UserListingsProps) {
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is required to fetch products.");
      setLoading(false);
      return;
    }

    axios(`/api/products?seller=${userId}`)
      .then((res: { data: ApiResponse }) => {
        setListings(res.data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No products yet</h3>
        <p className="text-muted-foreground">Start by creating your first product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Products</h2>
          <p className="text-sm text-muted-foreground">
            {listings.length} total products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant="compact" // or "default" depending on your styling
            onLike={(productId) => {
              console.log("Liked product:", productId);
            }}
          />
        ))}
      </div>
    </div>
  );
}
