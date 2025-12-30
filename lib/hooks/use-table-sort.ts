"use client";

import { useState, useCallback } from "react";
import type { SortField, SortDirection } from "@/lib/types";

export interface UseTableSortOptions {
  defaultField?: SortField;
  defaultDirection?: SortDirection;
}

export interface UseTableSortReturn {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
}

export function useTableSort(
  options: UseTableSortOptions = {}
): UseTableSortReturn {
  const { defaultField = "earnings", defaultDirection = "desc" } = options;

  const [sortField, setSortField] = useState<SortField>(defaultField);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultDirection);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  return {
    sortField,
    sortDirection,
    handleSort,
    setSortField,
    setSortDirection,
  };
}



