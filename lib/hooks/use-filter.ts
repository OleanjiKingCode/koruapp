"use client";

import { useState, useMemo, useCallback } from "react";

interface UseFilterOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialCategory?: string;
  categoryField?: keyof T;
}

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
}

/**
 * Hook for managing filter state and filtered data
 */
export function useFilter<T extends Record<string, unknown>>({
  data,
  searchFields = [],
  initialCategory = "All",
  categoryField,
}: UseFilterOptions<T>) {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: "",
    selectedCategory: initialCategory,
    sortBy: "default",
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    setFilterState((prev) => ({ ...prev, selectedCategory: category }));
  }, []);

  const setSortBy = useCallback((sort: string) => {
    setFilterState((prev) => ({ ...prev, sortBy: sort }));
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter by search query
    if (filterState.searchQuery && searchFields.length > 0) {
      const query = filterState.searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return (
            typeof value === "string" && value.toLowerCase().includes(query)
          );
        })
      );
    }

    // Filter by category
    if (filterState.selectedCategory !== "All" && categoryField) {
      result = result.filter(
        (item) => item[categoryField] === filterState.selectedCategory
      );
    }

    return result;
  }, [data, filterState, searchFields, categoryField]);

  return {
    filteredData,
    filterState,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
  };
}



