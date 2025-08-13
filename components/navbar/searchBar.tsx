"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [subcategories, setSubcategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced fetch on query change
  React.useEffect(() => {
    const normalizedQuery = query.replace(/\s+/g, " ").trim();
    if (!normalizedQuery) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          // Combine products, categories, and subcategories, add a type field for rendering
          const productResults = (data.products || []).map((p: any) => ({ ...p, _type: "product" }));
          const categoryResults = (data.categories || []).map((c: any) => ({ ...c, _type: "category" }));
          const subcategoryResults = (data.subcategories || []).map((s: any) => ({ ...s, _type: "subcategory" }));
          setResults([...productResults, ...categoryResults, ...subcategoryResults]);
          setSubcategories(subcategoryResults);
          setShowResults(true);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          setResults([]);
          setShowResults(false);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

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
        const selected = results[highlightedIndex];
        if (selected._type === "product") {
          router.push(`/products/${selected._id}`);
        } else if (selected._type === "category") {
          router.push(`/categories/${selected.slug || selected._id}`);
        }
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
                    if (item._type === "product") {
                      return (
                        <Link href={`/products/${item._id}`} key={item._id} onClick={() => setShowResults(false)}>
                          <li
                            className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                              isHighlighted ? "bg-muted" : "hover:bg-muted"
                            }`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            {(item.images && item.images[0]?.url) && (
                              <img
                                src={item.images[0].url}
                                alt={item.title}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                            {item.category && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {item.category.name}
                              </span>
                            )}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {item.price?.amount
                                ? `${item.price.currency || "₨"}${item.price.amount}`
                                : ""}
                            </span>
                          </li>
                        </Link>
                      );
                    } else if (item._type === "category") {
                      return (
                        <Link href={`/categories/${item.slug || item._id}`} key={item._id} onClick={() => setShowResults(false)}>
                          <li
                            className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                              isHighlighted ? "bg-muted" : "hover:bg-muted"
                            }`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              Category
                            </span>
                          </li>
                        </Link>
                      );
                    } else if (item._type === "subcategory") {
                      return (
                        <Link href={`/categories/${item.slug || item._id}`} key={item._id} onClick={() => setShowResults(false)}>
                          <li
                            className={`px-4 py-2 flex items-center gap-2 cursor-pointer ${
                              isHighlighted ? "bg-muted" : "hover:bg-muted"
                            }`}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>
                            {item.parent && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {item.parent.name}
                              </span>
                            )}
                            <span className="ml-auto text-xs text-muted-foreground">
                              Subcategory
                            </span>
                          </li>
                        </Link>
                      );
                    }
                    return null;
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
