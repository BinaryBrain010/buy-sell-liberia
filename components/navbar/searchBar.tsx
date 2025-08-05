import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

export default function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search/product?q=${encodeURIComponent(query)}&limit=8`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setResults(data.results || []);
          setShowResults(true);
        })
        .catch(() => {
          setResults([]);
          setShowResults(false);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  // Hide results on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    if (showResults) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showResults]);

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder="Search for anything..."
          className="pl-10 glass border-0 input-shadow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
        />
        {showResults && (
          <div className="absolute left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
            ) : (
              <ul>
                {results.map((item) => (
                  <li key={item.id} className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover" />
                    )}
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.price ? `L$${item.price}` : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
