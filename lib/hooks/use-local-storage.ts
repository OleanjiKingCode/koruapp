"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { FONT_OPTIONS } from "@/lib/constants";

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
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * Hook specifically for font preference
 */
export function useFontPreference(defaultFont = "quicksand") {
  const [font, setFont] = useLocalStorage("koru-font", defaultFont);
  const pathname = usePathname();

  const applySelectedOption = useCallback(
    (selectedValue: string) => {
      const selectedOption =
        FONT_OPTIONS.find((option) => option.value === selectedValue) ??
        FONT_OPTIONS.find((option) => option.value === defaultFont) ??
        FONT_OPTIONS[0];

      FONT_OPTIONS.forEach((option) =>
        document.body.classList.remove(option.className)
      );
      document.body.classList.add(selectedOption.className);

      return selectedOption.value;
    },
    [defaultFont]
  );

  const applyFont = useCallback(
    (fontValue: string, shouldApply = true) => {
      if (!shouldApply) return;

      const selectedValue = applySelectedOption(fontValue);
      setFont(selectedValue);
    },
    [applySelectedOption, setFont]
  );

  useEffect(() => {
    if (pathname === "/") {
      FONT_OPTIONS.forEach((option) =>
        document.body.classList.remove(option.className)
      );
      return;
    }

    applySelectedOption(font);
  }, [applySelectedOption, font, pathname]);

  return { font, setFont, applyFont };
}

/**
 * Hook for managing availability data
 */
export interface AvailabilitySlot {
  id: number;
  name: string;
  duration: number;
  times: string[];
  price: number;
  selectedDates: string[]; // Array of ISO date strings
}

export interface AvailabilityData {
  timezone: string;
  slots: AvailabilitySlot[];
}

function getDefaultSelectedDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  // Generate next 14 days by default
  for (let i = 1; i <= 14; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    dates.push(nextDay.toISOString().split("T")[0]);
  }
  return dates;
}

const defaultSelectedDates = getDefaultSelectedDates();

const DEFAULT_AVAILABILITY: AvailabilityData = {
  timezone: "America/New_York",
  slots: [
    {
      id: 1,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      selectedDates: defaultSelectedDates,
    },
    {
      id: 2,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      selectedDates: defaultSelectedDates,
    },
    {
      id: 3,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      selectedDates: defaultSelectedDates,
    },
  ],
};

export function useAvailability() {
  const [availability, setAvailability] = useLocalStorage<AvailabilityData>(
    "koru-availability",
    DEFAULT_AVAILABILITY
  );

  const filledSlots = availability.slots.filter(
    (s) => s.name && s.times.length > 0
  );

  const hasAvailability = filledSlots.length > 0;

  return {
    availability,
    setAvailability,
    filledSlots,
    hasAvailability,
  };
}
