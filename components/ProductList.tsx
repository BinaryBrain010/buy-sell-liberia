import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";

interface ProductListProps {
  products: any[];
  onLike: (productId: string) => void;
  platformCurrency?: "USD" | "LRD";
}

export function ProductList({
  products,
  onLike,
  platformCurrency,
}: ProductListProps) {
  return (
    <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ProductCard
            product={product}
            variant="compact"
            onLike={onLike}
            platformCurrency={platformCurrency}
          />
        </motion.div>
      ))}
    </div>
  );
}
