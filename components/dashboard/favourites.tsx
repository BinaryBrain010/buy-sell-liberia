"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ProductCard } from "@/components/product-card";

export function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/user/favorites").then((res) => {
      setFavorites(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading favorites...</p>;

  if (favorites.length === 0)
    return <p className="text-muted-foreground">No favorite products yet.</p>;
//TODO after schema and api setup
//   return (
//     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {favorites.map((product) => (
//         <ProductCard key={product._id} product={product} variant="compact" />
//       ))}
//     </div>
//   );
}
