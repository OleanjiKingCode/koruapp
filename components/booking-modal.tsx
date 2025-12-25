"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AvailabilitySlot, AvailabilityData } from "@/components/availability-modal";
import { DURATION_OPTIONS, formatDateShort } from "@/components/availability-modal";

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

function CalendarIcon({ className }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
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

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  personId: string;
  availability: AvailabilityData;
  onBook: (slot: AvailabilitySlot, date: Date, timeSlot: string, receipt: Receipt) => void;
}

export interface Receipt {
  id: string;
  personName: string;
  personId: string;
  slotName: string;
  price: number;
  date: string;
  time: string;
  createdAt: string;
  expiresAt: string;
}

type Step = "slots" | "date" | "time" | "confirm" | "paying" | "receipt";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function BookingModal({
  open,
  onOpenChange,
  personName,
  personId,
  availability,
  onBook,
}: BookingModalProps) {
  const [step, setStep] = useState<Step>("slots");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1);
  });

  const timezone = availability.timezone || "UTC";
  
  // Get configured slots only
  const configuredSlots = useMemo(() => {
    return availability.slots.filter(s => s.name && s.times.length > 0);
  }, [availability.slots]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  // Check if a day is available (in the selected slot's selected dates)
  const isDayAvailable = (date: Date) => {
    if (!selectedSlot || !selectedSlot.selectedDates) return false;
    
    const dateStr = date.toISOString().split("T")[0];
    return selectedSlot.selectedDates.includes(dateStr);
  };

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep("date");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handlePay = async () => {
    if (selectedSlot && selectedDate && selectedTime) {
      setStep("paying");
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate receipt
      const now = new Date();
      const newReceipt: Receipt = {
        id: `RCP-${Date.now().toString(36).toUpperCase()}`,
        personName,
        personId,
        slotName: selectedSlot.name,
        price: selectedSlot.price,
        date: formatDate(selectedDate),
        time: selectedTime,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
      
      setReceipt(newReceipt);
      setStep("receipt");
      
      // Store booking info in localStorage for the chat page
      localStorage.setItem(`koru-booking-${personId}`, JSON.stringify({
        slotName: selectedSlot.name,
        price: selectedSlot.price,
        date: formatDate(selectedDate),
        time: selectedTime,
        createdAt: now.toISOString(),
        receiptId: newReceipt.id,
      }));
    }
  };

  const handleContinueToChat = () => {
    if (selectedSlot && selectedDate && selectedTime && receipt) {
      onBook(selectedSlot, selectedDate, selectedTime, receipt);
      resetModal();
    }
  };

  const resetModal = () => {
    setStep("slots");
    setSelectedSlot(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setReceipt(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCurrentMonth(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Get date count text for a slot
  const getSlotDateInfo = (slot: AvailabilitySlot) => {
    const count = slot.selectedDates?.length || 0;
    return `${count} day${count !== 1 ? "s" : ""} available`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden transition-all duration-300",
          step === "slots" ? "max-w-sm" : step === "confirm" ? "max-w-sm" : "max-w-md"
        )}
      >
        <DialogTitle className="sr-only">Book a Session</DialogTitle>
        <AnimatePresence mode="wait" initial={false}>
          {/* Step 1: Select Slot */}
          {step === "slots" && (
            <motion.div
              key="slots"
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Talk to {personName}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Choose a session type
                </p>
              </div>

              {/* Timezone */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <GlobeIcon className="w-4 h-4 text-koru-purple" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {timezone}
                </span>
              </div>

              {/* Available Slots */}
              <div className="space-y-3">
                {configuredSlots.length > 0 ? (
                  configuredSlots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-koru-purple/50 bg-white dark:bg-neutral-800/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {slot.name}
                        </h3>
                        <span className={cn(
                          "text-lg font-bold",
                          slot.price === 0 ? "text-koru-lime" : "text-koru-golden"
                        )}>
                          {slot.price === 0 ? "Free" : `$${slot.price}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>
                            {DURATION_OPTIONS.find(d => d.value === slot.duration)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{getSlotDateInfo(slot)}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      No availability slots configured
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date */}
          {step === "date" && selectedSlot && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {/* Header with Back */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setStep("slots")}
                  className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Select Date
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedSlot.name} · ${selectedSlot.price}
                  </p>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-neutral-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isAvailable = isDayAvailable(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => isAvailable && handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={cn(
                          "aspect-square rounded-lg text-sm font-medium transition-all",
                          isAvailable
                            ? "hover:bg-koru-purple/10 hover:text-koru-purple cursor-pointer text-neutral-700 dark:text-neutral-300"
                            : "text-neutral-300 dark:text-neutral-600 cursor-not-allowed",
                          isToday && "ring-2 ring-koru-golden ring-offset-2 dark:ring-offset-neutral-900"
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-koru-purple/20 border border-koru-purple" />
                  <span>Available</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Time */}
          {step === "time" && selectedSlot && selectedDate && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {/* Header with Back */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep("date")}
                  className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Select Time
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedSlot.times.length > 0 ? (
                  selectedSlot.times.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                        "hover:bg-koru-purple/10 hover:text-koru-purple border-2 border-transparent hover:border-koru-purple/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-mono">{time}</span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      No available times for this slot
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && selectedSlot && selectedDate && selectedTime && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {/* Header with Back */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep("time")}
                  className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Confirm Booking
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Review your request
                  </p>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-koru-purple/5 border border-koru-purple/20">
                  <div className="w-10 h-10 rounded-full bg-koru-purple/10 flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-koru-purple" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Session
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {selectedSlot.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-koru-golden/5 border border-koru-golden/20">
                  <div className="w-10 h-10 rounded-full bg-koru-golden/10 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-koru-golden" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Date & Time
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatDate(selectedDate)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      {selectedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-koru-lime/5 border border-koru-lime/20">
                  <div className="w-10 h-10 rounded-full bg-koru-lime/10 flex items-center justify-center">
                    <DollarIcon className="w-5 h-5 text-koru-lime" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Price
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedSlot.price === 0 ? "Free" : `$${selectedSlot.price}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePay}
                  className="flex-1 bg-koru-lime hover:bg-koru-lime/90 text-neutral-900"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {selectedSlot.price === 0 ? "Confirm Booking" : `Pay $${selectedSlot.price}`}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Processing Payment */}
          {step === "paying" && (
            <motion.div
              key="paying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-8 flex flex-col items-center justify-center min-h-[300px]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-3 border-koru-purple border-t-transparent mb-4"
              />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Processing Payment
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                Please wait while we process your payment...
              </p>
            </motion.div>
          )}

          {/* Step 6: Receipt */}
          {step === "receipt" && receipt && selectedSlot && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-koru-lime/20 flex items-center justify-center"
                >
                  <CheckIcon className="w-8 h-8 text-koru-lime" />
                </motion.div>
              </div>

              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 text-center mb-2">
                {selectedSlot.price === 0 ? "Booking Confirmed!" : "Payment Successful!"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
                Your session with {personName} has been booked
              </p>

              {/* Receipt Card */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 mb-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Receipt
                    </p>
                    <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                      {receipt.id}
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-koru-lime/20 text-koru-lime text-xs font-medium">
                    Paid
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">To</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">{personName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Session</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{selectedSlot.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Date</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{receipt.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Time</span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-mono">{receipt.time}</span>
                  </div>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Amount</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedSlot.price === 0 ? "Free" : `$${selectedSlot.price}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-refund Notice */}
              <div className="bg-koru-golden/10 rounded-xl p-4 mb-6 border border-koru-golden/30">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-koru-golden flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    If {personName.split(" ")[0]} doesn&apos;t reply within{" "}
                    <span className="text-koru-golden font-medium">24 hours</span>,
                    your payment will be automatically refunded to your wallet.
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinueToChat}
                className="w-full bg-koru-purple hover:bg-koru-purple/90"
              >
                Start Chatting
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
