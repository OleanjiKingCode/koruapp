"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  name: string;
  handle: string;
  bio?: string;
  followers?: string;
  categories?: string[];
  initials?: string;
  avatarUrl?: string;
  avatarComponent?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  onView?: () => void;
}

export function ProfileCard({
  name,
  handle,
  bio,
  followers,
  categories = [],
  initials,
  avatarUrl,
  avatarComponent,
  isLoading,
  className,
  onView,
}: ProfileCardProps) {
  if (isLoading) {
    return <ProfileCardSkeleton className={className} />;
  }

  const displayInitials =
    initials ||
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft transition-all duration-300",
        "hover:shadow-xl hover:border-koru-purple/30 dark:hover:border-koru-purple/30",
        className
      )}
    >
      {/* Gold shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 border-2 border-transparent rounded-2xl shimmer-gold" />
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Avatar & Basic Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {avatarComponent ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                {avatarComponent}
              </div>
            ) : avatarUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                <OptimizedAvatar
                  src={avatarUrl}
                  alt={name}
                  size={56}
                  fallbackSeed={handle}
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center border-2 border-koru-purple/30">
                <span className="text-lg   font-medium text-koru-purple">
                  {displayInitials}
                </span>
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg  font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400  truncate">
              @{handle}
            </p>
          </div>

          {/* Followers Badge */}
          {followers && (
            <Badge
              variant="outline"
              className="shrink-0 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
            >
              <UsersIcon className="w-3 h-3 mr-1" />
              {followers}
            </Badge>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400  line-clamp-2">
            {bio}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 3).map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="bg-koru-purple/10 text-koru-purple border-0 text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={onView}
          variant="outline"
          size="sm"
          className="mt-2 group-hover:bg-koru-purple group-hover:text-white group-hover:border-koru-purple transition-all"
        >
          View
          <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}

function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-4 h-10 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
        <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
      </div>
      <div className="mt-4 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export { ProfileCardSkeleton };
