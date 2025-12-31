import useSWR from "swr";
import type { TwitterProfile } from "@/lib/types/twitter";

interface TwitterSearchResponse {
  profiles: TwitterProfile[];
  source: "cache" | "api";
  count: number;
  error?: string;
}

interface UseTwitterSearchOptions {
  type?: "Top" | "Latest" | "People" | "Photos" | "Videos";
  count?: number;
  enabled?: boolean;
  cache?: boolean;
}

const fetcher = async (url: string): Promise<TwitterSearchResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export function useTwitterSearch(
  query: string,
  options: UseTwitterSearchOptions = {}
) {
  const { type = "Top", count = 20, enabled = true, cache = true } = options;

  // Build the URL with query params
  const url = query
    ? `/api/twitter/search?${new URLSearchParams({
        query,
        type,
        count: count.toString(),
        cache: cache.toString(),
      })}`
    : null;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TwitterSearchResponse>(enabled && query ? url : null, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
      keepPreviousData: true,
    });

  return {
    profiles: data?.profiles || [],
    source: data?.source,
    count: data?.count || 0,
    isLoading: isLoading && !data,
    isValidating,
    isError: !!error,
    error: error?.message,
    refresh: () => mutate(),
  };
}

// Hook for debounced search (useful for search-as-you-type)
export function useDebouncedTwitterSearch(
  query: string,
  options: UseTwitterSearchOptions & { debounceMs?: number } = {}
) {
  const { debounceMs = 500, ...searchOptions } = options;

  const shouldFetch = query.length >= 2; // Only search if query is at least 2 chars

  return useTwitterSearch(query, {
    ...searchOptions,
    enabled: shouldFetch,
  });
}




