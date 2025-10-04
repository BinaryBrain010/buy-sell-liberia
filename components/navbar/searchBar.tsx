"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductService } from "@/app/services/Product.Service";

type SearchBarProps = {
  variant?: "inline" | "overlay";
  onClose?: () => void;
  initialQuery?: string;
};

export default function SearchBar({
  variant = "inline",
  onClose,
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize query for overlay use-cases
  React.useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  // Simple currency formatter with sane defaults for this app
  const formatPrice = React.useCallback((price: any) => {
    if (!price || typeof price.amount !== "number") return "";
    const code = String(price.currency || "USD").toUpperCase();
    const symbols: Record<string, string> = {
      USD: "$",
      LRD: "L$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      GHS: "₵",
    };
    const symbol = symbols[code] || "$";
    return `${symbol}${price.amount.toLocaleString()}`;
  }, []);

  // Normalization + simple client-side filter/rank to refine relevance
  const normalize = React.useCallback((s: string) => {
    return (
      s
        ?.normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim() || ""
    );
  }, []);

  const filterAndRank = React.useCallback(
    (products: any[], q: string) => {
      const tokens = normalize(q).split(/\s+/).filter(Boolean);
      if (!tokens.length) return [];
      return products
        .map((item) => {
          const title = normalize(item.title ?? "");
          const desc = normalize(item.description ?? "");
          const tags = Array.isArray(item.tags)
            ? item.tags.map((t: string) => normalize(t)).join(" ")
            : "";

          const matchesAll = tokens.every(
            (t) => title.includes(t) || desc.includes(t) || tags.includes(t)
          );
          if (!matchesAll) return null as any;

          let score = 0;
          for (const t of tokens) {
            if (title.startsWith(t)) score += 3;
            if (title.includes(t)) score += 2;
            if (tags.includes(t)) score += 1;
            if (desc.includes(t)) score += 0.5;
          }
          return { item, score };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score)
        .map((x: any) => x.item);
    },
    [normalize]
  );

  // Debounced fetch on query/category change
  React.useEffect(() => {
    const normalizedQuery = query.replace(/\s+/g, " ").trim();
    if (!normalizedQuery || normalizedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      const productService = new ProductService();
      productService
        .getProducts(
          {
            search: normalizedQuery,
            ...(selectedCategory ? { category_id: selectedCategory } : {}),
          },
          {},
          { page: 1, limit: 10 }
        )
        .then((data) => {
          const products = Array.isArray(data.products) ? data.products : [];
          const filtered = filterAndRank(products, normalizedQuery);
          setResults(filtered);
          setShowResults(filtered.length > 0);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          setResults([]);
          setShowResults(false);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, selectedCategory, filterAndRank]);

  // Handle outside click for inline dropdown
  React.useEffect(() => {
    if (variant !== "inline") return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setShowResults(false);
      }
    }
    if (showResults) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showResults, variant]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + results.length) % results.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        const selectedProduct = results[highlightedIndex];
        router.push(`/products/${selectedProduct._id}`);
        setShowResults(false);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      if (variant === "overlay") onClose?.();
    }
  };

  // Autofocus when overlay opens
  React.useEffect(() => {
    if (variant === "overlay" && inputRef.current) {
      // Delay to ensure element is painted
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [variant]);

  const ResultsList = () => (
    <ul>
      {results.map((item, index) => {
        const isHighlighted = index === highlightedIndex;
        const resolveImage = (img: any): string | undefined => {
          if (!img) return undefined;
          const value =
            typeof img === "string" ? img : img.url || img.path || img.src;
          if (!value) return undefined;
          if (/^https?:\/\//i.test(value) || value.startsWith("/api/uploads")) {
            return value;
          }
          const clean = value.replace(/^\/+/, "");
          return `/api/uploads/${clean}`;
        };
        const firstImage = Array.isArray(item.images)
          ? item.images[0]
          : item.image;
        const imgSrc = resolveImage(firstImage);
        return (
          <li
            key={item._id}
            className={`px-4 py-2 cursor-pointer ${
              isHighlighted ? "bg-muted" : "hover:bg-muted"
            }`}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            <Link
              href={`/products/${item._id}`}
              className="flex items-center gap-2 w-full"
              onClick={onClose}
            >
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={item.title || "Product image"}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder.jpg";
                  }}
                />
              )}
              <span className="font-medium text-sm">{item.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatPrice(item.price)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl bg-background shadow-lg h-full md:h-auto md:mt-10 md:rounded-lg flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close search"
              onClick={onClose}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="relative flex-1" ref={containerRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                ref={inputRef}
                placeholder="Search for anything..."
                className="pl-10 input-shadow"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setShowResults(true)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear"
              onClick={() => setQuery("")}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {query ? "No results found" : "Type to search"}
              </div>
            ) : (
              <ResultsList />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline (desktop) version
  return (
    <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
      <div className="relative w-full flex gap-2">
        <div className="relative w-full" ref={containerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            placeholder="Search for anything..."
            className="pl-10 glass border-0 input-shadow"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            onKeyDown={handleKeyDown}
          />
          {showResults && (
            <div className="absolute left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No results found
                </div>
              ) : (
                <ResultsList />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
