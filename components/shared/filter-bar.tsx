"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  CloseIcon as XIcon,
  GridIcon,
  ListIcon,
  SortIcon,
  ChevronDownIcon,
  LoadingIcon,
} from "@/components/icons";

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (categories: string[]) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
  categories?: string[];
  selectedCategories?: string[];
  currentSort?: string;
  currentView?: "grid" | "list";
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
  isSearching?: boolean;
  minSearchLength?: number;
}

const defaultCategories = [
  "All",
  "Web3",
  "Tech",
  "Business",
  "Medical",
  "Sports",
];
const sortOptions = [
  { value: "highest_earned", label: "Highest Earned" },
  { value: "lowest_price", label: "Lowest Price" },
  { value: "fastest_replies", label: "Fastest Replies" },
  { value: "most_followers", label: "Most Followers" },
];

export function FilterBar({
  onSearch,
  onCategoryChange,
  onSortChange,
  onViewChange,
  categories = defaultCategories,
  selectedCategories = [],
  currentSort = "highest_earned",
  currentView = "grid",
  showSearch = true,
  searchPlaceholder = "Search X handles...",
  className,
  isSearching = false,
  minSearchLength = 2,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search - triggers as user types
  useEffect(() => {
    // Clear any existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only search if query meets minimum length or is empty (to clear results)
    if (searchQuery.length >= minSearchLength || searchQuery.length === 0) {
      debounceRef.current = setTimeout(() => {
        onSearch?.(searchQuery);
      }, 400); // 400ms debounce
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, onSearch, minSearchLength]);

  const handleClear = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-12 pr-12 h-12 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:border-koru-purple focus:ring-koru-purple/20"
          />
          {/* Right side: Loading spinner or Clear button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isSearching && searchQuery.length >= minSearchLength && (
              <LoadingIcon className="w-4 h-4 text-koru-purple animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Category Pills */}
        <div className="flex-1 min-w-0 relative overflow-hidden">
          {/* Scrollable container with hidden scrollbar */}
          <div className="overflow-x-auto pb-2 sm:pb-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center gap-2 pr-16">
              {categories.map((category) => {
                const isAll = category === "All";
                const isSelected = isAll
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(category);

                const handleClick = () => {
                  if (isAll) {
                    // Clear all selections
                    onCategoryChange?.([]);
                  } else {
                    // Toggle this category
                    if (selectedCategories.includes(category)) {
                      // Remove it
                      onCategoryChange?.(
                        selectedCategories.filter((c) => c !== category)
                      );
                    } else {
                      // Add it
                      onCategoryChange?.([...selectedCategories, category]);
                    }
                  }
                };

                return (
                  <motion.button
                    key={category}
                    onClick={handleClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      isSelected
                        ? "bg-koru-purple text-white shadow-md shadow-koru-purple/25"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    )}
                  >
                    {category}
                  </motion.button>
                );
              })}
            </div>
          </div>
          {/* Fade overlay on right to indicate more content */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 dark:from-neutral-950 dark:via-neutral-950/80 to-transparent pointer-events-none" />
        </div>

        {/* Sort & View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Dropdown */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                <SortIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortOptions.find((o) => o.value === currentSort)?.label ||
                    "Sort"}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange?.(option.value)}
                  className={cn(
                    "cursor-pointer",
                    currentSort === option.value &&
                      "bg-koru-purple/10 text-koru-purple"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu> */}

          {/* View Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => onViewChange?.("grid")}
              className={cn(
                "p-2 rounded-md transition-all",
                currentView === "grid"
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-koru-purple"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange?.("list")}
              className={cn(
                "p-2 rounded-md transition-all",
                currentView === "list"
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-koru-purple"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

