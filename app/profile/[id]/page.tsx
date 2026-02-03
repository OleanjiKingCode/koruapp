"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import {
  OptimizedAvatar,
  BackgroundImage,
} from "@/components/ui/optimized-image";
import { BookingModal } from "@/components/booking-modal";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

// Tag color configurations
const TAG_COLORS = [
  {
    bg: "bg-koru-purple/10",
    text: "text-koru-purple",
    border: "border-koru-purple/20",
  },
  {
    bg: "bg-koru-lime/10",
    text: "text-koru-lime",
    border: "border-koru-lime/20",
  },
  {
    bg: "bg-koru-golden/10",
    text: "text-koru-golden",
    border: "border-koru-golden/20",
  },
  { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20" },
  { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
  {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
  },
  {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
  },
];

// Get consistent color for a tag based on its name
function getTagColor(tag: string) {
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

// Helper function to parse bio text and make URLs and @mentions clickable
function ParsedBio({ text }: { text: string }) {
  if (!text) return null;

  // Regex patterns
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const mentionPattern = /@([a-zA-Z0-9_]+)/g;

  // Split text by URLs and mentions, keeping the delimiters
  const parts: { type: "text" | "url" | "mention"; value: string }[] = [];
  let lastIndex = 0;
  const combinedPattern = /(https?:\/\/[^\s]+)|(@[a-zA-Z0-9_]+)/g;
  let match;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    // Determine if it's a URL or mention
    if (match[1]) {
      parts.push({ type: "url", value: match[1] });
    } else if (match[2]) {
      parts.push({ type: "mention", value: match[2] });
    }

    lastIndex = combinedPattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "url") {
          return (
            <a
              key={index}
              href={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-koru-purple hover:underline"
            >
              {part.value}
            </a>
          );
        }
        if (part.type === "mention") {
          const username = part.value.slice(1); // Remove @ symbol
          return (
            <a
              key={index}
              href={`https://x.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-koru-purple hover:underline"
            >
              {part.value}
            </a>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
}
import { API_ROUTES } from "@/lib/constants/routes";
import { useSession } from "next-auth/react";
import type {
  AvailabilityData,
  AvailabilitySlot,
} from "@/components/availability-modal";

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
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

function DollarIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
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
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function ViewProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [summonModalOpen, setSummonModalOpen] = useState(false);

  const handle = params.id as string;

  // Fetcher function for useSWR
  const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data.profile;
  };

  // Fetch profile using useSWR for caching and automatic revalidation
  const {
    data: profileData,
    error,
    isLoading,
    mutate: refreshProfile,
  } = useSWR(handle ? API_ROUTES.PROFILE(handle) : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateOnMount: true, // Always fetch fresh data when navigating to profile
    dedupingInterval: 5000, // Reduced from 60s to 5s to allow more frequent updates
    errorRetryCount: 2,
  });

  // Format follower count to string like "1.2M" or "500K"
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return count.toString();
  };

  // Transform profile data for display
  const profile = useMemo(() => {
    if (!profileData) return null;

    return {
      id: profileData.id || profileData.handle,
      twitterId: profileData.twitterId,
      name: profileData.name,
      handle: profileData.handle,
      bio: profileData.bio || "",
      avatar: profileData.profileImageUrl || "",
      banner: profileData.bannerUrl || "",
      verified: profileData.isVerified || false,
      followers: formatFollowers(profileData.followersCount || 0),
      category: profileData.category,
      // Deduplicate tags by normalizing case (e.g., "AI" and "Ai" become one)
      tags: profileData.tags?.reduce((acc: string[], tag: string) => {
        const normalizedTag = tag.trim();
        const upperTag = normalizedTag.toUpperCase();
        if (!acc.some((t: string) => t.toUpperCase() === upperTag)) {
          acc.push(normalizedTag);
        }
        return acc;
      }, [] as string[]),
      isOnKoru: profileData.isOnKoru,
      // Creator-specific data (only for users on Koru)
      isCreator: profileData.isCreator || false,
      pricePerMessage: profileData.pricePerMessage,
      responseTimeHours: profileData.responseTimeHours,
      availabilitySlots: profileData.availabilitySlots || [],
      walletAddress: profileData.walletAddress || undefined,
    };
  }, [profileData]);

  // Handle error state
  if (error && !isLoading) {
    console.error("Error fetching profile:", error);
    // You could show an error message here or call notFound()
    notFound();
  }

  // Helper: Format date to local ISO string (YYYY-MM-DD)
  const formatLocalDateStr = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper: Parse date string as local date
  const parseLocalDateStr = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper: Normalize date strings to local format
  const normalizeDateStrings = (dates: string[]): string[] => {
    return dates.map((dateStr) => {
      const date = parseLocalDateStr(dateStr);
      return formatLocalDateStr(date);
    });
  };

  // Availability data - use data from API for Koru users
  const availabilityData: AvailabilityData = useMemo(() => {
    // Use availability from API if user is on Koru
    if (profileData?.isOnKoru && profileData?.availability) {
      const availability = profileData.availability;
      // Normalize dates to ensure consistent local format
      return {
        timezone: availability.timezone || "America/New_York",
        slots: (availability.slots || []).map((slot: AvailabilitySlot) => ({
          ...slot,
          selectedDates: slot.selectedDates
            ? normalizeDateStrings(slot.selectedDates)
            : [],
        })),
      };
    }
    // Default empty availability
    return {
      timezone: "America/New_York",
      slots: [],
    };
  }, [profileData]);

  // Show skeleton loading state - after all hooks are called
  if (isLoading) {
    return (
      <div className="min-h-screen pb-[500px] sm:pb-96">
        <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>

          {/* Header Card Skeleton */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 shadow-soft">
            {/* Banner Skeleton */}
            <div className="h-32 sm:h-48 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-pulse" />

            {/* Profile Content Skeleton */}
            <div className="px-4 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                {/* Avatar Skeleton */}
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-700 border-4 border-white dark:border-neutral-900 animate-pulse" />
                  <div className="mb-2 space-y-2">
                    <div className="h-7 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
                {/* Button Skeleton */}
                <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse" />
              </div>

              {/* Bio Skeleton */}
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full max-w-xl bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 max-w-md bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse mb-3" />
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
                <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Availability Card Skeleton */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // If no profile found anywhere, show 404
  if (!profile) {
    notFound();
  }

  const handleBook = async (
    slot: AvailabilitySlot,
    date: Date,
    timeSlot: string,
    receipt: { id: string },
  ) => {
    try {
      // Create the chat in the database
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: profile.handle,
          amount: slot.price,
          slotName: slot.name,
          slotDuration: slot.duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to create chat:", error);
        // Still close the modal, but maybe show an error
        setBookingModalOpen(false);
        return;
      }

      const { chat } = await response.json();
      setBookingModalOpen(false);

      // Navigate to the new chat using the chat ID
      router.push(ROUTES.CHAT(chat.id));
    } catch (error) {
      console.error("Error creating chat:", error);
      setBookingModalOpen(false);
    }
  };

  // User has availability if they have properly configured slots (with name and times)
  const configuredSlots = availabilityData.slots.filter(
    (slot) => slot.name && slot.times.length > 0,
  );
  const hasAvailability = configuredSlots.length > 0;

  // Helper: Parse ISO date string (YYYY-MM-DD) to local Date at midnight
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper: Check if a time slot is in the past for a given date
  const isTimePast = (date: Date, timeStr: string): boolean => {
    const now = new Date();
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let hour24 = hours;
    if (period?.toLowerCase() === "pm" && hours !== 12) {
      hour24 = hours + 12;
    } else if (period?.toLowerCase() === "am" && hours === 12) {
      hour24 = 0;
    }

    const slotDateTime = new Date(date);
    slotDateTime.setHours(hour24, minutes, 0, 0);

    return slotDateTime <= now;
  };

  // Helper: Get available (future) times for a slot on a specific date
  const getAvailableTimes = (
    slot: AvailabilitySlot,
    date: Date | null,
  ): string[] => {
    if (!date || !slot.times) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);

    // If date is in the future (not today), all times are available
    if (selectedDay > today) {
      return slot.times;
    }

    // If date is today, filter out past times
    if (selectedDay.getTime() === today.getTime()) {
      return slot.times.filter((time) => !isTimePast(date, time));
    }

    // Date is in the past, no times available
    return [];
  };

  // Helper: Check if a slot has any future available times
  const slotHasFutureTimes = (slot: AvailabilitySlot): boolean => {
    if (!slot.selectedDates || slot.selectedDates.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of slot.selectedDates) {
      // Parse date string as local date to avoid timezone issues
      const date = parseLocalDate(dateStr);

      // Future date - has available times
      if (date > today) return true;

      // Today - check if any times are still in the future
      if (date.getTime() === today.getTime()) {
        const futureTimes = getAvailableTimes(slot, date);
        if (futureTimes.length > 0) return true;
      }
    }

    return false;
  };

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href={ROUTES.DISCOVER}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-koru-purple transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Discover</span>
          </Link>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 shadow-soft"
        >
          {/* Banner */}
          <div className="h-32 sm:h-48 relative overflow-hidden">
            {profile.banner ? (
              <BackgroundImage
                src={profile.banner}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              </>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 relative">
            {/* Avatar - positioned to overlap banner */}
            <div className="absolute -top-14 left-6">
              <div
                className={cn(
                  "w-28 h-28 rounded-2xl overflow-hidden",
                  // Only show border and background when no profile image
                  profile.avatar
                    ? ""
                    : "border-4 border-white dark:border-neutral-900 shadow-xl bg-white dark:bg-neutral-800",
                )}
              >
                <OptimizedAvatar
                  src={profile.avatar}
                  alt={profile.name}
                  size={112}
                  fallbackSeed={profile.handle}
                />
              </div>
            </div>

            <div className="pt-16 sm:pt-20">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {profile.name}
                    </h1>
                    {profile.verified && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500 border-0"
                      >
                        <svg
                          className="w-3.5 h-3.5 mr-1"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        Verified
                      </Badge>
                    )}
                    {/* Show "Not on Koru" badge for profiles not on Koru */}
                    {profileData && !profileData.isOnKoru && (
                      <Badge
                        variant="secondary"
                        className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-0"
                      >
                        Not yet on Koru
                      </Badge>
                    )}
                  </div>
                  <a
                    href={`https://twitter.com/${profile.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-500 hover:text-koru-purple transition-colors"
                  >
                    <TwitterIcon className="w-4 h-4" />
                    <span>@{profile.handle}</span>
                  </a>
                </div>

                {/* Action Button - Only Talk to button */}
                <div className="hidden items-center gap-3 md:flex">
                  <Button
                    onClick={() => {
                      if (profile.isOnKoru && hasAvailability) {
                        setBookingModalOpen(true);
                      } else {
                        setSummonModalOpen(true);
                      }
                    }}
                    className="bg-koru-purple hover:bg-koru-purple/90 text-white font-semibold px-4 sm:px-8 text-sm sm:text-base"
                  >
                    <ChatIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">
                      Talk to {profile.name.split(" ")[0]}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Bio - with clickable URLs and @mentions */}
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl text-sm  md:text-base">
                <ParsedBio text={profile.bio} />
              </p>

              {/* Categories & Tags - with colors */}
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Show tags */}
                {profile.tags?.map((tag: string) => {
                  const color = getTagColor(tag);
                  return (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={cn(
                        color.bg,
                        color.text,
                        "border",
                        color.border,
                      )}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 md:hidden mt-4 justify-end">
                <Button
                  onClick={() => {
                    if (profile.isOnKoru && hasAvailability) {
                      setBookingModalOpen(true);
                    } else {
                      setSummonModalOpen(true);
                    }
                  }}
                  className="bg-koru-purple hover:bg-koru-purple/90 text-white font-semibold px-4 sm:px-8 text-sm sm:text-base"
                >
                  <ChatIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="">Talk to {profile.name.split(" ")[0]}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            icon={<UsersIcon className="w-5 h-5" />}
            label="Followers"
            value={profile.followers}
            color="purple"
          />
          <StatCard
            icon={<DollarIcon className="w-5 h-5" />}
            label="Min Price"
            value={profile.isOnKoru ? "$0" : "—"}
            color="golden"
          />
          <StatCard
            icon={<ClockIcon className="w-5 h-5" />}
            label="Avg Response"
            value={profile.isOnKoru ? "—" : "—"}
            color="lime"
          />
        </motion.div>

        {/* Availability Card - Only show for users on Koru */}
        {profile.isOnKoru && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-koru-lime/10 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-koru-lime" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Availability
                  </h3>
                </div>
              </div>
            </div>

            {hasAvailability ? (
              <div className="space-y-4">
                {/* Available Slots */}
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                    Available Sessions
                  </p>
                  <div className="space-y-2">
                    {configuredSlots.map((slot) => {
                      const hasFutureTimes = slotHasFutureTimes(slot);
                      return (
                        <div
                          key={slot.id}
                          className={cn(
                            "p-3 rounded-xl border",
                            hasFutureTimes
                              ? "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
                              : "bg-neutral-100 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700 opacity-60",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={cn(
                                "font-medium",
                                hasFutureTimes
                                  ? "text-neutral-900 dark:text-neutral-100"
                                  : "text-neutral-500 dark:text-neutral-400",
                              )}
                            >
                              {slot.name}
                            </span>
                            <span
                              className={cn(
                                "font-semibold",
                                !hasFutureTimes
                                  ? "text-neutral-400 dark:text-neutral-500"
                                  : !slot.price || slot.price === 0
                                    ? "text-koru-lime"
                                    : "text-koru-golden",
                              )}
                            >
                              {!slot.price || slot.price === 0
                                ? "Free"
                                : `$${slot.price}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {slot.duration} min
                              </span>
                              <span>·</span>
                              <span>
                                {slot.times.length} time
                                {slot.times.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {!hasFutureTimes && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                Past Times
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <Button
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full bg-koru-purple hover:bg-koru-purple/90"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Book a Time
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <CalendarIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  This user hasn't set up their availability yet.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Summon Card - Show for users NOT on Koru */}
        {!profile.isOnKoru && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-koru-purple/10 flex items-center justify-center">
                <MegaphoneIcon className="w-7 h-7 text-koru-purple" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Bring {profile.name.split(" ")[0]} to Koru
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {profile.name.split(" ")[0]} isn't on Koru yet. Create a
                  Summon to invite them!
                </p>
              </div>
              <Button
                onClick={() => setSummonModalOpen(true)}
                className="mt-2 bg-koru-purple hover:bg-koru-purple/90"
              >
                <MegaphoneIcon className="w-4 h-4 mr-2" />
                Create Summon
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        personName={profile.name}
        personId={profile.id}
        recipientAddress={profile.walletAddress as `0x${string}` | undefined}
        isRecipientOnKoru={profile.isOnKoru}
        availability={availabilityData}
        onBook={handleBook}
      />

      {/* Summon Modal */}
      <SummonModal
        open={summonModalOpen}
        onOpenChange={setSummonModalOpen}
        personName={profile.name}
        personHandle={profile.handle}
        personImage={profile.avatar}
        onSuccess={() => {
          router.push(ROUTES.SUMMONS);
        }}
      />
    </div>
  );
}

// Not On Koru Modal Component - shown when trying to talk to someone not on the platform
function SummonModal({
  open,
  onOpenChange,
  personName,
  personHandle,
  personImage,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  personHandle: string;
  personImage?: string;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState<"info" | "form">("info");
  const [message, setMessage] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep("info");
      setMessage("");
      setPledgeAmount("10");
      setError(null);
    }
  }, [open]);

  const handleCreateSummon = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to create a summon");
      return;
    }

    if (!message.trim()) {
      setError("Please write a message for your summon");
      return;
    }

    const amount = parseFloat(pledgeAmount);
    if (isNaN(amount) || amount < 1) {
      setError("Pledge amount must be at least $1");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.SUMMONS_CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_twitter_id: personHandle,
          target_username: personHandle,
          target_name: personName,
          target_profile_image: personImage || null,
          message: message.trim(),
          pledged_amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create summon");
      }

      const data = await response.json();
      if (data.summon) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError("Failed to create summon. Please try again.");
      }
    } catch (err) {
      console.error("Error creating summon:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg pointer-events-auto my-8"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-koru-purple/20 via-koru-golden/10 to-koru-purple/20 p-6 pb-8">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-neutral-600 dark:text-neutral-400 transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-koru-purple/20 flex items-center justify-center">
                      <MegaphoneIcon className="w-6 h-6 text-koru-purple" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {step === "info"
                          ? `${personName.split(" ")[0]} isn't on Koru yet`
                          : `Create Summon`}
                      </h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        @{personHandle}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <AnimatePresence mode="wait">
                    {step === "info" ? (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {personName.split(" ")[0]}
                          </span>{" "}
                          hasn&apos;t joined Koru yet. Create a{" "}
                          <span className="font-semibold text-koru-purple">
                            Summon
                          </span>{" "}
                          to publicly request a conversation with them.
                        </p>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            How Summons Work
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-purple/5 border border-koru-purple/10">
                              <div className="w-6 h-6 rounded-full bg-koru-purple/20 flex items-center justify-center text-xs font-bold text-koru-purple shrink-0">
                                1
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  Create Your Summon
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Write a message and set how much you&apos;re
                                  willing to pay for their time
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-golden/5 border border-koru-golden/10">
                              <div className="w-6 h-6 rounded-full bg-koru-golden/20 flex items-center justify-center text-xs font-bold text-koru-golden shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  Others Can Back Your Summon
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  More backers = more visibility and incentive
                                  for them to join
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-koru-lime/5 border border-koru-lime/10">
                              <div className="w-6 h-6 rounded-full bg-koru-lime/20 flex items-center justify-center text-xs font-bold text-koru-lime shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  They Join & You Connect
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  When they accept, you&apos;ll be first in line
                                  to chat with them
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                          <Button
                            onClick={() => setStep("form")}
                            className="w-full bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70 text-white font-semibold"
                          >
                            <MegaphoneIcon className="w-4 h-4 mr-2" />
                            Continue to Create Summon
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="w-full"
                          >
                            Maybe Later
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Your Message to {personName.split(" ")[0]}
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Why do you want to talk to ${
                              personName.split(" ")[0]
                            }? What would you like to discuss?`}
                            className="w-full h-28 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-koru-purple/50"
                          />
                          <p className="text-xs text-neutral-500">
                            This message will be visible to{" "}
                            {personName.split(" ")[0]} and other backers
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Your Pledge Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                              $
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={pledgeAmount}
                              onChange={(e) => setPledgeAmount(e.target.value)}
                              className="w-full h-12 pl-8 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-koru-purple/50"
                            />
                          </div>
                          <p className="text-xs text-neutral-500">
                            This amount will be held and only charged if{" "}
                            {personName.split(" ")[0]} joins and accepts
                          </p>
                        </div>
                        {error && (
                          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {error}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-3 pt-2">
                          <Button
                            onClick={handleCreateSummon}
                            disabled={isSubmitting || !session?.user}
                            className="w-full bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70 text-white font-semibold disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Creating...
                              </>
                            ) : !session?.user ? (
                              "Sign in to Create Summon"
                            ) : (
                              <>
                                <MegaphoneIcon className="w-4 h-4 mr-2" />
                                Create Summon (${pledgeAmount})
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setStep("info")}
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            Back
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "golden" | "lime";
}) {
  const colorClasses = {
    purple: "bg-koru-purple/10 text-koru-purple",
    golden: "bg-koru-golden/10 text-koru-golden",
    lime: "bg-koru-lime/10 text-koru-lime",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          colorClasses[color],
        )}
      >
        {icon}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}
