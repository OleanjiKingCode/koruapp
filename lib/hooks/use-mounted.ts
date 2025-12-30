"use client";

import { useState, useEffect } from "react";

/**
 * Hook to track if the component is mounted (client-side)
 * Useful for avoiding hydration mismatches with SSR
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}





