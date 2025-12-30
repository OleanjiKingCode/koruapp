"use client";

import { useState, useEffect, useCallback } from "react";

interface ScrollPosition {
  scrollY: number;
  scrollX: number;
  isNearBottom: boolean;
  scrollPercentage: number;
}

interface UseScrollPositionOptions {
  bottomThreshold?: number; // Percentage (0-100) to consider "near bottom"
}

/**
 * Hook to track scroll position and detect when near bottom of page
 */
export function useScrollPosition(
  options: UseScrollPositionOptions = {}
): ScrollPosition {
  const { bottomThreshold = 90 } = options;

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

    const nearBottom = scrolledPercentage >= bottomThreshold;
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





