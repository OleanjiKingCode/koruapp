"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to sync state with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook specifically for font preference
 */
export function useFontPreference(defaultFont = "quicksand") {
  const [font, setFont] = useLocalStorage("koru-font", defaultFont);

  const applyFont = useCallback(
    (fontValue: string, shouldApply = true) => {
      if (!shouldApply) return;

      document.body.classList.remove(
        "font-quicksand",
        "font-tenor",
        "font-lemon"
      );
      document.body.classList.add(`font-${fontValue}`);
      setFont(fontValue);
    },
    [setFont]
  );

  return { font, setFont, applyFont };
}

