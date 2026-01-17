"use client";

import { useState, useCallback } from "react";

// ============================================
// Rate Limiter: Max 10 refreshes per minute
// ============================================
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REFRESHES_PER_WINDOW = 10;

let refreshCount = 0;
let windowStartTime = Date.now();

function canRefresh(): boolean {
  const now = Date.now();

  // Reset window if expired
  if (now - windowStartTime > RATE_LIMIT_WINDOW_MS) {
    refreshCount = 0;
    windowStartTime = now;
  }

  if (refreshCount >= MAX_REFRESHES_PER_WINDOW) {
    console.log("[useRefreshableImage] Rate limit reached, skipping refresh");
    return false;
  }

  refreshCount++;
  return true;
}

// ============================================
// Recently Checked Cache: Skip if < 24h ago
// ============================================
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const recentlyCheckedCache = new Map<string, number>();

function wasRecentlyChecked(username: string): boolean {
  const lastChecked = recentlyCheckedCache.get(username.toLowerCase());
  if (!lastChecked) return false;

  const isRecent = Date.now() - lastChecked < CACHE_DURATION_MS;
  if (isRecent) {
    console.log(
      `[useRefreshableImage] ${username} was checked recently, skipping`
    );
  }
  return isRecent;
}

function markAsChecked(username: string): void {
  recentlyCheckedCache.set(username.toLowerCase(), Date.now());

  // Cleanup old entries periodically (keep cache size manageable)
  if (recentlyCheckedCache.size > 500) {
    const now = Date.now();
    for (const [key, time] of recentlyCheckedCache.entries()) {
      if (now - time > CACHE_DURATION_MS) {
        recentlyCheckedCache.delete(key);
      }
    }
  }
}

// ============================================
// Hook Implementation
// ============================================
interface UseRefreshableImageOptions {
  initialSrc?: string;
  username?: string;
  onImageUpdated?: (newUrl: string) => void;
}

interface UseRefreshableImageReturn {
  imageSrc: string | undefined;
  hasError: boolean;
  isRefreshing: boolean;
  handleError: () => void;
}

/**
 * Hook to handle image loading with automatic refresh from Twitter API on error.
 * Includes rate limiting (10/min) and 24h cache to prevent excessive API calls.
 */
export function useRefreshableImage({
  initialSrc,
  username,
  onImageUpdated,
}: UseRefreshableImageOptions): UseRefreshableImageReturn {
  const [imageSrc, setImageSrc] = useState<string | undefined>(initialSrc);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  const handleError = useCallback(async () => {
    // Guard: Already tried or no username
    if (hasAttemptedRefresh || !username) {
      setHasError(true);
      return;
    }

    // Guard: Recently checked (within 24h)
    if (wasRecentlyChecked(username)) {
      setHasError(true);
      return;
    }

    // Guard: Rate limit exceeded
    if (!canRefresh()) {
      setHasError(true);
      return;
    }

    setHasAttemptedRefresh(true);
    setIsRefreshing(true);
    markAsChecked(username); // Mark before fetch to prevent duplicate calls

    try {
      const response = await fetch(`/api/profile/${username}`);

      if (!response.ok) {
        setHasError(true);
        return;
      }

      const data = await response.json();
      const newImageUrl = data.profile?.profileImageUrl;

      if (newImageUrl && newImageUrl !== initialSrc) {
        setImageSrc(newImageUrl);
        setHasError(false);
        onImageUpdated?.(newImageUrl);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error(
        `[useRefreshableImage] Failed to refresh ${username}:`,
        error
      );
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [username, initialSrc, hasAttemptedRefresh, onImageUpdated]);

  return {
    imageSrc,
    hasError,
    isRefreshing,
    handleError,
  };
}
