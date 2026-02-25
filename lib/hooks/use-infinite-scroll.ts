"use client";

import { useEffect, useRef, useCallback } from "react";

export interface UseInfiniteScrollOptions {
  /** Whether more items can be loaded */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading: boolean;
  /** Callback to load more items */
  onLoadMore: () => void;
  /** Intersection observer threshold (0-1) */
  threshold?: number;
  /** Whether infinite scroll is enabled */
  enabled?: boolean;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const {
    hasMore,
    isLoading,
    onLoadMore,
    threshold = 0.1,
    enabled = true,
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoading && enabled) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, enabled, onLoadMore]
  );

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(handleIntersect, { threshold });

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [handleIntersect, threshold, enabled]);

  return { sentinelRef };
}




