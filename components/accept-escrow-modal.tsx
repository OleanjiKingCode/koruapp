"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAcceptEscrow } from "@/lib/hooks/use-koru-escrow";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { CheckIcon, ClockIcon, DollarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AcceptEscrowModalProps {
  isOpen: boolean;
  escrowId: bigint;
  amount: number;
  payerName: string;
  slotName: string | null;
  bookedDate: string | null; // ISO date string (YYYY-MM-DD)
  bookedTime: string | null; // Time string (e.g., "09:00-09:30")
  deadlineAt: string | null;
  chatId: string;
  onAccepted: () => void;
}

export function AcceptEscrowModal({
  isOpen,
  escrowId,
  amount,
  payerName,
  slotName,
  bookedDate,
  bookedTime,
  deadlineAt,
  chatId,
  onAccepted,
}: AcceptEscrowModalProps) {
  const router = useRouter();
  const [hasRejected, setHasRejected] = useState(false);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  const {
    accept,
    isSimulating,
    isPending,
    isConfirming,
    isConfirmed,
    simError,
    writeError,
    reset,
  } = useAcceptEscrow(escrowId);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!deadlineAt) return "24 hours";
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Handle successful acceptance - update database
  useEffect(() => {
    const updateDatabase = async () => {
      if (isConfirmed && !isUpdatingDb) {
        setIsUpdatingDb(true);
        try {
          // Update chat status to active
          const response = await fetch(`/api/chat/${chatId}/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ escrowId: Number(escrowId) }),
          });

          if (response.ok) {
            toast.success("Escrow accepted!");
            onAccepted();
          } else {
            console.error("Failed to update chat status");
            toast.warning(
              "Escrow accepted on-chain, but failed to update status.",
            );
            onAccepted();
          }
        } catch (err) {
          console.error("Error updating database:", err);
          toast.warning(
            "Escrow accepted on-chain, but failed to update status.",
          );
          onAccepted();
        } finally {
          setIsUpdatingDb(false);
        }
      }
    };

    updateDatabase();
  }, [isConfirmed, chatId, escrowId, onAccepted, isUpdatingDb]);

  // Handle rejection - redirect away
  useEffect(() => {
    if (writeError && !hasRejected) {
      // Check if user rejected the transaction
      const errorMessage = writeError.message?.toLowerCase() || "";
      if (
        errorMessage.includes("rejected") ||
        errorMessage.includes("denied") ||
        errorMessage.includes("cancelled") ||
        errorMessage.includes("user refused")
      ) {
        setHasRejected(true);
        // Wait a moment then redirect
        setTimeout(() => {
          router.push("/chats");
        }, 100);
      }
    }
  }, [writeError, hasRejected, router]);

  const handleAccept = () => {
    reset();
    accept();
  };

  const handleDecline = () => {
    router.push("/chats");
  };

  const isLoading = isSimulating || isPending || isConfirming || isUpdatingDb;
  const hasError = simError || writeError;
  const isRejectionError =
    hasError &&
    (hasError.message?.toLowerCase().includes("rejected") ||
      hasError.message?.toLowerCase().includes("denied") ||
      hasError.message?.toLowerCase().includes("cancelled"));

  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (!isOpen) return null;

  const modalBody = (
    <>
      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-koru-purple via-koru-golden to-koru-lime" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white">
            Accept Paid Chat Request
          </h2>
          <p className="mt-1.5 sm:mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {payerName} wants to chat with you
          </p>
        </div>

        {/* Details card */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 sm:p-4 space-y-3">
          {slotName && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Session
              </span>
              <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                {slotName}
              </span>
            </div>
          )}

          {bookedDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Scheduled
              </span>
              <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                {new Date(bookedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  { weekday: "short", month: "short", day: "numeric" },
                )}
                {bookedTime && (
                  <span className="ml-1.5 font-mono text-[10px] sm:text-xs text-neutral-500">
                    {bookedTime}
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <DollarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Payment
            </span>
            <span className="text-xs sm:text-sm font-semibold text-koru-lime">
              ${amount.toFixed(2)} USDC
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Time to accept
            </span>
            <span
              className={cn(
                "text-xs sm:text-sm font-medium",
                getTimeRemaining() === "Expired"
                  ? "text-red-500"
                  : "text-koru-golden",
              )}
            >
              {getTimeRemaining()}
            </span>
          </div>
        </div>

        {/* Timeline info */}
        <div className="bg-koru-golden/5 rounded-xl p-3 border border-koru-golden/20">
          <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <span className="font-medium text-koru-golden">How it works:</span>{" "}
            You have until{" "}
            <span className="font-medium">24 hours after the session date</span>{" "}
            to accept. Once accepted, the payment stays in escrow until the
            dispute window closes, then funds are released to your withdrawable
            balance.
          </p>
        </div>

        {/* Info text */}
        <p className="text-[10px] sm:text-xs text-center text-neutral-500 dark:text-neutral-400">
          By accepting, you agree to respond to this chat. The payment will be
          held in escrow until the chat is completed.
        </p>

        {/* Error display */}
        {hasError && !isRejectionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
              {simError?.message || writeError?.message || "Transaction failed"}
            </p>
          </div>
        )}

        {/* Success state */}
        {isConfirmed && (
          <div className="bg-koru-lime/10 border border-koru-lime/20 rounded-lg p-3 flex items-center gap-2">
            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-koru-lime" />
            <p className="text-xs sm:text-sm text-koru-lime font-medium">
              Accepted! Redirecting to chat...
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm"
            onClick={handleDecline}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button
            className="flex-1 bg-koru-purple hover:bg-koru-purple/90 text-white text-xs sm:text-sm"
            onClick={handleAccept}
            disabled={isLoading || isConfirmed}
          >
            {isSimulating
              ? "Preparing..."
              : isPending
                ? "Confirm in Wallet..."
                : isConfirming
                  ? "Confirming..."
                  : isUpdatingDb
                    ? "Finalizing..."
                    : isConfirmed
                      ? "Accepted!"
                      : "Accept & Start Chat"}
          </Button>
        </div>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="p-0 gap-0 overflow-hidden max-w-md max-h-[85dvh] overflow-y-auto [&>button]:hidden">
          <DialogTitle className="sr-only">
            Accept Paid Chat Request
          </DialogTitle>
          {modalBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={() => {}}
      modal={true}
      dismissible={false}
    >
      <DrawerContent className="overflow-hidden">
        <DrawerTitle className="sr-only">Accept Paid Chat Request</DrawerTitle>
        <div className="overflow-y-auto max-h-[85dvh] pb-4" data-vaul-no-drag>
          {modalBody}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
