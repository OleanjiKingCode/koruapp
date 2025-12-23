"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "search" | "compass" | "beacon" | "error";
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = "search",
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      {/* Kaya Mascot / Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="mb-6"
      >
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
          <KayaIcon type={icon} className="w-12 h-12 text-koru-purple" />
          
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-full bg-koru-purple/10 blur-xl" />
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-xl font-quicksand font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-neutral-600 dark:text-neutral-400 font-quicksand max-w-sm">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

function KayaIcon({ type, className }: { type: string; className?: string }) {
  // Stylized owl mascot icons
  switch (type) {
    case "search":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle cx="24" cy="26" r="18" fill="currentColor" fillOpacity="0.2" />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path d="M24 28 L22 32 L26 32 Z" fill="currentColor" fillOpacity="0.6" />
          {/* Search magnifier */}
          <circle cx="36" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="40" y1="16" x2="44" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "compass":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle cx="24" cy="26" r="18" fill="currentColor" fillOpacity="0.2" />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="17" cy="23" r="3" fill="currentColor" />
          <circle cx="29" cy="23" r="3" fill="currentColor" />
          {/* Beak */}
          <path d="M24 28 L22 32 L26 32 Z" fill="currentColor" fillOpacity="0.6" />
          {/* Compass */}
          <circle cx="36" cy="12" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M36 7 L36 9 M36 15 L36 17 M31 12 L33 12 M39 12 L41 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M36 12 L38 14 L36 10 L34 14 Z" fill="currentColor" />
        </svg>
      );
    case "beacon":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle cx="24" cy="26" r="18" fill="currentColor" fillOpacity="0.2" />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path d="M24 28 L22 32 L26 32 Z" fill="currentColor" fillOpacity="0.6" />
          {/* Wing holding beacon */}
          <path d="M8 30 Q6 26 10 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Beacon light */}
          <circle cx="8" cy="18" r="4" fill="currentColor" />
          <path d="M4 14 L2 10 M8 14 L8 8 M12 14 L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "error":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle cx="24" cy="26" r="18" fill="currentColor" fillOpacity="0.2" />
          {/* Dizzy eyes */}
          <path d="M15 21 L21 27 M21 21 L15 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M27 21 L33 27 M33 21 L27 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Beak */}
          <path d="M24 30 L22 34 L26 34 Z" fill="currentColor" fillOpacity="0.6" />
          {/* Stars */}
          <circle cx="10" cy="14" r="2" fill="currentColor" fillOpacity="0.5" />
          <circle cx="38" cy="14" r="2" fill="currentColor" fillOpacity="0.5" />
          <circle cx="24" cy="8" r="2" fill="currentColor" fillOpacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}

