"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBookingStorageKey } from "@/lib/constants";
import type {
  AvailabilitySlot,
  AvailabilityData,
} from "@/components/availability-modal";
import {
  DURATION_OPTIONS,
  formatDateShort,
} from "@/components/availability-modal";
import {
  ClockIcon,
  GlobeIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DollarIcon,
  WalletIcon,
  AlertCircleIcon,
} from "@/components/icons";
import { usePrivy } from "@privy-io/react-auth";
import {
  useCreateEscrow,
  useApproveUsdc,
  useUsdcBalance,
  useUsdcAllowance,
  parseUsdcAmount,
  formatUsdcAmount,
  getEscrowAddress,
} from "@/lib/hooks/use-koru-escrow";
import { getSupabaseClient } from "@/lib/supabase-client";
import { getChainId } from "@/lib/wagmi-config";
import type { Address } from "viem";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  personId: string;
  recipientAddress?: Address; // Wallet address of the person being booked (optional for now)
  availability: AvailabilityData;
  onBook: (
    slot: AvailabilitySlot,
    date: Date,
    timeSlot: string,
    receipt: Receipt,
  ) => void;
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
  // On-chain data
  escrowId?: number;
  txHash?: string;
  depositorAddress?: string;
  recipientAddress?: string;
}

type Step =
  | "slots"
  | "date"
  | "time"
  | "confirm"
  | "approving"
  | "paying"
  | "receipt";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function BookingModal({
  open,
  onOpenChange,
  personName,
  personId,
  recipientAddress,
  availability,
  onBook,
}: BookingModalProps) {
  const [step, setStep] = useState<Step>("slots");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1);
  });
  const [error, setError] = useState<string | null>(null);

  const timezone = availability.timezone || "UTC";

  // Privy wallet connection
  const { ready, authenticated, user, login } = usePrivy();
  const walletAddress = user?.wallet?.address as Address | undefined;

  // Convert price to USDC amount (6 decimals)
  const escrowAmount = useMemo(() => {
    if (!selectedSlot || selectedSlot.price === 0) return BigInt(0);
    return parseUsdcAmount(selectedSlot.price);
  }, [selectedSlot]);

  // Escrow hooks
  const { balance: usdcBalance, formatted: usdcFormatted } =
    useUsdcBalance(walletAddress);
  const { allowance } = useUsdcAllowance(walletAddress);
  const needsApproval = escrowAmount > BigInt(0) && allowance < escrowAmount;
  const hasEnoughBalance = usdcBalance >= escrowAmount;

  // Approval hook
  const {
    approve,
    isSimulating: isApprovalSimulating,
    isPending: isApprovalPending,
    isConfirming: isApprovalConfirming,
    isConfirmed: isApprovalConfirmed,
    simError: approvalSimError,
    writeError: approvalWriteError,
    reset: resetApproval,
  } = useApproveUsdc(escrowAmount);

  // Create escrow hook - only enabled if we have a recipient address
  const {
    createEscrow,
    escrowId,
    txHash,
    address: depositorAddress,
    isSimulating: isEscrowSimulating,
    isPending: isEscrowPending,
    isConfirming: isEscrowConfirming,
    isConfirmed: isEscrowConfirmed,
    simError: escrowSimError,
    writeError: escrowWriteError,
    reset: resetEscrow,
  } = useCreateEscrow(
    recipientAddress ||
      ("0x0000000000000000000000000000000000000000" as Address),
    escrowAmount,
  );

  // Check if recipient can receive payment
  const canReceivePayment = !!recipientAddress;

  // Handle approval confirmation - proceed to create escrow
  useEffect(() => {
    if (isApprovalConfirmed && step === "approving") {
      setStep("paying");
      createEscrow();
    }
  }, [isApprovalConfirmed, step]);

  // Handle escrow confirmation - save to DB and show receipt
  // This ONLY fires after a REAL blockchain transaction is confirmed
  useEffect(() => {
    if (
      isEscrowConfirmed &&
      escrowId !== undefined &&
      txHash &&
      step === "paying"
    ) {
      console.log(
        "[BookingModal] ===== TRANSACTION CONFIRMED ON BLOCKCHAIN =====",
      );
      console.log("[BookingModal] Transaction Hash:", txHash);
      console.log("[BookingModal] Escrow ID:", escrowId.toString());
      console.log(
        "[BookingModal] USDC has been transferred to the escrow contract",
      );
      saveEscrowAndShowReceipt();
    }
  }, [isEscrowConfirmed, escrowId, txHash, step]);

  // Handle errors
  useEffect(() => {
    const err =
      approvalSimError ||
      approvalWriteError ||
      escrowSimError ||
      escrowWriteError;
    if (err) {
      setError(err.message || "Transaction failed. Please try again.");
      if (step === "approving") setStep("confirm");
      if (step === "paying") setStep("confirm");
    }
  }, [
    approvalSimError,
    approvalWriteError,
    escrowSimError,
    escrowWriteError,
    step,
  ]);

  // Get configured slots only
  const configuredSlots = useMemo(() => {
    return availability.slots.filter((s) => s.name && s.times.length > 0);
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
    if (!selectedSlot || !selectedDate || !selectedTime) return;

    setError(null);

    // Debug logging - REAL PAYMENT FLOW
    console.log("[BookingModal] ===== PAYMENT FLOW START =====");
    console.log("[BookingModal] Price:", selectedSlot.price, "USD");
    console.log("[BookingModal] Escrow amount (raw):", escrowAmount.toString());
    console.log("[BookingModal] Recipient address:", recipientAddress);
    console.log("[BookingModal] Can receive payment:", canReceivePayment);
    console.log("[BookingModal] User authenticated:", authenticated);
    console.log("[BookingModal] User wallet:", walletAddress);
    console.log("[BookingModal] USDC balance:", usdcFormatted);
    console.log("[BookingModal] Has enough balance:", hasEnoughBalance);
    console.log("[BookingModal] Needs approval:", needsApproval);
    console.log("[BookingModal] Current allowance:", allowance.toString());

    // For free slots, skip payment
    if (selectedSlot.price === 0) {
      console.log("[BookingModal] Free slot - no payment required");
      await handleFreeBooking();
      return;
    }

    // CRITICAL: Validate recipient address is a real address (not zero)
    if (
      !recipientAddress ||
      recipientAddress === "0x0000000000000000000000000000000000000000"
    ) {
      console.error(
        "[BookingModal] INVALID: Recipient has no valid wallet address",
      );
      setError(
        `${personName} hasn't set up their wallet to receive payments yet. They need to connect their wallet on Koru first.`,
      );
      return;
    }

    // Check wallet connection
    if (!authenticated || !walletAddress) {
      console.log("[BookingModal] User not authenticated - opening login");
      login();
      return;
    }

    // CRITICAL: Check that user is not paying themselves
    if (walletAddress.toLowerCase() === recipientAddress.toLowerCase()) {
      console.error("[BookingModal] INVALID: Cannot pay yourself");
      setError("You cannot book a session with yourself.");
      return;
    }

    // Check balance
    if (!hasEnoughBalance) {
      console.error("[BookingModal] INSUFFICIENT BALANCE");
      console.log(
        "[BookingModal] Required:",
        formatUsdcAmount(escrowAmount),
        "USDC",
      );
      console.log("[BookingModal] Available:", usdcFormatted, "USDC");
      setError(
        `Insufficient USDC balance. You have ${usdcFormatted} USDC but need $${selectedSlot.price}. Get testnet USDC from the Base Sepolia faucet.`,
      );
      return;
    }

    // CRITICAL: Validate escrow amount is positive
    if (escrowAmount <= BigInt(0)) {
      console.error(
        "[BookingModal] INVALID: Escrow amount is zero or negative",
      );
      setError("Invalid payment amount. Please try again.");
      return;
    }

    // Start REAL payment flow
    console.log(
      "[BookingModal] ===== INITIATING REAL BLOCKCHAIN TRANSACTION =====",
    );
    console.log(
      "[BookingModal] This will transfer",
      formatUsdcAmount(escrowAmount),
      "USDC",
    );
    console.log("[BookingModal] From:", walletAddress);
    console.log("[BookingModal] To escrow for recipient:", recipientAddress);

    if (needsApproval) {
      console.log("[BookingModal] Step 1: Approving USDC spend...");
      setStep("approving");
      approve();
    } else {
      console.log(
        "[BookingModal] Approval exists, creating escrow directly...",
      );
      setStep("paying");
      createEscrow();
    }
  };

  const handleFreeBooking = async () => {
    if (!selectedSlot || !selectedDate || !selectedTime) return;

    const now = new Date();
    const newReceipt: Receipt = {
      id: `RCP-${Date.now().toString(36).toUpperCase()}`,
      personName,
      personId,
      slotName: selectedSlot.name,
      price: 0,
      date: formatDate(selectedDate),
      time: selectedTime,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setReceipt(newReceipt);
    setStep("receipt");

    // Store booking info in localStorage for the chat page
    localStorage.setItem(
      getBookingStorageKey(personId),
      JSON.stringify({
        slotName: selectedSlot.name,
        price: 0,
        date: formatDate(selectedDate),
        time: selectedTime,
        createdAt: now.toISOString(),
        receiptId: newReceipt.id,
      }),
    );
  };

  const saveEscrowAndShowReceipt = async () => {
    if (
      !selectedSlot ||
      !selectedDate ||
      !selectedTime ||
      escrowId === undefined ||
      !txHash
    )
      return;

    const now = new Date();
    const newReceipt: Receipt = {
      id: `ESC-${escrowId}`,
      personName,
      personId,
      slotName: selectedSlot.name,
      price: selectedSlot.price,
      date: formatDate(selectedDate),
      time: selectedTime,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      escrowId: Number(escrowId),
      txHash,
      depositorAddress: walletAddress,
      recipientAddress,
    };

    // Save to Supabase
    const supabase = getSupabaseClient();
    if (supabase && recipientAddress) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("escrows").insert({
          escrow_id: Number(escrowId),
          chain_id: getChainId(),
          depositor_address: walletAddress?.toLowerCase(),
          recipient_address: recipientAddress.toLowerCase(),
          amount: selectedSlot.price,
          status: "pending",
          create_tx_hash: txHash,
          accept_deadline: new Date(
            now.getTime() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          description: `${selectedSlot.name} session with ${personName}`,
        });
      } catch (err) {
        console.error("Failed to save escrow to database:", err);
      }
    }

    setReceipt(newReceipt);
    setStep("receipt");

    // Store booking info in localStorage for the chat page
    localStorage.setItem(
      getBookingStorageKey(personId),
      JSON.stringify({
        slotName: selectedSlot.name,
        price: selectedSlot.price,
        date: formatDate(selectedDate),
        time: selectedTime,
        createdAt: now.toISOString(),
        receiptId: newReceipt.id,
        escrowId: Number(escrowId),
        txHash,
      }),
    );
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
    setError(null);
    resetApproval();
    resetEscrow();
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
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
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
          step === "slots"
            ? "max-w-sm"
            : step === "confirm"
              ? "max-w-sm"
              : "max-w-md",
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
              className="p-1"
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
                        <span
                          className={cn(
                            "text-lg font-bold",
                            slot.price === 0
                              ? "text-koru-lime"
                              : "text-koru-golden",
                          )}
                        >
                          {slot.price === 0 ? "Free" : `$${slot.price}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>
                            {
                              DURATION_OPTIONS.find(
                                (d) => d.value === slot.duration,
                              )?.label
                            }
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
              className="p-1"
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
                    {MONTHS[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
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
                      return (
                        <div key={`empty-${index}`} className="aspect-square" />
                      );
                    }

                    const isAvailable = isDayAvailable(date);
                    const isToday =
                      date.toDateString() === new Date().toDateString();

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
                          isToday &&
                            "ring-2 ring-koru-golden ring-offset-2 dark:ring-offset-neutral-900",
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
              className="p-1"
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
                        "hover:bg-koru-purple/10 hover:text-koru-purple border-2 border-transparent hover:border-koru-purple/30",
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
          {step === "confirm" &&
            selectedSlot &&
            selectedDate &&
            selectedTime && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-1"
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

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Wallet Info (for paid bookings) */}
                {selectedSlot.price > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <WalletIcon className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {walletAddress
                            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                            : "No wallet connected"}
                        </span>
                      </div>
                      {walletAddress && (
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {usdcFormatted} USDC
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                        {selectedSlot.price === 0
                          ? "Free"
                          : `$${selectedSlot.price}`}
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
                  {selectedSlot.price === 0 ? (
                    <Button
                      onClick={handlePay}
                      className="flex-1 bg-koru-lime hover:bg-koru-lime/90 text-neutral-900"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </Button>
                  ) : !canReceivePayment ? (
                    <Button
                      disabled
                      className="flex-1 bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
                    >
                      Recipient Has No Wallet
                    </Button>
                  ) : !authenticated || !walletAddress ? (
                    <Button
                      onClick={() => login()}
                      className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                    >
                      <WalletIcon className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  ) : !hasEnoughBalance ? (
                    <Button
                      disabled
                      className="flex-1 bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
                    >
                      Insufficient USDC
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePay}
                      className="flex-1 bg-koru-lime hover:bg-koru-lime/90 text-neutral-900"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {needsApproval
                        ? `Approve & Pay $${selectedSlot.price}`
                        : `Pay $${selectedSlot.price}`}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

          {/* Step 5: Approving USDC */}
          {step === "approving" && (
            <motion.div
              key="approving"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-8 flex flex-col items-center justify-center min-h-[300px]"
            >
              {/* Loading Animation Container */}
              <div className="relative mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-20 h-20 rounded-full bg-koru-golden/20"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-20 h-20"
                >
                  <svg className="w-20 h-20" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-neutral-200 dark:text-neutral-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="160"
                      strokeDashoffset="120"
                      strokeLinecap="round"
                      className="text-koru-golden"
                    />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <CheckIcon className="w-8 h-8 text-koru-golden" />
                  </motion.div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {isApprovalSimulating
                  ? "Preparing Approval..."
                  : isApprovalPending
                    ? "Confirm in Wallet"
                    : isApprovalConfirming
                      ? "Confirming Approval..."
                      : "Approving USDC"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-4">
                {isApprovalPending
                  ? "Please confirm the approval transaction in your wallet"
                  : "Allowing the escrow contract to use your USDC..."}
              </p>

              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-koru-golden"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6: Processing Payment */}
          {step === "paying" && (
            <motion.div
              key="paying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-8 flex flex-col items-center justify-center min-h-[300px]"
            >
              {/* Loading Animation Container */}
              <div className="relative mb-6">
                {/* Outer glow ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-20 h-20 rounded-full bg-koru-purple/20"
                />

                {/* Spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-20 h-20"
                >
                  <svg className="w-20 h-20" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-neutral-200 dark:text-neutral-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="160"
                      strokeDashoffset="120"
                      strokeLinecap="round"
                      className="text-koru-purple"
                    />
                  </svg>
                </motion.div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <CreditCardIcon className="w-8 h-8 text-koru-purple" />
                  </motion.div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {isEscrowSimulating
                  ? "Preparing Transaction..."
                  : isEscrowPending
                    ? "Confirm in Wallet"
                    : isEscrowConfirming
                      ? "Confirming Payment..."
                      : "Creating Escrow"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-4">
                {isEscrowPending
                  ? "Please confirm the escrow transaction in your wallet"
                  : isEscrowConfirming
                    ? "Waiting for blockchain confirmation..."
                    : "Creating a secure escrow for your payment..."}
              </p>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-koru-purple"
                  />
                ))}
              </div>
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
              className="p-1"
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
                {selectedSlot.price === 0
                  ? "Booking Confirmed!"
                  : "Payment Successful!"}
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
                    <span className="text-neutral-500 dark:text-neutral-400">
                      To
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {personName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Session
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {selectedSlot.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Date
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {receipt.date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Time
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100 font-mono">
                      {receipt.time}
                    </span>
                  </div>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Amount
                    </span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedSlot.price === 0
                        ? "Free"
                        : `$${selectedSlot.price}`}
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
                    <span className="text-koru-golden font-medium">
                      24 hours
                    </span>
                    , your payment will be automatically refunded to your
                    wallet.
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
