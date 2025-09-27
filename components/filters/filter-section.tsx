"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  /** Callback when user applies filters returning UI filter payload */
  onFiltersApply?: (filters: {
    search: string;
    sortBy: string;
    condition?: string[];
    priceMin?: number;
    priceMax?: number;
  }) => void;
}

export function FiltersSection(props: FiltersSectionProps) {
  const {
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    showFilters,
    onToggleFilters,
  } = props;
  // Local state for filters
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localSort, setLocalSort] = useState(sortBy);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(
    null
  );
  const [localPriceMin, setLocalPriceMin] = useState<string>("");
  const [localPriceMax, setLocalPriceMax] = useState<string>("");

  // Sync local state with props if they change externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    setLocalSort(sortBy);
  }, [sortBy]);

  const handleApplyFilters = () => {
    onSearchChange(localSearch);
    onSortChange(localSort);
    const conditionArray = selectedCondition ? [selectedCondition] : undefined;
    const priceMinNum = localPriceMin ? Number(localPriceMin) : undefined;
    const priceMaxNum = localPriceMax ? Number(localPriceMax) : undefined;
    if (props.onFiltersApply) {
      props.onFiltersApply({
        search: localSearch,
        sortBy: localSort,
        condition: conditionArray,
        priceMin: priceMinNum,
        priceMax: priceMaxNum,
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalSort("newest");
    setSelectedCondition(null);
    setLocalPriceMin("");
    setLocalPriceMax("");
    onSearchChange("");
    onSortChange("newest");
    if (props.onFiltersApply) {
      props.onFiltersApply({ search: "", sortBy: "newest" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-background/50 rounded-xl p-6 border border-border/50 card-shadow mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 input-shadow"
            />
          </div>
        </div>

        {/* Sort */}
        <Select value={localSort} onValueChange={setLocalSort}>
          <SelectTrigger className="w-full lg:w-48 input-shadow">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode */}
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters Button */}
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="btn-shadow bg-transparent"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 pt-6 border-t border-border/50"
        >
          <div className="space-y-4">
            {/* Example filter fields */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Condition
              </label>
              <div className="flex flex-wrap gap-2">
                {["Brand New", "Like New", "Good", "Fair", "Poor"].map(
                  (condition) => (
                    <Button
                      key={condition}
                      variant={
                        selectedCondition === condition ? "default" : "outline"
                      }
                      size="sm"
                      className="btn-shadow bg-transparent"
                      onClick={() =>
                        setSelectedCondition(
                          condition === selectedCondition ? null : condition
                        )
                      }
                    >
                      {condition}
                    </Button>
                  )
                )}
              </div>
            </div>
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range
              </label>
              <div className="flex gap-3 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">
                    Min
                  </span>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={localPriceMin}
                    onChange={(e) =>
                      setLocalPriceMin(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-32"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1">
                    Max
                  </span>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Any"
                    value={localPriceMax}
                    onChange={(e) =>
                      setLocalPriceMax(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-32"
                  />
                </div>
                {localPriceMin &&
                  localPriceMax &&
                  Number(localPriceMin) > Number(localPriceMax) && (
                    <p className="text-xs text-red-500 w-full">
                      Min price cannot exceed Max price.
                    </p>
                  )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="btn-shadow"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
              <Button className="btn-shadow" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
