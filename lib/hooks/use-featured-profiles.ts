"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { type FeaturedProfile } from "@/lib/supabase";
import { PROFILES_PER_PAGE } from "@/lib/constants/discover";
import { API_ROUTES } from "@/lib/constants/routes";

export interface UseFeaturedProfilesOptions {
  selectedCategories?: string[];
}

export interface UseFeaturedProfilesReturn {
  profiles: FeaturedProfile[];
  categories: string[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  totalProfiles: number;
  loadMore: () => void;
  reset: () => void;
}

// Fetcher for profiles
const profilesFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }
  return response.json();
};

// Fetcher for categories
const categoriesFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.categories;
};

export function useFeaturedProfiles(
  options: UseFeaturedProfilesOptions = {}
): UseFeaturedProfilesReturn {
  const { selectedCategories = [] } = options;

  // Create a stable key for categories filter
  const categoryKey = selectedCategories.sort().join(",");

  // SWR for categories (cached globally)
  const { data: categories = [] } = useSWR(
    API_ROUTES.DISCOVER_CATEGORIES,
    categoriesFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes cache
    }
  );

  // SWR Infinite for paginated profiles
  const getKey = useCallback(
    (pageIndex: number, previousPageData: any) => {
      // Return null if previous page had no more data
      if (previousPageData && !previousPageData.hasMore) return null;

      const params = new URLSearchParams({
        page: pageIndex.toString(),
        limit: PROFILES_PER_PAGE.toString(),
      });

      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      }

      return `${API_ROUTES.DISCOVER_FEATURED}?${params}`;
    },
    [selectedCategories]
  );

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite(getKey, profilesFetcher, {
    revalidateOnFocus: false,
    revalidateFirstPage: false,
    dedupingInterval: 60000, // 1 minute cache
    persistSize: true,
  });

  // Flatten all pages of profiles
  const profiles = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.profiles || []);
  }, [data]);

  // Get total from first page
  const totalProfiles = data?.[0]?.total || 0;

  // Check if there's more data
  const hasMore = data ? data[data.length - 1]?.hasMore : true;

  const loadMore = useCallback(() => {
    if (!isLoading && !isValidating && hasMore) {
      setSize(size + 1);
    }
  }, [isLoading, isValidating, hasMore, size, setSize]);

  const reset = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    profiles,
    categories,
    isLoading: isLoading || (!data && !error),
    page: size - 1,
    hasMore,
    totalProfiles,
    loadMore,
    reset,
  };
}
