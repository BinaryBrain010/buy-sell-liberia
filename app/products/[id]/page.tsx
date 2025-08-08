"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetail from "./ProductDetail";

export default function ProductDetailPage() {
  const params = useParams();
  const _id = params?.id;
  useEffect(() => {
    console.log("ProductDetailPage useParams:", params);
  }, [params]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/products/${_id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        console.log("API response:", data);
        if (data && typeof data.product === "object" && data.product !== null) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    }
    if (_id) fetchProduct();
  }, [_id]);

  if (!_id) {
    return (
      <div className="py-8 text-center text-red-500">
        No product ID found in route.
      </div>
    );
  }
  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error)
    return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!product)
    return <div className="py-8 text-center">Product not found</div>;

  return <ProductDetail {...product} />;
}
