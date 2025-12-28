"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getFeaturedProfiles,
  getFeaturedCategories,
  type FeaturedProfile,
} from "@/lib/supabase";
import { PROFILES_PER_PAGE } from "@/lib/constants/discover";

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

export function useFeaturedProfiles(
  options: UseFeaturedProfilesOptions = {}
): UseFeaturedProfilesReturn {
  const { selectedCategories = [] } = options;

  const [profiles, setProfiles] = useState<FeaturedProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalProfiles, setTotalProfiles] = useState(0);

  const loadProfiles = useCallback(
    async (pageNum: number, shouldReset: boolean = false) => {
      setIsLoading(true);
      try {
        const result = await getFeaturedProfiles(
          pageNum,
          PROFILES_PER_PAGE,
          selectedCategories.length > 0 ? selectedCategories : undefined
        );

        if (shouldReset) {
          setProfiles(result.profiles);
        } else {
          setProfiles((prev) => [...prev, ...result.profiles]);
        }
        setHasMore(result.hasMore);
        setTotalProfiles(result.total);
      } catch (error) {
        console.error("Error loading featured profiles:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategories]
  );

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      const cats = await getFeaturedCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Reset and load when categories change
  useEffect(() => {
    setPage(0);
    loadProfiles(0, true);
  }, [selectedCategories, loadProfiles]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProfiles(nextPage, false);
    }
  }, [isLoading, hasMore, page, loadProfiles]);

  const reset = useCallback(() => {
    setPage(0);
    loadProfiles(0, true);
  }, [loadProfiles]);

  return {
    profiles,
    categories,
    isLoading,
    page,
    hasMore,
    totalProfiles,
    loadMore,
    reset,
  };
}

