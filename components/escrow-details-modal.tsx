"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import {
  useWithdrawEscrow,
  formatUsdcAmount,
} from "@/lib/hooks/use-koru-escrow";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface EscrowItem {
  id: string;
  escrowId: number;
  amount: number;
  status: string;
  acceptDeadline: string | null;
  hoursLeft: number | null;
  chatId: string | null;
  isRecipient: boolean;
  otherParty: {
    id: string;
    name: string;
    username: string;
    profileImageUrl: string | null;
  } | null;
  createdAt: string;
}

interface EscrowDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EscrowDetailsModal({
  isOpen,
  onClose,
}: EscrowDetailsModalProps) {
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const { data, error, mutate } = useSWR<{
    escrows: EscrowItem[];
    totals: { pending: number; ready: number; total: number };
  }>(isOpen ? "/api/user/escrows?role=recipient" : null, fetcher, {
    refreshInterval: 30000,
  });

  const escrows = data?.escrows || [];
  const totals = data?.totals || { pending: 0, ready: 0, total: 0 };

  const pendingEscrows = escrows.filter(
    (e) => e.status === "pending" || e.status === "accepted",
  );
  const readyEscrows = escrows.filter((e) => e.status === "released");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleWithdraw = async (escrowId: number) => {
    setWithdrawingId(escrowId);
    // The actual withdraw is handled by the blockchain hook in the component
    // This is just for UI state
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Accepted
          </span>
        );
      case "released":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-koru-lime/20 text-koru-lime dark:text-koru-lime">
            Ready
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[85vh] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Escrow Balance
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Totals */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-koru-golden/10 rounded-xl p-3 border border-koru-golden/20">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    In Escrow
                  </p>
                  <p className="text-xl font-semibold text-koru-golden">
                    ${totals.pending.toFixed(2)}
                  </p>
                </div>
                <div className="bg-koru-lime/10 rounded-xl p-3 border border-koru-lime/20">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    Ready to Withdraw
                  </p>
                  <p className="text-xl font-semibold text-koru-lime">
                    ${totals.ready.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[50vh]">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Failed to load escrows
                  </p>
                </div>
              ) : !data ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                      <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : escrows.length === 0 ? (
                <div className="text-center py-8">
                  <WalletIcon className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No active escrows
                  </p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                    Payments you receive will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Escrows */}
                  {pendingEscrows.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-koru-golden" />
                        In Escrow ({pendingEscrows.length})
                      </h3>
                      <div className="space-y-2">
                        {pendingEscrows.map((escrow) => (
                          <EscrowCard
                            key={escrow.id}
                            escrow={escrow}
                            getStatusBadge={getStatusBadge}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ready Escrows */}
                  {readyEscrows.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                        <CheckIcon className="w-4 h-4 text-koru-lime" />
                        Ready to Withdraw ({readyEscrows.length})
                      </h3>
                      <div className="space-y-2">
                        {readyEscrows.map((escrow) => (
                          <EscrowCardWithWithdraw
                            key={escrow.id}
                            escrow={escrow}
                            getStatusBadge={getStatusBadge}
                            onWithdrawComplete={() => mutate()}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EscrowCard({
  escrow,
  getStatusBadge,
}: {
  escrow: EscrowItem;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {escrow.otherParty && (
            <OptimizedAvatar
              src={escrow.otherParty.profileImageUrl?.replace(
                "_normal",
                "_400x400",
              )}
              alt={escrow.otherParty.name}
              size={36}
              fallbackSeed={escrow.otherParty.username}
            />
          )}
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {escrow.otherParty?.name || "Unknown"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              @{escrow.otherParty?.username || "user"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            ${escrow.amount.toFixed(2)}
          </p>
          <div className="flex items-center justify-end gap-2 mt-0.5">
            {getStatusBadge(escrow.status)}
            {escrow.hoursLeft !== null && escrow.hoursLeft > 0 && (
              <span className="text-xs text-neutral-400">
                {escrow.hoursLeft}h left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EscrowCardWithWithdraw({
  escrow,
  getStatusBadge,
  onWithdrawComplete,
}: {
  escrow: EscrowItem;
  getStatusBadge: (status: string) => React.ReactNode;
  onWithdrawComplete: () => void;
}) {
  const {
    withdraw,
    isSimulating,
    isPending,
    isConfirming,
    isConfirmed,
    reset,
  } = useWithdrawEscrow(BigInt(escrow.escrowId));

  useEffect(() => {
    if (isConfirmed) {
      onWithdrawComplete();
      reset();
    }
  }, [isConfirmed, onWithdrawComplete, reset]);

  const isProcessing = isSimulating || isPending || isConfirming;

  return (
    <div className="bg-koru-lime/5 dark:bg-koru-lime/10 rounded-xl p-3 border border-koru-lime/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {escrow.otherParty && (
            <OptimizedAvatar
              src={escrow.otherParty.profileImageUrl?.replace(
                "_normal",
                "_400x400",
              )}
              alt={escrow.otherParty.name}
              size={36}
              fallbackSeed={escrow.otherParty.username}
            />
          )}
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {escrow.otherParty?.name || "Unknown"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              @{escrow.otherParty?.username || "user"}
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold text-koru-lime">
          ${escrow.amount.toFixed(2)}
        </p>
      </div>
      <Button
        onClick={() => withdraw()}
        disabled={isProcessing}
        size="sm"
        className="w-full bg-koru-lime text-neutral-900 hover:bg-koru-lime/90"
      >
        {isSimulating
          ? "Preparing..."
          : isPending
            ? "Confirm in wallet..."
            : isConfirming
              ? "Withdrawing..."
              : "Withdraw"}
      </Button>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21 12c0-1.66-1.34-3-3-3H6c-1.66 0-3 1.34-3 3v6c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-6z" />
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  );
}
