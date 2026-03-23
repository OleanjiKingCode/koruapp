"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "@/lib/toast";
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

// ─── Spinner Digit Component (alarm-style up/down) ───────────────────────────

function SpinnerDigit({
  value,
  min,
  max,
  onChange,
  label,
  padWidth = 2,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  padWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = () => {
    onChange(value >= max ? min : value + 1);
  };

  const decrement = () => {
    onChange(value <= min ? max : value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      onChange(min);
      return;
    }
    let num = parseInt(raw, 10);
    if (num > max) num = max;
    if (num < min) num = min;
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
        {label}
      </span>
      <button
        onClick={increment}
        className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
        type="button"
      >
        <svg
          className="w-5 h-5 text-neutral-400 group-hover:text-koru-purple transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={String(value).padStart(padWidth, "0")}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-20 h-16 text-center text-3xl font-bold bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl focus:border-koru-purple focus:outline-none transition-colors text-neutral-900 dark:text-neutral-100 tabular-nums"
      />
      <button
        onClick={decrement}
        className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
        type="button"
      >
        <svg
          className="w-5 h-5 text-neutral-400 group-hover:text-koru-purple transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Calendar Picker Component ───────────────────────────────────────────────

function CalendarPicker({
  selectedDates,
  onDateToggle,
  currentMonth,
  onMonthChange,
  maxWeeks = 52,
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
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
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

// ─── Constants ───────────────────────────────────────────────────────────────

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
  price: number;
  selectedDates: string[];
}

export function getCalendarBounds(weeks: number = 8): {
  minDate: Date;
  maxDate: Date;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + weeks * 7);
  return { minDate, maxDate };
}

export type DateSelectionPattern =
  | "custom"
  | "weekdays"
  | "weekends"
  | "every_monday"
  | "every_tuesday"
  | "every_wednesday"
  | "every_thursday"
  | "every_friday"
  | "every_saturday"
  | "every_sunday"
  | "next_1_month"
  | "next_3_months"
  | "all_available";

export function generateDatesFromPattern(
  pattern: DateSelectionPattern,
  weeksAhead: number = 8,
): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 1);

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
    const dayOfWeek = current.getDay();
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
      case "every_saturday":
        shouldInclude = dayOfWeek === 6;
        break;
      case "every_sunday":
        shouldInclude = dayOfWeek === 0;
        break;
      case "next_1_month":
      case "next_3_months":
      case "all_available":
        shouldInclude = dayOfWeek >= 1 && dayOfWeek <= 5;
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

// Generate dates from flexible selection (days of week + duration + unit + start date)
function generateFlexibleDates(
  selectedDays: number[], // 0=Sun, 1=Mon, ... 6=Sat
  amount: number,
  unit: "days" | "weeks" | "months" | "times",
  startFrom?: string, // ISO date string, defaults to tomorrow
): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let startDate: Date;
  if (startFrom) {
    const parsed = new Date(startFrom + "T00:00:00");
    startDate = parsed >= tomorrow ? parsed : tomorrow;
  } else {
    startDate = tomorrow;
  }

  if (unit === "times") {
    // "times" means repeat until we collect `amount` matching days
    let collected = 0;
    const current = new Date(startDate);
    const safetyLimit = 365 * 5; // prevent infinite loop
    let iterations = 0;
    while (collected < amount && iterations < safetyLimit) {
      if (selectedDays.includes(current.getDay())) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
        collected++;
      }
      current.setDate(current.getDate() + 1);
      iterations++;
    }
  } else {
    const endDate = new Date(startDate);
    if (unit === "days") {
      endDate.setDate(endDate.getDate() + amount);
    } else if (unit === "weeks") {
      endDate.setDate(endDate.getDate() + amount * 7);
    } else {
      endDate.setMonth(endDate.getMonth() + amount);
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      if (selectedDays.includes(current.getDay())) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return dates;
}

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
type ConfigSubStep =
  | "name"
  | "duration"
  | "price"
  | "dates"
  | "times"
  | "summary";

const SUB_STEPS: ConfigSubStep[] = [
  "name",
  "duration",
  "price",
  "dates",
  "times",
  "summary",
];

function generateTimeSlots(duration: number): string[] {
  const slots: string[] = [];
  const startHour = 0;
  const endHour = 24;

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

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${h} hr${h > 1 ? "s" : ""} ${m} min`;
}

function createDefaultSlots(): AvailabilitySlot[] {
  return [
    { id: 1, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
    { id: 2, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
    { id: 3, name: "", duration: 30, times: [], price: 50, selectedDates: [] },
  ];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [configDurationHours, setConfigDurationHours] = useState(0);
  const [configDurationMinutes, setConfigDurationMinutes] = useState(30);
  const [configTimes, setConfigTimes] = useState<string[]>([]);
  const [configPrice, setConfigPrice] = useState(50);
  const [configSelectedDates, setConfigSelectedDates] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [configSubStep, setConfigSubStep] = useState<ConfigSubStep>("name");

  // Date selection mode
  const [dateMode, setDateMode] = useState<"calendar" | "flexible">("calendar");
  const [flexibleDays, setFlexibleDays] = useState<number[]>([]); // 0-6
  const [flexibleAmount, setFlexibleAmount] = useState(30);
  const [flexibleUnit, setFlexibleUnit] = useState<
    "days" | "weeks" | "months" | "times"
  >("days");
  const [flexibleStartDate, setFlexibleStartDate] = useState<string>("");

  const configDuration = configDurationHours * 60 + configDurationMinutes;

  const activeSlot = useMemo(() => {
    return slots.find((s) => s.id === activeSlotId) || null;
  }, [slots, activeSlotId]);

  const selectedTimezone = useMemo(() => {
    return TIMEZONES.find((tz) => tz.value === timezone) || TIMEZONES[0];
  }, [timezone]);

  const availableTimeSlots = useMemo(() => {
    if (configDuration < 5) return [];
    return generateTimeSlots(configDuration);
  }, [configDuration]);

  // Navigate between sub-steps
  const goToPrevSubStep = useCallback(() => {
    const idx = SUB_STEPS.indexOf(configSubStep);
    if (idx <= 0) {
      // Go back to slots overview
      setStep("slots");
      setActiveSlotId(null);
      setConfigSubStep("name");
    } else {
      setConfigSubStep(SUB_STEPS[idx - 1]);
    }
  }, [configSubStep]);

  const goToNextSubStep = useCallback(() => {
    const idx = SUB_STEPS.indexOf(configSubStep);
    if (idx < SUB_STEPS.length - 1) {
      if (configSubStep === "dates") {
        setConfigTimes([]); // Reset times when moving to times step
      }
      setConfigSubStep(SUB_STEPS[idx + 1]);
    }
  }, [configSubStep]);

  const handleSlotClick = (slotId: number) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot) {
      setActiveSlotId(slotId);
      setConfigName(slot.name);
      const h = Math.floor(slot.duration / 60);
      const m = slot.duration % 60;
      setConfigDurationHours(h);
      setConfigDurationMinutes(m);
      setConfigTimes(slot.times);
      setConfigPrice(slot.price || 50);
      setConfigSelectedDates(slot.selectedDates || []);
      setDateMode("calendar");
      setFlexibleDays([]);
      setFlexibleAmount(30);
      setFlexibleUnit("days");
      setFlexibleStartDate("");
      setConfigSubStep("name");
      setStep("configure");
    }
  };

  // Flexible date generation
  const handleFlexibleUpdate = useCallback(
    (
      days: number[],
      amount: number,
      unit: "days" | "weeks" | "months" | "times",
      startFrom?: string,
    ) => {
      if (days.length > 0 && amount > 0) {
        const dates = generateFlexibleDates(days, amount, unit, startFrom);
        setConfigSelectedDates(dates);
      } else {
        setConfigSelectedDates([]);
      }
    },
    [],
  );

  const toggleFlexibleDay = (day: number) => {
    const newDays = flexibleDays.includes(day)
      ? flexibleDays.filter((d) => d !== day)
      : [...flexibleDays, day];
    setFlexibleDays(newDays);
    handleFlexibleUpdate(
      newDays,
      flexibleAmount,
      flexibleUnit,
      flexibleStartDate,
    );
  };

  const handleFlexibleAmountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(365, val));
    setFlexibleAmount(clamped);
    handleFlexibleUpdate(
      flexibleDays,
      clamped,
      flexibleUnit,
      flexibleStartDate,
    );
  };

  const handleFlexibleUnitChange = (
    unit: "days" | "weeks" | "months" | "times",
  ) => {
    setFlexibleUnit(unit);
    handleFlexibleUpdate(flexibleDays, flexibleAmount, unit, flexibleStartDate);
  };

  const handleFlexibleStartDateChange = (date: string) => {
    setFlexibleStartDate(date);
    handleFlexibleUpdate(flexibleDays, flexibleAmount, flexibleUnit, date);
  };

  const handleBackToSlots = () => {
    setStep("slots");
    setActiveSlotId(null);
    setConfigSubStep("name");
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
    setConfigDurationHours(0);
    setConfigDurationMinutes(30);
    setConfigTimes([]);
    setConfigPrice(50);
    setConfigSelectedDates([]);
    setDateMode("calendar");
    setFlexibleDays([]);
    setFlexibleAmount(30);
    setFlexibleUnit("days");
    setFlexibleStartDate("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

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

  // Validation for each step
  const canProceed = useMemo(() => {
    switch (configSubStep) {
      case "name":
        return configName.trim().length > 0;
      case "duration":
        return configDuration >= 5 && configDuration <= 1439;
      case "price":
        return configPrice >= 0;
      case "dates":
        return configSelectedDates.length > 0;
      case "times":
        return configTimes.length > 0;
      case "summary":
        return true;
      default:
        return false;
    }
  }, [
    configSubStep,
    configName,
    configDuration,
    configPrice,
    configSelectedDates,
    configTimes,
  ]);

  const currentStepIndex = SUB_STEPS.indexOf(configSubStep);

  // Build flexible schedule description with smart labels
  const flexibleDescription = useMemo(() => {
    if (flexibleDays.length === 0) return "";
    const sorted = [...flexibleDays].sort((a, b) => a - b);

    // Detect common patterns
    const isWeekends =
      sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6;
    const isWeekdays =
      sorted.length === 5 && sorted.every((d, i) => d === i + 1); // [1,2,3,4,5]
    const isEveryday = sorted.length === 7;

    let dayStr: string;
    if (isEveryday) {
      dayStr = "Everyday";
    } else if (isWeekends) {
      dayStr = "Weekends";
    } else if (isWeekdays) {
      dayStr = "Weekdays";
    } else {
      const dayNames = sorted.map((d) => DAY_LABELS[d]);
      const lastDay = dayNames.pop();
      dayStr =
        dayNames.length > 0
          ? `Every ${dayNames.join(", ")} & ${lastDay}`
          : `Every ${lastDay}`;
    }

    const unitLabel =
      flexibleUnit === "times"
        ? `${flexibleAmount} time${flexibleAmount !== 1 ? "s" : ""}`
        : `the next ${flexibleAmount} ${flexibleUnit}`;

    const startLabel = flexibleStartDate
      ? `, starting ${formatDateShort(flexibleStartDate)}`
      : "";

    return `${dayStr} for ${unitLabel}${startLabel}`;
  }, [flexibleDays, flexibleAmount, flexibleUnit, flexibleStartDate]);

  const modalBody = (
    <AnimatePresence mode="wait" initial={false}>
      {step === "slots" && (
        <motion.div
          key="slots"
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-4"
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
                          {formatDuration(slot.duration)} ·{" "}
                          {slot.times?.length || 0} time
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
          className="p-4"
        >
          {/* Header with Back — goes to previous sub-step */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={goToPrevSubStep}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Configure Slot
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {configSubStep === "name" && "Step 1 of 6 · Name your slot"}
                {configSubStep === "duration" && "Step 2 of 6 · Set duration"}
                {configSubStep === "price" && "Step 3 of 6 · Set price"}
                {configSubStep === "dates" && "Step 4 of 6 · Pick dates"}
                {configSubStep === "times" && "Step 5 of 6 · Pick times"}
                {configSubStep === "summary" && "Step 6 of 6 · Review & save"}
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1.5 mb-6">
            {SUB_STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= currentStepIndex
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfigName(e.target.value)
                  }
                  placeholder="e.g., Morning Sessions, Evening Calls..."
                  className="mb-4"
                  autoFocus
                />
                <Button
                  onClick={goToNextSubStep}
                  disabled={!canProceed}
                  className="w-full bg-koru-purple hover:bg-koru-purple/90"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Duration — Dial-style picker */}
            {configSubStep === "duration" && (
              <motion.div
                key="duration"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4 block">
                  Session Duration
                </label>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <SpinnerDigit
                    value={configDurationHours}
                    min={0}
                    max={23}
                    onChange={setConfigDurationHours}
                    label="Hours"
                  />

                  <div className="flex flex-col items-center justify-center pt-5">
                    <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-600">
                      :
                    </span>
                  </div>

                  <SpinnerDigit
                    value={configDurationMinutes}
                    min={0}
                    max={59}
                    onChange={setConfigDurationMinutes}
                    label="Minutes"
                  />
                </div>

                {/* Duration display */}
                <div className="text-center mb-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Total:{" "}
                    <span className="font-semibold text-koru-purple">
                      {formatDuration(configDuration)}
                    </span>
                  </p>
                  {configDuration < 5 && (
                    <p className="text-xs text-red-500 mt-1">
                      Minimum duration is 5 minutes
                    </p>
                  )}
                  {configDuration > 1439 && (
                    <p className="text-xs text-red-500 mt-1">
                      Maximum duration is 23 hours 59 minutes
                    </p>
                  )}
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setConfigDurationHours(Math.floor(opt.value / 60));
                        setConfigDurationMinutes(opt.value % 60);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        configDuration === opt.value
                          ? "bg-koru-purple/10 border-koru-purple text-koru-purple"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-koru-purple/50",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevSubStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={goToNextSubStep}
                    disabled={!canProceed}
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
                  {configPrice > 0 && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">
                      $
                    </span>
                  )}
                  <Input
                    type={configPrice === 0 ? "text" : "number"}
                    min={0}
                    value={configPrice === 0 ? "Free" : configPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (val === "" || val === "Free") {
                        setConfigPrice(0);
                      } else {
                        setConfigPrice(Number(val) || 0);
                      }
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      if (configPrice === 0) {
                        setConfigPrice(0);
                        // Switch to number input on next render
                        setTimeout(() => e.target.select(), 0);
                      }
                    }}
                    className={cn(
                      "text-lg font-semibold",
                      configPrice > 0 ? "pl-8" : "pl-4",
                    )}
                    autoFocus
                  />
                </div>
                {configPrice === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      This slot will be free for users to book
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevSubStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={goToNextSubStep}
                    disabled={!canProceed}
                    className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Dates — Two modes */}
            {configSubStep === "dates" && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Mode Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-4">
                  <button
                    onClick={() => {
                      setDateMode("calendar");
                      setConfigSelectedDates([]);
                      setFlexibleDays([]);
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                      dateMode === "calendar"
                        ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                    )}
                  >
                    Pick Dates
                  </button>
                  <button
                    onClick={() => {
                      setDateMode("flexible");
                      setConfigSelectedDates([]);
                    }}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                      dateMode === "flexible"
                        ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                    )}
                  >
                    Flexible
                  </button>
                </div>

                {dateMode === "calendar" && (
                  <div>
                    <div className="mb-3">
                      <CalendarPicker
                        selectedDates={configSelectedDates}
                        onDateToggle={(date) => {
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
                          onClick={() => setConfigSelectedDates([])}
                          className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {dateMode === "flexible" && (
                  <div>
                    {/* Day of week toggles */}
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                      Select Days
                    </label>
                    <div className="grid grid-cols-7 gap-1.5 mb-5">
                      {DAY_LABELS.map((label, idx) => (
                        <button
                          key={label}
                          onClick={() => toggleFlexibleDay(idx)}
                          className={cn(
                            "py-2.5 rounded-xl text-xs font-semibold transition-all",
                            flexibleDays.includes(idx)
                              ? "bg-koru-golden text-neutral-900 shadow-lg shadow-koru-golden/30"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-koru-golden/10",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Starting Date */}
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                      Starting From
                    </label>
                    <div className="mb-4">
                      <Input
                        type="date"
                        value={flexibleStartDate}
                        min={(() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d.toISOString().split("T")[0];
                        })()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFlexibleStartDateChange(e.target.value)
                        }
                        className="text-sm"
                        placeholder="Tomorrow (default)"
                      />
                      {!flexibleStartDate && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Defaults to tomorrow if not set
                        </p>
                      )}
                    </div>

                    {/* Repeat: number + unit */}
                    <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                      Repeat For
                    </label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={flexibleAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFlexibleAmountChange(
                            Number(e.target.value) || 1,
                          )
                        }
                        className="w-20 text-center text-lg font-semibold"
                      />
                      <div className="flex gap-1 flex-1">
                        {(
                          [
                            {
                              value: "days" as const,
                              tooltip:
                                "Selected days within this many calendar days",
                            },
                            {
                              value: "weeks" as const,
                              tooltip: "Selected days within this many weeks",
                            },
                            {
                              value: "months" as const,
                              tooltip: "Selected days within this many months",
                            },
                            {
                              value: "times" as const,
                              tooltip:
                                "Repeat exactly this many occurrences of the selected days",
                            },
                          ] as const
                        ).map(({ value, tooltip }) => (
                          <button
                            key={value}
                            onClick={() => handleFlexibleUnitChange(value)}
                            title={tooltip}
                            className={cn(
                              "relative flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize group",
                              flexibleUnit === value
                                ? "bg-koru-purple text-white shadow-lg shadow-koru-purple/30"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-koru-purple/10",
                            )}
                          >
                            {value}
                            {/* Tooltip */}
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] leading-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20">
                              {tooltip}
                              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flexible description */}
                    {flexibleDays.length > 0 && (
                      <div className="p-3 rounded-xl bg-koru-purple/5 dark:bg-koru-purple/10 border border-koru-purple/20 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon className="w-4 h-4 text-koru-purple" />
                          <span className="text-sm font-medium text-koru-purple">
                            {flexibleDescription}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-6">
                          {configSelectedDates.length} day
                          {configSelectedDates.length !== 1 ? "s" : ""} total
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevSubStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={goToNextSubStep}
                    disabled={!canProceed}
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

                <div className="mb-4 grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto scrollbar-none">
                  {availableTimeSlots.map((time) => {
                    const isSelected = configTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeToggle(time)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all",
                          isSelected
                            ? "bg-koru-golden/20 text-koru-golden border-2 border-koru-golden"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-transparent hover:border-koru-golden/30",
                        )}
                      >
                        <span>{time}</span>
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 text-koru-golden flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevSubStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={goToNextSubStep}
                    disabled={!canProceed}
                    className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Summary */}
            {configSubStep === "summary" && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4 block">
                  Review Your Slot
                </label>

                <div className="space-y-3 mb-6">
                  {/* Name */}
                  <SummaryRow
                    label="Name"
                    value={configName}
                    onEdit={() => setConfigSubStep("name")}
                  />

                  {/* Duration */}
                  <SummaryRow
                    label="Duration"
                    value={formatDuration(configDuration)}
                    onEdit={() => setConfigSubStep("duration")}
                  />

                  {/* Price */}
                  <SummaryRow
                    label="Price"
                    value={configPrice === 0 ? "Free" : `$${configPrice}`}
                    onEdit={() => setConfigSubStep("price")}
                  />

                  {/* Dates */}
                  <SummaryRow
                    label="Dates"
                    value={
                      dateMode === "flexible" && flexibleDescription
                        ? flexibleDescription
                        : `${configSelectedDates.length} day${configSelectedDates.length !== 1 ? "s" : ""} selected`
                    }
                    onEdit={() => setConfigSubStep("dates")}
                  />

                  {/* Times */}
                  <SummaryRow
                    label="Time Slots"
                    value={`${configTimes.length} time${configTimes.length !== 1 ? "s" : ""}`}
                    detail={
                      configTimes.slice(0, 4).join(", ") +
                      (configTimes.length > 4
                        ? ` +${configTimes.length - 4} more`
                        : "")
                    }
                    onEdit={() => setConfigSubStep("times")}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToPrevSubStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSaveSlot}
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
            step === "slots" ? "max-w-lg" : "max-w-xl",
          )}
        >
          <DialogTitle className="sr-only">Set Your Availability</DialogTitle>
          <div className="overflow-y-auto scrollbar-none max-h-[85dvh] overscroll-contain">
            {modalBody}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="overflow-hidden">
        <DrawerTitle className="sr-only">Set Your Availability</DrawerTitle>
        <div
          className="overflow-y-auto scrollbar-none max-h-[85dvh] overscroll-contain px-2 pb-4"
          data-vaul-no-drag
        >
          {modalBody}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Summary Row Component ───────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  detail,
  onEdit,
}: {
  label: string;
  value: string;
  detail?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {value}
        </p>
        {detail && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            {detail}
          </p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="ml-3 px-2.5 py-1 rounded-lg text-xs font-medium text-koru-purple hover:bg-koru-purple/10 transition-colors flex-shrink-0"
      >
        Edit
      </button>
    </div>
  );
}
