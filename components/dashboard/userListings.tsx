"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "@/components/product-card";

export function UserListings() {
  const [listings, setListings] = useState([]);
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
//TODO after schema and api setup
//   return (
//     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {listings.map((product) => (
//         <ProductCard key={product._id} product={product} variant="compact" />
//       ))}
//     </div>
//   );
}
