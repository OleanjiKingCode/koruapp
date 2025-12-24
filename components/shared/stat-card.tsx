"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "purple" | "golden" | "lime";
  className?: string;
}

const variantStyles = {
  default: {
    card: "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
    icon: "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300",
    value: "text-neutral-900 dark:text-neutral-100",
  },
  purple: {
    card: "bg-koru-purple/10 dark:bg-koru-purple/15 border-koru-purple/20 dark:border-koru-purple/40",
    icon: "bg-koru-purple/20 dark:bg-koru-purple/30 text-koru-purple",
    value: "text-neutral-900 dark:text-koru-purple",
  },
  golden: {
    card: "bg-koru-golden/10 dark:bg-koru-golden/15 border-koru-golden/20 dark:border-koru-golden/40",
    icon: "bg-koru-golden/20 dark:bg-koru-golden/30 text-koru-golden",
    value: "text-neutral-900 dark:text-koru-golden",
  },
  lime: {
    card: "bg-koru-lime/10 dark:bg-koru-lime/15 border-koru-lime/20 dark:border-koru-lime/40",
    icon: "bg-koru-lime/20 dark:bg-koru-lime/30 text-koru-lime",
    value: "text-neutral-900 dark:text-koru-lime",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative p-5 rounded-2xl border transition-all duration-300",
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-quicksand font-medium">
            {title}
          </p>
          <p className={cn("text-2xl font-tenor font-medium", styles.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-quicksand">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon or Trend */}
        <div className="flex flex-col items-end gap-2">
          {icon && (
            <div className={cn("p-2.5 rounded-xl", styles.icon)}>{icon}</div>
          )}
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-quicksand font-semibold px-2 py-0.5 rounded-md",
                trend === "up" && "text-koru-lime bg-koru-lime/15",
                trend === "down" && "text-red-500 bg-red-500/15",
                trend === "neutral" && "text-neutral-400 bg-neutral-200 dark:bg-neutral-700"
              )}
            >
              {trend === "up" && <TrendUpIcon className="w-3 h-3" />}
              {trend === "down" && <TrendDownIcon className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m22 17-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </svg>
  );
}
