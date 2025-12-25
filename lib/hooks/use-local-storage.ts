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
  startDate: string;
  endDate: string;
}

export interface AvailabilityData {
  timezone: string;
  slots: AvailabilitySlot[];
}

function getDefaultDateRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() + 1);
  const end = new Date(today);
  end.setDate(end.getDate() + 28);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

const defaultDates = getDefaultDateRange();

const DEFAULT_AVAILABILITY: AvailabilityData = {
  timezone: "America/New_York",
  slots: [
    {
      id: 1,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    },
    {
      id: 2,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    },
    {
      id: 3,
      name: "",
      duration: 30,
      times: [],
      price: 50,
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
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
