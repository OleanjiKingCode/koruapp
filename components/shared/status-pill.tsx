"use client";

import { cn } from "@/lib/utils";

type StatusType = "pending" | "replied" | "refunded" | "active" | "completed" | "default";

interface StatusPillProps {
  status: StatusType | string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-koru-golden/20 text-koru-golden border-koru-golden/30",
  replied: "bg-koru-lime/20 text-koru-lime border-koru-lime/30",
  refunded: "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600",
  active: "bg-koru-purple/20 text-koru-purple border-koru-purple/30",
  completed: "bg-koru-lime/20 text-koru-lime border-koru-lime/30",
  default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700",
};

export function StatusPill({ status, className }: StatusPillProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const styles = statusStyles[normalizedStatus] || statusStyles.default;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs   font-medium border capitalize",
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}



