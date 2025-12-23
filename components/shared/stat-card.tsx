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
  default: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
  purple: "bg-koru-purple/10 border-koru-purple/20",
  golden: "bg-koru-golden/10 border-koru-golden/20",
  lime: "bg-koru-lime/10 border-koru-lime/20",
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative p-5 rounded-2xl border shadow-soft transition-all duration-300",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-quicksand">
            {title}
          </p>
          <p className="text-2xl font-tenor font-medium text-neutral-900 dark:text-neutral-100">
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
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              {icon}
            </div>
          )}
          {trend && trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-quicksand font-medium",
                trend === "up" && "text-koru-lime",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-neutral-400"
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 17-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </svg>
  );
}

