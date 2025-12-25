"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

// Icons
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Common timezones
const TIMEZONES = [
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
const DURATION_OPTIONS = [
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 40, label: "40 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

interface Slot {
  id: number;
  name: string;
  duration: number; // in minutes
  times: string[]; // Selected time slots like "08:00-08:20"
}

interface UserOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onProceed: (selectedDate: string, selectedTime: string) => void;
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

export function UserOverviewModal({
  open,
  onOpenChange,
  profile,
}: UserOverviewModalProps) {
  const [step, setStep] = useState<Step>("slots");
  const [timezone, setTimezone] = useState(TIMEZONES[0].value);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, name: "", duration: 30, times: [] },
    { id: 2, name: "", duration: 30, times: [] },
    { id: 3, name: "", duration: 30, times: [] },
  ]);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  // Configuration step state
  const [configName, setConfigName] = useState("");
  const [configDuration, setConfigDuration] = useState(30);
  const [configTimes, setConfigTimes] = useState<string[]>([]);
  const [configSubStep, setConfigSubStep] = useState<
    "name" | "duration" | "times"
  >("name");

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
      setConfigSubStep("name");
      setStep("configure");
    }
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
    setConfigTimes([]); // Reset times when duration changes
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
              }
            : slot
        )
      );
      handleBackToSlots();
    }
  };

  const handleSaveAll = () => {
    // Save all slots and close modal
    console.log("Saving slots:", { timezone, slots });
    onOpenChange(false);
  };

  const resetModal = () => {
    setStep("slots");
    setActiveSlotId(null);
    setConfigSubStep("name");
    setConfigName("");
    setConfigDuration(30);
    setConfigTimes([]);
  };

  // Reset when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

  const filledSlotsCount = slots.filter(
    (s) => s.name && s.times.length > 0
  ).length;

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden transition-all duration-300",
          step === "slots" ? "max-w-sm" : "max-w-md"
        )}
      >
        <DialogTitle className="sr-only">Send a Request</DialogTitle>
        <AnimatePresence mode="wait">
          {step === "slots" && (
            <motion.div
              key="slots"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
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
                    onClick={() =>
                      setShowTimezoneDropdown(!showTimezoneDropdown)
                    }
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
                          showTimezoneDropdown && "rotate-180"
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
                                "bg-koru-purple/5 dark:bg-koru-purple/10"
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
                          : "border-neutral-200 dark:border-neutral-700 hover:border-koru-purple/50 bg-neutral-50/50 dark:bg-neutral-800/50"
                      )}
                    >
                      {isConfigured ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-koru-lime/20 flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-koru-lime" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                              {slot.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {
                                DURATION_OPTIONS.find(
                                  (d) => d.value === slot.duration
                                )?.label
                              }{" "}
                              · {slot.times.length} time
                              {slot.times.length !== 1 ? "s" : ""}
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
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
                    {configSubStep === "name" && "Step 1 of 3 · Name your slot"}
                    {configSubStep === "duration" &&
                      "Step 2 of 3 · Set duration"}
                    {configSubStep === "times" && "Step 3 of 3 · Pick times"}
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex gap-1.5 mb-6">
                {["name", "duration", "times"].map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      (configSubStep === "name" && i === 0) ||
                        (configSubStep === "duration" && i <= 1) ||
                        (configSubStep === "times" && i <= 2)
                        ? "bg-koru-purple"
                        : "bg-neutral-200 dark:bg-neutral-700"
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
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-koru-purple/10"
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

                {/* Step 3: Times */}
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
                                : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-transparent hover:border-koru-golden/30"
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
                        onClick={() => setConfigSubStep("duration")}
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
      </DialogContent>
    </Dialog>
  );
}
