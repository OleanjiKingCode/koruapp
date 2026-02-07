"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAcceptEscrow } from "@/lib/hooks/use-koru-escrow";
import { CheckIcon, ClockIcon, DollarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AcceptEscrowModalProps {
  isOpen: boolean;
  escrowId: bigint;
  amount: number;
  payerName: string;
  slotName: string | null;
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop - no click to close */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl"
          >
            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-koru-purple via-koru-golden to-koru-lime" />

            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Accept Paid Chat Request
                </h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {payerName} wants to chat with you
                </p>
              </div>

              {/* Details card */}
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-3">
                {slotName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      Session
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {slotName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <DollarIcon className="w-4 h-4" />
                    Payment
                  </span>
                  <span className="text-sm font-semibold text-koru-lime">
                    ${amount.toFixed(2)} USDC
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    Time to accept
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      getTimeRemaining() === "Expired"
                        ? "text-red-500"
                        : "text-koru-golden",
                    )}
                  >
                    {getTimeRemaining()}
                  </span>
                </div>
              </div>

              {/* Info text */}
              <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                By accepting, you agree to respond to this chat. The payment
                will be held in escrow until the chat is completed.
              </p>

              {/* Error display */}
              {hasError && !isRejectionError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {simError?.message ||
                      writeError?.message ||
                      "Transaction failed"}
                  </p>
                </div>
              )}

              {/* Success state */}
              {isConfirmed && (
                <div className="bg-koru-lime/10 border border-koru-lime/20 rounded-lg p-3 flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-koru-lime" />
                  <p className="text-sm text-koru-lime font-medium">
                    Accepted! Redirecting to chat...
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDecline}
                  disabled={isLoading}
                >
                  Decline
                </Button>
                <Button
                  className="flex-1 bg-koru-purple hover:bg-koru-purple/90 text-white"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
