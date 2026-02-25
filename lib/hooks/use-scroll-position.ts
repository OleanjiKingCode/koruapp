"use client";

import { useState, useEffect, useCallback } from "react";

interface ScrollPosition {
  scrollY: number;
  scrollX: number;
  isNearBottom: boolean;
  scrollPercentage: number;
}

interface UseScrollPositionOptions {
  /** Pixel distance from bottom to consider "near bottom" (default: 200) */
  bottomThreshold?: number;
}

/**
 * Hook to track scroll position and detect when near bottom of page
 * Uses pixel-based threshold (distance from bottom in pixels)
 */
export function useScrollPosition(
  options: UseScrollPositionOptions = {}
): ScrollPosition {
  const { bottomThreshold = 200 } = options;

  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    scrollX: 0,
    isNearBottom: false,
    scrollPercentage: 0,
  });

  const calculateScrollPosition = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollableHeight = documentHeight - windowHeight;
    const scrolledPercentage =
      scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 100;

    // Calculate distance from bottom in pixels
    const distanceFromBottom = documentHeight - windowHeight - scrollTop;
    
    // Near bottom when within threshold pixels of bottom AND has scrolled enough
    const nearBottom = distanceFromBottom <= bottomThreshold && scrollTop > 200;
    const cannotScroll = scrollableHeight <= 50;

    setScrollPosition({
      scrollY: scrollTop,
      scrollX: scrollLeft,
      isNearBottom: nearBottom || cannotScroll,
      scrollPercentage: scrolledPercentage,
    });
  }, [bottomThreshold]);

  useEffect(() => {
    // Initial calculation
    calculateScrollPosition();

    // Listen to scroll events
    window.addEventListener("scroll", calculateScrollPosition, {
      passive: true,
    });
    window.addEventListener("resize", calculateScrollPosition, {
      passive: true,
    });

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(calculateScrollPosition);
    });
    resizeObserver.observe(document.body);

    // Use MutationObserver to detect DOM changes
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(calculateScrollPosition);
      });
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    // Fallback interval for edge cases
    const intervalId = setInterval(calculateScrollPosition, 500);

    return () => {
      window.removeEventListener("scroll", calculateScrollPosition);
      window.removeEventListener("resize", calculateScrollPosition);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [calculateScrollPosition]);

  return scrollPosition;
}






