"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";

interface SuggestedProfile {
  id: string;
  name: string;
  handle: string;
  category?: string;
  profileImageUrl?: string | null;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?:
    | "search"
    | "compass"
    | "beacon"
    | "error"
    | "chat"
    | "inbox"
    | "wallet";
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "compact" | "card";
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  suggestedProfiles?: SuggestedProfile[];
}

export function EmptyState({
  title,
  description,
  icon = "search",
  action,
  className,
  variant = "default",
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  suggestedProfiles,
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex flex-col items-center justify-center py-8 px-4 text-center",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center mb-3">
          <KayaIcon type={icon} className="w-6 h-6 text-koru-purple" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8",
          className
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center mb-4">
            <KayaIcon type={icon} className="w-10 h-10 text-koru-purple" />
            <div className="absolute inset-0 rounded-full bg-koru-purple/10 blur-xl" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-neutral-600 dark:text-neutral-400 max-w-sm mb-4">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(ctaText || action) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              {ctaHref && ctaText ? (
                <Link href={ctaHref}>
                  <Button className="bg-koru-purple hover:bg-koru-purple/90">
                    {ctaText}
                  </Button>
                </Link>
              ) : (
                action
              )}
              {secondaryCtaHref && secondaryCtaText && (
                <Link href={secondaryCtaHref}>
                  <Button variant="outline">{secondaryCtaText}</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

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
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-neutral-600 dark:text-neutral-400 max-w-sm">
          {description}
        </p>
      )}

      {/* CTA Buttons */}
      {(ctaText || action) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {ctaHref && ctaText ? (
            <Link href={ctaHref}>
              <Button className="bg-koru-purple hover:bg-koru-purple/90">
                {ctaText}
              </Button>
            </Link>
          ) : (
            action
          )}
          {secondaryCtaHref && secondaryCtaText && (
            <Link href={secondaryCtaHref}>
              <Button variant="outline">{secondaryCtaText}</Button>
            </Link>
          )}
        </div>
      )}

      {/* Suggested Profiles - only shown if provided */}
      {suggestedProfiles && suggestedProfiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 w-full max-w-md"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Popular profiles to start with
          </p>
          <div className="space-y-2">
            {suggestedProfiles.slice(0, 3).map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link href={`/profile/${profile.handle}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator seed={profile.handle} size={40} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-koru-purple transition-colors">
                        {profile.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        @{profile.handle}
                      </p>
                    </div>
                    {profile.category && (
                      <span className="text-xs px-2 py-1 rounded-full bg-koru-purple/10 text-koru-purple">
                        {profile.category}
                      </span>
                    )}
                    <ChevronRightIcon className="w-4 h-4 text-neutral-400 group-hover:text-koru-purple group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
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

function KayaIcon({ type, className }: { type: string; className?: string }) {
  // Stylized owl mascot icons
  switch (type) {
    case "search":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Search magnifier */}
          <circle
            cx="36"
            cy="12"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="40"
            y1="16"
            x2="44"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "compass":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="17" cy="23" r="3" fill="currentColor" />
          <circle cx="29" cy="23" r="3" fill="currentColor" />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Compass */}
          <circle
            cx="36"
            cy="12"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M36 7 L36 9 M36 15 L36 17 M31 12 L33 12 M39 12 L41 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M36 12 L38 14 L36 10 L34 14 Z" fill="currentColor" />
        </svg>
      );
    case "beacon":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Wing holding beacon */}
          <path
            d="M8 30 Q6 26 10 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Beacon light */}
          <circle cx="8" cy="18" r="4" fill="currentColor" />
          <path
            d="M4 14 L2 10 M8 14 L8 8 M12 14 L14 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chat":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Chat bubble */}
          <path
            d="M34 6 L44 6 Q46 6 46 8 L46 16 Q46 18 44 18 L38 18 L36 22 L36 18 L34 18 Q32 18 32 16 L32 8 Q32 6 34 6 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
          <circle cx="36" cy="12" r="1" fill="currentColor" />
          <circle cx="40" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case "inbox":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes - happy/closed */}
          <path
            d="M14 24 Q18 20 22 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M26 24 Q30 20 34 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Inbox tray */}
          <rect
            x="32"
            y="6"
            width="14"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M32 12 L36 12 L38 15 L40 12 L46 12"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      );
    case "wallet":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Eyes */}
          <circle cx="18" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.3" />
          <circle cx="18" cy="24" r="3" fill="currentColor" />
          <circle cx="30" cy="24" r="3" fill="currentColor" />
          {/* Beak */}
          <path
            d="M24 28 L22 32 L26 32 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          {/* Wallet */}
          <rect
            x="32"
            y="8"
            width="12"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="40" cy="13" r="2" fill="currentColor" />
        </svg>
      );
    case "error":
      return (
        <svg className={className} viewBox="0 0 48 48" fill="none">
          {/* Owl body */}
          <circle
            cx="24"
            cy="26"
            r="18"
            fill="currentColor"
            fillOpacity="0.2"
          />
          {/* Dizzy eyes */}
          <path
            d="M15 21 L21 27 M21 21 L15 27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M27 21 L33 27 M33 21 L27 27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Beak */}
          <path
            d="M24 30 L22 34 L26 34 Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
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
