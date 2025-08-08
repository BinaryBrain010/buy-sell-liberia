"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced fetch on query/category change
  React.useEffect(() => {
    const normalizedQuery = query.replace(/\s+/g, " ").trim();
    if (!normalizedQuery) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      let url = `/api/products?search=${encodeURIComponent(normalizedQuery)}`;
      if (selectedCategory) {
        url += `&category_id=${encodeURIComponent(selectedCategory)}`;
      }

      fetch(url)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setResults(Array.isArray(data.products) ? data.products : []);
          setShowResults(true);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          setResults([]);
          setShowResults(false);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, selectedCategory]);

  // Handle outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }

    if (showResults) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [showResults]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        const selectedProduct = results[highlightedIndex];
        router.push(`/products/${selectedProduct._id}`);
        setShowResults(false);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
      <div className="relative w-full flex gap-2">
        <div className="relative w-full">
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
                <ul>
                  {results.map((item, index) => {
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <Link href={`/products/${item._id}`} key={item._id}>
                        <li
                          className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                            isHighlighted ? "bg-muted" : "hover:bg-muted"
                          }`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          {(item.image || (item.images && item.images[0])) && (
                            <img
                              src={item.image || item.images[0]}
                              alt={item.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium text-sm">
                            {item.title}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {item.price?.amount
                              ? `${item.price.currency || "₨"}${item.price.amount}`
                              : ""}
                          </span>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
