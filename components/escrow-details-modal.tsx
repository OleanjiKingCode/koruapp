"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { Address, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  useWithdrawEscrow,
  useContractEscrows,
  type ContractEscrowItem,
} from "@/lib/hooks/use-koru-escrow";
import { EscrowStatus } from "@/lib/contracts/koru-escrow";

// ── Helpers ─────────────────────────────────────────────────────────────

function fmtUsdc(amount: bigint): string {
  const num = Number(formatUnits(amount, 6));
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Countdown helpers ───────────────────────────────────────────────────

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  total: number; // ms remaining
  expired: boolean;
}

function getCountdown(deadlineUnixSeconds: number): Countdown {
  if (deadlineUnixSeconds === 0)
    return { days: 0, hours: 0, minutes: 0, total: 0, expired: true };
  const diff = deadlineUnixSeconds * 1000 - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, total: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, total: diff, expired: false };
}

function formatCountdown(c: Countdown): string {
  if (c.expired) return "Expired";
  const parts: string[] = [];
  if (c.days > 0) parts.push(`${c.days}d`);
  if (c.hours > 0) parts.push(`${c.hours}h`);
  parts.push(`${c.minutes}m`);
  return parts.join(" ");
}

// ── Status badge ────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  EscrowStatus,
  { bg: string; text: string; label: string }
> = {
  [EscrowStatus.Pending]: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    label: "Awaiting Accept",
  },
  [EscrowStatus.Accepted]: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    label: "Accepted",
  },
  [EscrowStatus.Released]: {
    bg: "bg-koru-lime/20",
    text: "text-koru-lime",
    label: "Ready",
  },
  [EscrowStatus.Disputed]: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    label: "Disputed",
  },
  [EscrowStatus.Completed]: {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-600 dark:text-neutral-400",
    label: "Completed",
  },
  [EscrowStatus.Cancelled]: {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-500 dark:text-neutral-500",
    label: "Cancelled",
  },
  [EscrowStatus.Expired]: {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-500 dark:text-neutral-500",
    label: "Expired",
  },
};

function StatusBadge({ status }: { status: EscrowStatus }) {
  const c = STATUS_MAP[status] || STATUS_MAP[EscrowStatus.Pending];
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap",
        c.bg,
        c.text,
      )}
    >
      {c.label}
    </span>
  );
}

// ── Live countdown display ──────────────────────────────────────────────

function LiveCountdown({
  deadlineUnix,
  label,
}: {
  deadlineUnix: number;
  label: string;
}) {
  const [countdown, setCountdown] = useState(() => getCountdown(deadlineUnix));

  useEffect(() => {
    if (deadlineUnix === 0) return;
    setCountdown(getCountdown(deadlineUnix));
    const interval = setInterval(() => {
      setCountdown(getCountdown(deadlineUnix));
    }, 30_000);
    return () => clearInterval(interval);
  }, [deadlineUnix]);

  if (countdown.expired) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <ClockIcon className="w-3.5 h-3.5 text-neutral-400" />
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          countdown.total < 1000 * 60 * 60 * 2
            ? "text-red-500"
            : "text-neutral-700 dark:text-neutral-300",
        )}
      >
        {formatCountdown(countdown)}
      </span>
    </div>
  );
}

// ── Single escrow card ──────────────────────────────────────────────────

function EscrowRow({
  escrow,
  onWithdrawComplete,
}: {
  escrow: ContractEscrowItem;
  onWithdrawComplete: () => void;
}) {
  // Can recipient withdraw?
  const canRecipientWithdraw =
    escrow.isRecipient &&
    (escrow.status === EscrowStatus.Released ||
      (escrow.status === EscrowStatus.Accepted &&
        escrow.disputeDeadline > 0 &&
        getCountdown(escrow.disputeDeadline).expired));

  // Can depositor reclaim?
  const canDepositorReclaim =
    !escrow.isRecipient &&
    escrow.status === EscrowStatus.Pending &&
    getCountdown(escrow.acceptDeadline).expired;

  // Determine which deadline to show
  let deadlineUnix = 0;
  let deadlineLabel = "";
  if (escrow.status === EscrowStatus.Pending) {
    deadlineUnix = escrow.acceptDeadline;
    deadlineLabel = "Accept in";
  } else if (
    escrow.status === EscrowStatus.Accepted &&
    escrow.disputeDeadline > 0
  ) {
    deadlineUnix = escrow.disputeDeadline;
    deadlineLabel = "Dispute window";
  }

  const borderColor =
    escrow.status === EscrowStatus.Disputed
      ? "border-red-200 dark:border-red-800/50"
      : escrow.status === EscrowStatus.Released
        ? "border-koru-lime/30"
        : "border-neutral-200 dark:border-neutral-700";

  const otherAddress = escrow.isRecipient ? escrow.depositor : escrow.recipient;

  return (
    <div
      className={cn(
        "rounded-xl p-3 border bg-neutral-50 dark:bg-neutral-800/50 transition-colors",
        borderColor,
      )}
    >
      {/* Top row: address | amount + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Colored avatar placeholder */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-koru-purple/60 to-koru-lime/60 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">
              {escrow.isRecipient ? "IN" : "OUT"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {escrow.isRecipient ? "From" : "To"}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate">
              {shortenAddress(otherAddress)}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            ${fmtUsdc(escrow.amount)}
          </p>
          <StatusBadge status={escrow.status} />
        </div>
      </div>

      {/* Countdown row */}
      {deadlineUnix > 0 && (
        <div className="mt-2">
          <LiveCountdown deadlineUnix={deadlineUnix} label={deadlineLabel} />
        </div>
      )}

      {/* Withdraw button */}
      {canRecipientWithdraw && (
        <div className="mt-2.5">
          <WithdrawButton
            escrowId={escrow.escrowId}
            onComplete={onWithdrawComplete}
          />
        </div>
      )}

      {/* Depositor reclaim for expired pending */}
      {canDepositorReclaim && (
        <div className="mt-2.5">
          <WithdrawButton
            escrowId={escrow.escrowId}
            onComplete={onWithdrawComplete}
            label="Reclaim"
          />
        </div>
      )}
    </div>
  );
}

// ── Withdraw button ─────────────────────────────────────────────────────

function WithdrawButton({
  escrowId,
  onComplete,
  label = "Withdraw",
}: {
  escrowId: number;
  onComplete: () => void;
  label?: string;
}) {
  const {
    withdraw,
    isSimulating,
    isPending,
    isConfirming,
    isConfirmed,
    reset,
  } = useWithdrawEscrow(BigInt(escrowId));

  useEffect(() => {
    if (isConfirmed) {
      onComplete();
      reset();
    }
  }, [isConfirmed, onComplete, reset]);

  const isProcessing = isSimulating || isPending || isConfirming;

  return (
    <Button
      onClick={() => withdraw()}
      disabled={isProcessing}
      size="sm"
      className="w-full bg-koru-lime text-neutral-900 hover:bg-koru-lime/90 h-8 text-xs font-medium"
    >
      {isSimulating
        ? "Preparing..."
        : isPending
          ? "Confirm in wallet..."
          : isConfirming
            ? "Processing..."
            : label}
    </Button>
  );
}

// ── Modal content (shared between dialog & drawer) ──────────────────────

function ModalBody() {
  const { address } = useAccount();
  const { escrows, isLoading, error, refetch } = useContractEscrows(
    address as Address | undefined,
  );

  // Compute totals from contract data
  const totals = useMemo(() => {
    let pending = BigInt(0);
    let ready = BigInt(0);
    for (const e of escrows) {
      if (e.isRecipient) {
        if (
          e.status === EscrowStatus.Pending ||
          e.status === EscrowStatus.Accepted
        ) {
          pending += e.amount;
        } else if (e.status === EscrowStatus.Released) {
          ready += e.amount;
        }
      }
    }
    return { pending, ready };
  }, [escrows]);

  // Group escrows by category
  const grouped = useMemo(() => {
    const disputed = escrows.filter((e) => e.status === EscrowStatus.Disputed);
    const inEscrow = escrows.filter(
      (e) =>
        e.status === EscrowStatus.Pending || e.status === EscrowStatus.Accepted,
    );
    const ready = escrows.filter((e) => e.status === EscrowStatus.Released);
    return { disputed, inEscrow, ready };
  }, [escrows]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  return (
    <div className="flex flex-col">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        <div className="bg-koru-golden/10 rounded-xl p-3 border border-koru-golden/20">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-0.5 uppercase tracking-wide font-medium">
            In Escrow
          </p>
          <p className="text-xl font-semibold text-koru-golden tabular-nums">
            ${fmtUsdc(totals.pending)}
          </p>
        </div>
        <div className="bg-koru-lime/10 rounded-xl p-3 border border-koru-lime/20">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-0.5 uppercase tracking-wide font-medium">
            Ready
          </p>
          <p className="text-xl font-semibold text-koru-lime tabular-nums">
            ${fmtUsdc(totals.ready)}
          </p>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: "50vh" }}>
        {error ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              Failed to load escrows from contract
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        ) : isLoading ? (
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
          <div className="text-center py-10">
            <WalletIcon className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              No active escrows
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Payments you send or receive will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Disputed */}
            {grouped.disputed.length > 0 && (
              <Section
                icon={<AlertIcon className="w-4 h-4 text-red-500" />}
                title={`Disputed (${grouped.disputed.length})`}
                titleColor="text-red-600 dark:text-red-400"
              >
                {grouped.disputed.map((e) => (
                  <EscrowRow
                    key={e.escrowId}
                    escrow={e}
                    onWithdrawComplete={handleRefresh}
                  />
                ))}
              </Section>
            )}

            {/* In Escrow */}
            {grouped.inEscrow.length > 0 && (
              <Section
                icon={<ClockIcon className="w-4 h-4 text-koru-golden" />}
                title={`In Escrow (${grouped.inEscrow.length})`}
              >
                {grouped.inEscrow.map((e) => (
                  <EscrowRow
                    key={e.escrowId}
                    escrow={e}
                    onWithdrawComplete={handleRefresh}
                  />
                ))}
              </Section>
            )}

            {/* Ready to Withdraw */}
            {grouped.ready.length > 0 && (
              <Section
                icon={<CheckIcon className="w-4 h-4 text-koru-lime" />}
                title={`Ready to Withdraw (${grouped.ready.length})`}
              >
                {grouped.ready.map((e) => (
                  <EscrowRow
                    key={e.escrowId}
                    escrow={e}
                    onWithdrawComplete={handleRefresh}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  titleColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className={cn(
          "text-sm font-medium mb-2 flex items-center gap-2",
          titleColor || "text-neutral-700 dark:text-neutral-300",
        )}
      >
        {icon}
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────

interface EscrowDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EscrowDetailsModal({
  isOpen,
  onClose,
}: EscrowDetailsModalProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle>Escrow Details</DialogTitle>
            <DialogDescription>
              Your active escrow payments and withdrawals
            </DialogDescription>
          </DialogHeader>
          <ModalBody />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left px-5">
          <DrawerTitle>Escrow Details</DrawerTitle>
          <DrawerDescription>
            Your active escrow payments and withdrawals
          </DrawerDescription>
        </DrawerHeader>
        <ModalBody />
      </DrawerContent>
    </Drawer>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
