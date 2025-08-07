"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "@/components/product-card";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  condition: string;
  titleImageIndex: number;
  contactInfo: string;
  images: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  views: number;
  likes: number;
  isActive: boolean;
  isSold: boolean;
  tags: string[];
  seller: string; // Add seller property
  status: string; // Add status property
  negotiable: boolean; // Add negotiable property
  showPhoneNumber: boolean; // Add showPhoneNumber property
  
  // Add any other properties required by ProductCard's Product type here
  [key: string]: any;
};

export function UserListings() {
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/user/listings").then((res) => {
      setListings(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading your listings...</p>;

  if (listings.length === 0)
    return <p className="text-muted-foreground">You have no listings yet.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((product) => (
        <ProductCard key={product._id} product={product} variant="compact" />
      ))}
    </div>
  );
}
