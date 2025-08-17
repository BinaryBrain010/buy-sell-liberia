"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductService } from "@/app/services/Product.Service";

// Cache the in-flight fetch to avoid duplicate requests in React Strict Mode (dev)
let featuredProductsPromise: Promise<{ products?: any[] }> | null = null;

const fetchFeaturedProducts = (svc: ProductService) => {
  if (!featuredProductsPromise) {
    featuredProductsPromise = svc
      .getProducts({}, { featured: -1 }, { page: 1, limit: 10 })
      .catch((err) => {
        // Reset cache on failure to allow retries
        featuredProductsPromise = null;
        throw err;
      });
  }
  return featuredProductsPromise;
};

export function FeaturedListings() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const productService = new ProductService();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await fetchFeaturedProducts(productService);
        setProducts(data.products ?? []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Listings
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover the best deals available
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-lg text-muted-foreground">
            Loading featured listings...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-lg text-muted-foreground">
            No featured listings found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => router.push(`/products/${product._id}`)}
              >
                <ProductCard
                  product={product}
                  variant="compact"
                  onLike={(productId) =>
                    console.log("Liked product:", productId)
                  }
                />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="glass border-0 bg-transparent"
            onClick={() => router.push("/products")}
          >
            View All Listings
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
