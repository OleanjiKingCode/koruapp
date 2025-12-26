"use client";

import { cn } from "@/lib/utils";

// Base Skeleton Pulse Component
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700",
        className
      )}
    />
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-9 w-full rounded-xl" />
    </div>
  );
}

// Chat Card Skeleton
export function ChatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-16 ml-auto" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </div>
  );
}

// Appeal Card Skeleton (for list view)
export function AppealCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Skeleton className="w-8 h-8 rounded-full hidden sm:block" />
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-6 w-14 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ className }: { className?: string }) {
  return (
    <tr className={cn("border-b border-neutral-100 dark:border-neutral-800/50", className)}>
      <td className="p-4">
        <Skeleton className="w-8 h-8 rounded-full" />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-14" />
      </td>
      <td className="p-4">
        <Skeleton className="h-8 w-16 rounded-lg" />
      </td>
    </tr>
  );
}

// Profile Header Skeleton (for profile page)
export function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        className
      )}
    >
      {/* Banner */}
      <Skeleton className="h-32 w-full rounded-none" />
      
      <div className="px-6 md:px-8 pb-6 -mt-16 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Avatar */}
          <div className="relative">
            <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-neutral-900" />
            <Skeleton className="absolute -bottom-2 -right-2 w-12 h-6 rounded-full" />
          </div>
          
          {/* Info */}
          <div className="flex-1 pt-4 md:pt-0 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full max-w-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4 md:pt-0">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Balance Card Skeleton
export function BalanceCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Notification Card Skeleton
export function NotificationCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
        className
      )}
    >
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-xs" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
    </div>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ 
  isOwn = false,
  className 
}: { 
  isOwn?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3",
        isOwn ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {!isOwn && <Skeleton className="w-8 h-8 rounded-full shrink-0" />}
      <div className={cn("space-y-2", isOwn ? "items-end" : "items-start")}>
        <Skeleton 
          className={cn(
            "h-16 rounded-2xl",
            isOwn ? "w-48 rounded-br-sm" : "w-56 rounded-bl-sm"
          )} 
        />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Full Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen pb-32">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Treemap Loading Skeleton
export function TreemapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-lg",
        className
      )}
      style={{ aspectRatio: "1 / 1", maxHeight: "700px" }}
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "rounded-sm",
              i === 0 && "col-span-2 row-span-2",
              i === 4 && "col-span-2",
              i === 6 && "row-span-2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export { Skeleton };

