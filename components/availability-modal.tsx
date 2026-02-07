"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import {
  ClockIcon,
  GlobeIcon,
  PlusIcon,
  ChevronLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CalendarIcon,
  ChevronRightIcon,
} from "@/components/icons";

// Calendar Picker Component
function CalendarPicker({
  selectedDates,
  onDateToggle,
  currentMonth,
  onMonthChange,
  maxWeeks = 52, // Default to 1 year
}: {
  selectedDates: string[];
  onDateToggle: (date: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  maxWeeks?: number;
}) {
  const { minDate, maxDate } = getCalendarBounds(maxWeeks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const days: (number | null)[] = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
    );
    if (newMonth >= new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      onMonthChange(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    if (newMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      onMonthChange(newMonth);
    }
  };

  const canGoPrev =
    currentMonth > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canGoNext =
    currentMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            canGoPrev
              ? "hover:bg-neutral-200 dark:hover:bg-neutral-700"
              : "opacity-30 cursor-not-allowed",
          )}
        >
          <ChevronLeftIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {monthName}
        </span>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            canGoNext
              ? "hover:bg-neutral-200 dark:hover:bg-neutral-700"
              : "opacity-30 cursor-not-allowed",
          )}
        >
          <ChevronRightIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          );
          // Use local date formatting to avoid timezone issues
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const dayStr = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${dayStr}`;
          const isSelected = selectedDates.includes(dateStr);
          const isPast = date < minDate;
          const isFuture = date > maxDate;
          const isDisabled = isPast || isFuture;

          return (
            <button
              key={day}
              onClick={() => !isDisabled && onDateToggle(dateStr)}
              disabled={isDisabled}
              className={cn(
                "aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                isDisabled && "opacity-30 cursor-not-allowed",
                !isDisabled && !isSelected && "hover:bg-koru-purple/10",
                isSelected &&
                  "bg-koru-purple text-white shadow-sm shadow-koru-purple/30",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Common timezones
export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
  { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", offset: "UTC+11" },
];

// Duration options in minutes
export const DURATION_OPTIONS = [
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 40, label: "40 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export interface AvailabilitySlot {
  id: number;
  name: string;
  duration: number; // in minutes
  times: string[]; // Selected time slots like "08:00-08:20"
  price: number; // Price in USD
  selectedDates: string[]; // Array of ISO date strings
}

// Helper to get calendar bounds (tomorrow to specified weeks)
export function getCalendarBounds(weeks: number = 8): {
  minDate: Date;
  maxDate: Date;
} {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1); // Tomorrow
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + weeks * 7);
  return { minDate, maxDate };
}

// Quick selection types for date patterns
export type DateSelectionPattern =
  | "custom"
  | "weekdays"
  | "weekends"
  | "every_monday"
  | "every_tuesday"
  | "every_wednesday"
  | "every_thursday"
  | "every_friday"
  | "next_1_month"
  | "next_3_months"
  | "all_available";

// Helper to generate dates based on a pattern
export function generateDatesFromPattern(
  pattern: DateSelectionPattern,
  weeksAhead: number = 8,
): string[] {
  const dates: string[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 1); // Tomorrow

  let endDate: Date;
  if (pattern === "next_1_month") {
    endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (pattern === "next_3_months") {
    endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (pattern === "all_available") {
    endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate = new Date(today);
    endDate.setDate(endDate.getDate() + weeksAhead * 7);
  }

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    let shouldInclude = false;

    switch (pattern) {
      case "weekdays":
        shouldInclude = dayOfWeek >= 1 && dayOfWeek <= 5;
        break;
      case "weekends":
        shouldInclude = dayOfWeek === 0 || dayOfWeek === 6;
        break;
      case "every_monday":
        shouldInclude = dayOfWeek === 1;
        break;
      case "every_tuesday":
        shouldInclude = dayOfWeek === 2;
        break;
      case "every_wednesday":
        shouldInclude = dayOfWeek === 3;
        break;
      case "every_thursday":
        shouldInclude = dayOfWeek === 4;
        break;
      case "every_friday":
        shouldInclude = dayOfWeek === 5;
        break;
      case "next_1_month":
      case "next_3_months":
      case "all_available":
        shouldInclude = dayOfWeek >= 1 && dayOfWeek <= 5; // Default to weekdays
        break;
      default:
        shouldInclude = false;
    }

    if (shouldInclude) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Format date for display
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface AvailabilityData {
  timezone: string;
  slots: AvailabilitySlot[];
}

interface AvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AvailabilityData;
  onSave?: (data: AvailabilityData) => void;
}

type Step = "slots" | "configure";

// Generate time slots based on duration
function generateTimeSlots(duration: number): string[] {
  const slots: string[] = [];
  const startHour = 8; // Start at 8 AM
  const endHour = 22; // End at 10 PM

  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes + duration <= endMinutes) {
    const startTime = formatMinutesToTime(currentMinutes);
    const endTime = formatMinutesToTime(currentMinutes + duration);
    slots.push(`${startTime}-${endTime}`);
    currentMinutes += duration;
  }

  return slots;
}

function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

function createDefaultSlots(): AvailabilitySlot[] {
  return [
    { id: 1, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
    { id: 2, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
    { id: 3, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
  ];
}

export function AvailabilityModal({
  open,
  onOpenChange,
  initialData,
  onSave,
}: AvailabilityModalProps) {
  const [step, setStep] = useState<Step>("slots");
  const [timezone, setTimezone] = useState(
    initialData?.timezone || TIMEZONES[0].value,
  );
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    initialData?.slots || createDefaultSlots(),
  );
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  // Configuration step state
  const [configName, setConfigName] = useState("");
  const [configDuration, setConfigDuration] = useState(30);
  const [configTimes, setConfigTimes] = useState<string[]>([]);
  const [configPrice, setConfigPrice] = useState(50);
  const [configSelectedDates, setConfigSelectedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [configSubStep, setConfigSubStep] = useState<
    "name" | "duration" | "price" | "dates" | "times"
  >("name");
  const [dateSelectionPattern, setDateSelectionPattern] =
    useState<DateSelectionPattern>("custom");
  const [selectedDayPatterns, setSelectedDayPatterns] = useState<
    DateSelectionPattern[]
  >([]);

  const activeSlot = useMemo(() => {
    return slots.find((s) => s.id === activeSlotId) || null;
  }, [slots, activeSlotId]);

  const selectedTimezone = useMemo(() => {
    return TIMEZONES.find((tz) => tz.value === timezone) || TIMEZONES[0];
  }, [timezone]);

  const availableTimeSlots = useMemo(() => {
    return generateTimeSlots(configDuration);
  }, [configDuration]);

  const handleSlotClick = (slotId: number) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot) {
      setActiveSlotId(slotId);
      setConfigName(slot.name);
      setConfigDuration(slot.duration);
      setConfigTimes(slot.times);
      setConfigPrice(slot.price || 50);
      setConfigSelectedDates(slot.selectedDates || []);
      setDateSelectionPattern("custom");
      setSelectedDayPatterns([]);
      setConfigSubStep("name");
      setStep("configure");
    }
  };

  const handlePatternSelect = (pattern: DateSelectionPattern) => {
    const dayPatterns: DateSelectionPattern[] = [
      "every_monday",
      "every_tuesday",
      "every_wednesday",
      "every_thursday",
      "every_friday",
    ];

    if (dayPatterns.includes(pattern)) {
      // Toggle day in multi-select array
      const isSelected = selectedDayPatterns.includes(pattern);
      const newDays = isSelected
        ? selectedDayPatterns.filter((d) => d !== pattern)
        : [...selectedDayPatterns, pattern];
      setSelectedDayPatterns(newDays);
      setDateSelectionPattern(newDays.length > 0 ? newDays[0] : "custom");

      // Merge dates from all selected days
      if (newDays.length === 0) {
        setConfigSelectedDates([]);
      } else {
        const allDates = new Set<string>();
        for (const day of newDays) {
          const dates = generateDatesFromPattern(day);
          dates.forEach((d) => allDates.add(d));
        }
        setConfigSelectedDates(Array.from(allDates).sort());
      }
      return;
    }

    // Non-day patterns: single select, clear day selection
    setSelectedDayPatterns([]);
    setDateSelectionPattern(pattern);
    if (pattern === "custom") {
      return;
    }
    const generatedDates = generateDatesFromPattern(pattern);
    setConfigSelectedDates(generatedDates);
  };

  const handleBackToSlots = () => {
    setStep("slots");
    setActiveSlotId(null);
    setConfigSubStep("name");
  };

  const handleNameNext = () => {
    if (configName.trim()) {
      setConfigSubStep("duration");
    }
  };

  const handleDurationNext = () => {
    setConfigSubStep("price");
  };

  const handlePriceNext = () => {
    setConfigSubStep("dates");
  };

  const handleDatesNext = () => {
    setConfigTimes([]); // Reset times when moving to times step
    setConfigSubStep("times");
  };

  const handleTimeToggle = (time: string) => {
    setConfigTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      }
      return [...prev, time];
    });
  };

  const handleSaveSlot = () => {
    if (activeSlotId !== null) {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === activeSlotId
            ? {
                ...slot,
                name: configName,
                duration: configDuration,
                times: configTimes,
                price: configPrice,
                selectedDates: configSelectedDates,
              }
            : slot,
        ),
      );
      handleBackToSlots();
    }
  };

  const handleSaveAll = () => {
    const data: AvailabilityData = { timezone, slots };
    onSave?.(data);
    toast.success("Availability saved!");
    onOpenChange(false);
  };

  const resetModal = () => {
    setStep("slots");
    setActiveSlotId(null);
    setConfigSubStep("name");
    setConfigName("");
    setConfigDuration(30);
    setConfigTimes([]);
    setConfigPrice(50);
    setConfigSelectedDates([]);
    setDateSelectionPattern("custom");
  };

  // Reset when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

  // Sync with initial data when modal opens
  useEffect(() => {
    if (open && initialData) {
      setTimezone(initialData.timezone);
      setSlots(initialData.slots);
    }
  }, [open, initialData]);

  const filledSlotsCount = slots.filter(
    (s) => s.name && s.times.length > 0,
  ).length;

  const isDesktop = useMediaQuery("(min-width: 640px)");

  const modalBody = (
    <AnimatePresence mode="wait" initial={false}>
      {step === "slots" && (
        <motion.div
          key="slots"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-2"
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Set Your Availability
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Configure up to 3 time slots
            </p>
          </div>

          {/* Timezone Selector */}
          <div className="mb-6">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
              Timezone
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-koru-purple/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GlobeIcon className="w-4 h-4 text-koru-purple" />
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {selectedTimezone.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {selectedTimezone.offset}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      "w-4 h-4 text-neutral-400 transition-transform",
                      showTimezoneDropdown && "rotate-180",
                    )}
                  />
                </div>
              </button>

              <AnimatePresence>
                {showTimezoneDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 top-full left-0 right-0 mt-2 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl max-h-48 overflow-y-auto"
                  >
                    {TIMEZONES.map((tz) => (
                      <button
                        key={tz.value}
                        onClick={() => {
                          setTimezone(tz.value);
                          setShowTimezoneDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors",
                          timezone === tz.value &&
                            "bg-koru-purple/5 dark:bg-koru-purple/10",
                        )}
                      >
                        <span className="text-sm text-neutral-900 dark:text-neutral-100">
                          {tz.label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {tz.offset}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Slots */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Time Slots
            </label>

            {slots.map((slot, index) => {
              const isConfigured = slot.name && slot.times.length > 0;

              return (
                <motion.button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 border-dashed transition-all text-left",
                    isConfigured
                      ? "border-koru-lime bg-koru-lime/5 dark:bg-koru-lime/10"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-koru-purple/50 bg-neutral-50/50 dark:bg-neutral-800/50",
                  )}
                >
                  {isConfigured ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-koru-lime/20 flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-koru-lime" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {slot.name}
                          </p>
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              slot.price === 0
                                ? "text-koru-lime"
                                : "text-koru-golden",
                            )}
                          >
                            {slot.price === 0 ? "Free" : `$${slot.price}`}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {
                            DURATION_OPTIONS.find(
                              (d) => d.value === slot.duration,
                            )?.label
                          }{" "}
                          · {slot.times?.length || 0} time
                          {(slot.times?.length || 0) !== 1 ? "s" : ""}{" "}
                          {(slot.selectedDates?.length || 0) > 0 && (
                            <>
                              · {slot.selectedDates?.length} day
                              {(slot.selectedDates?.length || 0) !== 1
                                ? "s"
                                : ""}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                        <PlusIcon className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Slot {index + 1}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          Click to configure
                        </p>
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              onClick={handleSaveAll}
              disabled={filledSlotsCount === 0}
              className="w-full bg-koru-purple hover:bg-koru-purple/90"
            >
              Save Availability
              {filledSlotsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {filledSlotsCount} slot{filledSlotsCount !== 1 ? "s" : ""}
                </span>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {step === "configure" && activeSlot && (
        <motion.div
          key="configure"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="p-3"
        >
          {/* Header with Back */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToSlots}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Configure Slot
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {configSubStep === "name" && "Step 1 of 5 · Name your slot"}
                {configSubStep === "duration" && "Step 2 of 5 · Set duration"}
                {configSubStep === "price" && "Step 3 of 5 · Set price"}
                {configSubStep === "dates" && "Step 4 of 5 · Pick dates"}
                {configSubStep === "times" && "Step 5 of 5 · Pick times"}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1.5 mb-6">
            {["name", "duration", "price", "dates", "times"].map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  (configSubStep === "name" && i === 0) ||
                    (configSubStep === "duration" && i <= 1) ||
                    (configSubStep === "price" && i <= 2) ||
                    (configSubStep === "dates" && i <= 3) ||
                    (configSubStep === "times" && i <= 4)
                    ? "bg-koru-purple"
                    : "bg-neutral-200 dark:bg-neutral-700",
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Name */}
            {configSubStep === "name" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                  Slot Name
                </label>
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="e.g., Morning Sessions, Evening Calls..."
                  className="mb-4"
                  autoFocus
                />
                <Button
                  onClick={handleNameNext}
                  disabled={!configName.trim()}
                  className="w-full bg-koru-purple hover:bg-koru-purple/90"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Duration */}
            {configSubStep === "duration" && (
              <motion.div
                key="duration"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 block">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setConfigDuration(opt.value)}
                      className={cn(
                        "px-3 py-3 rounded-xl text-sm font-medium transition-all",
                        configDuration === opt.value
                          ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfigSubStep("name")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleDurationNext}
                    className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Price */}
            {configSubStep === "price" && (
              <motion.div
                key="price"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                  Price (USD)
                </label>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={configPrice}
                    onChange={(e) =>
                      setConfigPrice(Number(e.target.value) || 0)
                    }
                    className="pl-8 text-lg font-semibold"
                    autoFocus
                  />
                </div>
                {configPrice === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-koru-lime/10 border border-koru-lime/30 mb-4">
                    <div className="w-6 h-6 rounded-full bg-koru-lime/20 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-koru-lime" />
                    </div>
                    <p className="text-sm text-koru-lime font-medium">
                      This slot will be free for users to book
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfigSubStep("duration")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePriceNext}
                    disabled={configPrice < 0}
                    className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Dates */}
            {configSubStep === "dates" && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Quick Selection Patterns */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePatternSelect("weekdays")}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                        dateSelectionPattern === "weekdays"
                          ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10",
                      )}
                    >
                      <span className="block">Weekdays</span>
                      <span className="text-xs opacity-70">Mon - Fri</span>
                    </button>
                    <button
                      onClick={() => handlePatternSelect("weekends")}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                        dateSelectionPattern === "weekends"
                          ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10",
                      )}
                    >
                      <span className="block">Weekends</span>
                      <span className="text-xs opacity-70">Sat & Sun</span>
                    </button>
                    <button
                      onClick={() => handlePatternSelect("next_1_month")}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                        dateSelectionPattern === "next_1_month"
                          ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10",
                      )}
                    >
                      <span className="block">Next Month</span>
                      <span className="text-xs opacity-70">Weekdays only</span>
                    </button>
                    <button
                      onClick={() => handlePatternSelect("next_3_months")}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                        dateSelectionPattern === "next_3_months"
                          ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10",
                      )}
                    >
                      <span className="block">Next 3 Months</span>
                      <span className="text-xs opacity-70">Weekdays only</span>
                    </button>
                  </div>
                </div>

                {/* Day of Week Selection */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                    Or select by day
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { pattern: "every_monday" as const, label: "Mon" },
                      { pattern: "every_tuesday" as const, label: "Tue" },
                      { pattern: "every_wednesday" as const, label: "Wed" },
                      { pattern: "every_thursday" as const, label: "Thu" },
                      { pattern: "every_friday" as const, label: "Fri" },
                    ].map(({ pattern, label }) => (
                      <button
                        key={pattern}
                        onClick={() => handlePatternSelect(pattern)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          selectedDayPatterns.includes(pattern)
                            ? "bg-koru-golden text-neutral-900 shadow-lg shadow-koru-golden/30"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-golden/10",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                  <span className="text-xs text-neutral-400">
                    or pick custom dates
                  </span>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                </div>

                {/* Calendar */}
                <div className="mb-3">
                  <CalendarPicker
                    selectedDates={configSelectedDates}
                    onDateToggle={(date) => {
                      setDateSelectionPattern("custom");
                      setConfigSelectedDates((prev) =>
                        prev.includes(date)
                          ? prev.filter((d) => d !== date)
                          : [...prev, date].sort(),
                      );
                    }}
                    currentMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    maxWeeks={52}
                  />
                </div>

                {/* Selection Summary */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-koru-purple" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {configSelectedDates.length} day
                      {configSelectedDates.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                  {configSelectedDates.length > 0 && (
                    <button
                      onClick={() => {
                        setConfigSelectedDates([]);
                        setDateSelectionPattern("custom");
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfigSubStep("price")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleDatesNext}
                    disabled={configSelectedDates.length === 0}
                    className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Times */}
            {configSubStep === "times" && (
              <motion.div
                key="times"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Available Times
                  </label>
                  <span className="text-xs text-koru-purple font-medium">
                    {configTimes.length} selected
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto pr-1 -mr-1 mb-4 space-y-1.5">
                  {availableTimeSlots.map((time) => {
                    const isSelected = configTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeToggle(time)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-mono transition-all",
                          isSelected
                            ? "bg-koru-golden/20 text-koru-golden border-2 border-koru-golden"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-transparent hover:border-koru-golden/30",
                        )}
                      >
                        <span>{time}</span>
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-koru-golden" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfigSubStep("dates")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveSlot}
                    disabled={configTimes.length === 0}
                    className="flex-1 bg-koru-lime hover:bg-koru-lime/90 text-neutral-900"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Slot
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "p-0 gap-0 overflow-hidden transition-all duration-300",
            step === "slots" ? "max-w-sm" : "max-w-md",
          )}
        >
          <DialogTitle className="sr-only">Set Your Availability</DialogTitle>
          <div className="overflow-y-auto max-h-[85vh]">{modalBody}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} modal={false}>
      <DrawerContent className="overflow-hidden">
        <DrawerTitle className="sr-only">Set Your Availability</DrawerTitle>
        <div className="overflow-y-auto max-h-[85vh]" data-vaul-no-drag>
          {modalBody}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
