"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { SiFarcaster } from "react-icons/si";
import {
  PageHeader,
  StatCard,
  StatusPill,
  EmptyState,
  ProfileHeaderSkeleton,
  BalanceCardSkeleton,
  StatCardSkeleton,
  ChatCardSkeleton,
} from "@/components/shared";
import { ShareModal } from "@/components/share";
import {
  AvailabilityModal,
  TIMEZONES,
  DURATION_OPTIONS,
} from "@/components/availability-modal";
import { AuthGuard } from "@/components/auth";
import {
  useAvailability,
  useTransactions,
  useUser,
  useUserChats,
  useUserSummons,
  useUserStats,
} from "@/lib/hooks";
import type { Chat, Summon } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ShareIcon,
  EditIcon,
  DollarIcon,
  RefundIcon,
  ChatIcon,
  BeaconIcon,
  TwitterIcon,
  ChevronRightIcon,
  LinkIcon,
} from "@/components/icons";

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

// Link Icon (for website)
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

// Wallet Icon
function WalletIcon({ className }: { className?: string }) {
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
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

// Coins Icon (for in-app balance)
function CoinsIcon({ className }: { className?: string }) {
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
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

// Calendar Icon
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

// Clock Icon
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

// X Icon (for showing linked X account)
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("chats");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareType, setShareType] = useState<"profile" | "summon">("profile");
  const [selectedSummon, setSelectedSummon] = useState<{
    id: string;
    targetHandle: string;
    targetName: string;
    pledgedAmount: string;
    backers: number;
    status: string;
    date: string;
  } | null>(null);
  const [isFarcasterConnected, setIsFarcasterConnected] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Get real user data
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Get real profile data
  const { chats, isLoading: isLoadingChats } = useUserChats();
  const {
    createdSummons,
    backedSummons,
    isLoading: isLoadingSummons,
  } = useUserSummons();
  const { stats, isLoading: isLoadingStats } = useUserStats();

  // Loading state combines user loading and initial animation
  useEffect(() => {
    if (!isUserLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isUserLoading]);

  // Availability
  const { availability, setAvailability, filledSlots, hasAvailability } =
    useAvailability();

  // Transactions
  const { transactions } = useTransactions();

  const selectedTimezone =
    TIMEZONES.find((tz) => tz.value === availability.timezone) || TIMEZONES[0];

  const handleShareProfile = () => {
    setShareType("profile");
    setShareModalOpen(true);
  };

  const handleShareSummon = (summon: typeof selectedSummon) => {
    setSelectedSummon(summon);
    setShareType("summon");
    setShareModalOpen(true);
  };

  const handleConnectFarcaster = () => {
    // Simulate Farcaster connection flow
    setIsFarcasterConnected(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-[500px] sm:pb-96">
        <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
          {/* Profile Header Card */}
          {isLoading ? (
            <ProfileHeaderSkeleton className="mb-8" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 shadow-soft"
            >
              {/* Banner */}
              <div className="h-32 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

                {/* Kaya Sideways - Background Decoration in Banner Only */}
                <div className="absolute -right-24 -top-16 pointer-events-none select-none">
                  <Image
                    src="/kayaSideWays.png"
                    alt=""
                    width={350}
                    height={350}
                    className="object-contain opacity-20 -scale-x-100"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 -mt-16 relative">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-white dark:bg-neutral-800">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl.replace(
                            "_normal",
                            "_400x400"
                          )}
                          alt={user.name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator
                          seed={user?.username || "user"}
                          size={128}
                        />
                      )}
                    </div>
                    {/* Verified Badge */}
                    {user?.isVerified && (
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 pt-4 md:pt-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h1 className="text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
                        {user?.name || "User"}
                      </h1>
                      {user?.isVerified && (
                        <Badge className="bg-blue-500/20 text-blue-500 border-0">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {user?.isCreator && (
                        <Badge className="bg-koru-purple/20 text-koru-purple border-0">
                          Creator
                        </Badge>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">
                        @{user?.username || "username"}
                      </span>
                      {user?.followersCount ? (
                        <>
                          <span className="text-neutral-300 dark:text-neutral-600">
                            •
                          </span>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {user.followersCount.toLocaleString()} followers
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Bio */}
                    {user?.bio && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 max-w-lg">
                        {user.bio}
                      </p>
                    )}

                    {/* Tags */}
                    {user?.tags && user.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {user.tags.map((tag: string) => {
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
                                "font-medium"
                              )}
                            >
                              {tag}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    {/* Links row */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <a
                        href={`https://x.com/${user?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                      >
                        <XIcon className="w-4 h-4" />
                        <span className="group-hover:underline">
                          @{user?.username}
                        </span>
                      </a>
                      {(user as any)?.website && (
                        <a
                          href={(user as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span className="group-hover:underline">Website</span>
                        </a>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {user?.isCreator && (
                        <Badge
                          variant="outline"
                          className="text-xs border-koru-purple text-koru-purple bg-koru-purple/10"
                        >
                          Creator
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs border-koru-golden text-koru-golden bg-koru-golden/10"
                      >
                        Early Adopter
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 md:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareProfile}
                    >
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Link href="/profile/edit">
                      <Button size="sm">
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Member Since */}
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
                  {user?.createdAt &&
                    `Member since ${new Date(user.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}`}
                </p>
              </div>
            </motion.div>
          )}

          {/* Connect Farcaster Card */}
          <AnimatePresence>
            {!isFarcasterConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft overflow-hidden relative">
                  {/* Farcaster branding background */}
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-purple-100 dark:from-purple-900/20 to-transparent rounded-full opacity-50" />
                  <div className="absolute right-2 top-2 opacity-10">
                    <SiFarcaster className="w-20 h-20 text-purple-600" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shrink-0">
                        <SiFarcaster className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="  font-bold text-neutral-900 dark:text-neutral-100">
                          Connect your Farcaster account
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Expand your reach, share casts, and earn bonus points!
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleConnectFarcaster}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl   font-semibold group shrink-0"
                    >
                      <SiFarcaster className="w-4 h-4 mr-2" />
                      Connect Farcaster
                      <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Farcaster Connected Success Banner */}
          <AnimatePresence>
            {isFarcasterConnected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <CheckIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="  font-semibold text-neutral-900 dark:text-neutral-100">
                        Farcaster Connected
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        @cryptoexplorer.eth • Cast your profile anytime!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFarcasterConnected(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wallet Balances Card */}
          {isLoading ? (
            <BalanceCardSkeleton className="mb-8" />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="  text-lg text-neutral-900 dark:text-neutral-100">
                    💳 Balances
                  </h3>
                  <Button variant="outline" size="sm" className="text-xs">
                    Withdraw
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Available Balance (Withdrawable) */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-koru-purple/10 via-koru-purple/5 to-transparent border border-koru-purple/20 p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-koru-purple/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <WalletIcon className="w-5 h-5 text-koru-purple" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400  ">
                          Available Balance
                        </span>
                      </div>
                      <p className="text-3xl   text-neutral-900 dark:text-neutral-100">
                        ${(user?.balance || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Ready to withdraw
                      </p>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-koru-golden/10 via-koru-golden/5 to-transparent border border-koru-golden/20 p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-koru-golden/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <CoinsIcon className="w-5 h-5 text-koru-golden" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400  ">
                          Total Earnings
                        </span>
                      </div>
                      <p className="text-3xl   text-neutral-900 dark:text-neutral-100">
                        ${(user?.totalEarnings || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {user?.isCreator
                          ? "From sessions"
                          : "Start earning as a creator"}
                      </p>
                      {(user?.pendingBalance || 0) > 0 && (
                        <p className="text-xs text-koru-golden mt-2  ">
                          💰 ${(user?.pendingBalance || 0).toFixed(2)} pending
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {isLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </>
            ) : (
              <>
                <StatCard
                  title="Followers"
                  value={user?.followersCount?.toLocaleString() || "0"}
                  icon={<DollarIcon className="w-5 h-5" />}
                  variant="purple"
                />
                <StatCard
                  title="Following"
                  value={user?.followingCount?.toLocaleString() || "0"}
                  icon={<RefundIcon className="w-5 h-5" />}
                />
                <StatCard
                  title="Active Chats"
                  value={stats.activeChats.toString()}
                  icon={<ChatIcon className="w-5 h-5" />}
                  variant="golden"
                />
                <StatCard
                  title="Response Time"
                  value={`${user?.responseTimeHours || 24}h`}
                  icon={<BeaconIcon className="w-5 h-5" />}
                  variant="lime"
                />
              </>
            )}
          </motion.div>

          {/* Availability Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-koru-lime/10 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-koru-lime" />
                  </div>
                  <div>
                    <h3 className="text-lg text-neutral-900 dark:text-neutral-100">
                      Availability
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {selectedTimezone.label} ({selectedTimezone.offset})
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="text-xs bg-koru-purple text-white hover:bg-koru-purple/90"
                  onClick={() => setScheduleModalOpen(true)}
                >
                  {hasAvailability ? "Edit times" : "Set your available times"}
                </Button>
              </div>

              {/* Configured Slots */}
              {hasAvailability ? (
                <div className="space-y-3">
                  {filledSlots.map((slot) => {
                    const durationLabel =
                      DURATION_OPTIONS.find((d) => d.value === slot.duration)
                        ?.label || `${slot.duration} min`;
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-koru-lime/5 border border-koru-lime/20"
                      >
                        <div className="w-8 h-8 rounded-full bg-koru-lime/20 flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-koru-lime" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {slot.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {durationLabel} · {slot.times.length} time slot
                            {slot.times.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {slot.times.slice(0, 3).map((time) => (
                            <span
                              key={time}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            >
                              {time}
                            </span>
                          ))}
                          {slot.times.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              +{slot.times.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                  <ClockIcon className="w-5 h-5 text-neutral-400" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No availability set yet. Click &quot;Set your available
                    times&quot; to get started.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="chats"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                💬 Chats ({chats.length})
              </TabsTrigger>
              <TabsTrigger
                value="summons"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                🔔 Summons ({createdSummons.length + backedSummons.length})
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                💳 Transactions
              </TabsTrigger>
            </TabsList>

            {/* Chats Tab */}
            <TabsContent value="chats" className="space-y-4">
              {isLoadingChats ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <ChatCardSkeleton key={i} />
                  ))}
                </>
              ) : chats.length > 0 ? (
                chats.map((chat: Chat, index: number) => (
                  <motion.a
                    href={`/chat/${chat.id}`}
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all cursor-pointer group hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
                          <ChatIcon className="w-5 h-5 text-koru-purple" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="  font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-koru-purple transition-colors">
                              {chat.slot_name || "Chat Session"}
                            </h3>
                            <StatusPill status={chat.status} />
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {chat.slot_duration
                              ? `${chat.slot_duration} min`
                              : "Chat"}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right shrink-0">
                        <p className="  font-semibold text-neutral-900 dark:text-neutral-100">
                          ${chat.amount.toFixed(2)}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            chat.status === "active"
                              ? "text-koru-golden"
                              : chat.status === "completed"
                              ? "text-koru-lime"
                              : "text-neutral-400"
                          )}
                        >
                          {chat.status === "active" && chat.deadline_at
                            ? `Due ${new Date(
                                chat.deadline_at
                              ).toLocaleDateString()}`
                            : chat.status.charAt(0).toUpperCase() +
                              chat.status.slice(1)}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                      Created {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </motion.a>
                ))
              ) : (
                <EmptyState
                  icon="search"
                  title="No chats yet"
                  description="Start a conversation by finding someone on the Discover page."
                />
              )}
            </TabsContent>

            {/* Summons Tab */}
            <TabsContent value="summons" className="space-y-4">
              {isLoadingSummons ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-2xl h-24"
                    />
                  ))}
                </>
              ) : createdSummons.length > 0 || backedSummons.length > 0 ? (
                <>
                  {/* Created Summons */}
                  {createdSummons.map((summon: Summon, index: number) => (
                    <motion.div
                      key={summon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-golden/30 dark:hover:border-koru-golden/30 transition-all group hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-golden/20 to-koru-lime/20 flex items-center justify-center">
                            <BeaconIcon className="w-5 h-5 text-koru-golden" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="  font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-koru-golden transition-colors">
                                @{summon.target_username}
                              </h3>
                              <StatusPill status={summon.status} />
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {summon.target_name}
                            </p>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-3">
                          <div className="text-right shrink-0">
                            <p className="  font-semibold text-koru-golden">
                              ${summon.pledged_amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {summon.backers_count} backers
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareSummon({
                                id: summon.id,
                                targetHandle: summon.target_username,
                                targetName: summon.target_name,
                                pledgedAmount: `$${summon.pledged_amount.toFixed(
                                  2
                                )}`,
                                backers: summon.backers_count,
                                status: summon.status,
                                date: new Date(
                                  summon.created_at
                                ).toLocaleDateString(),
                              });
                            }}
                            className="text-neutral-400 hover:text-koru-golden"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Date */}
                      <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                        Created{" "}
                        {new Date(summon.created_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}

                  {/* Backed Summons */}
                  {backedSummons.length > 0 && (
                    <>
                      <div className="pt-4 pb-2">
                        <h4 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          Summons You Backed
                        </h4>
                      </div>
                      {backedSummons.map((summon: Summon, index: number) => (
                        <motion.div
                          key={summon.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all group hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
                                <BeaconIcon className="w-5 h-5 text-koru-purple" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="  font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-koru-purple transition-colors">
                                    @{summon.target_username}
                                  </h3>
                                  <StatusPill status={summon.status} />
                                  <Badge className="bg-koru-purple/10 text-koru-purple border-0 text-xs">
                                    Backed
                                  </Badge>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {summon.target_name}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="  font-semibold text-koru-golden">
                                ${summon.pledged_amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {summon.backers_count} backers
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <EmptyState
                  icon="beacon"
                  title="No summons yet"
                  description="Create a summon to attract attention to someone you want to reach."
                />
              )}
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            tx.type === "payment"
                              ? "bg-koru-purple/10"
                              : tx.type === "refund"
                              ? "bg-koru-golden/10"
                              : "bg-koru-lime/10"
                          )}
                        >
                          {tx.type === "payment" ? (
                            <DollarIcon
                              className={cn(
                                "w-5 h-5",
                                tx.status === "refunded"
                                  ? "text-koru-golden"
                                  : "text-koru-purple"
                              )}
                            />
                          ) : tx.type === "refund" ? (
                            <RefundIcon className="w-5 h-5 text-koru-golden" />
                          ) : (
                            <DollarIcon className="w-5 h-5 text-koru-lime" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {tx.type === "payment"
                                ? `Payment to ${tx.personName}`
                                : tx.type === "refund"
                                ? "Refunded"
                                : "Withdrawal"}
                            </h3>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                tx.status === "completed"
                                  ? "bg-koru-lime/10 text-koru-lime"
                                  : tx.status === "refunded"
                                  ? "bg-koru-golden/10 text-koru-golden"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                              )}
                            >
                              {tx.status === "completed"
                                ? "Completed"
                                : tx.status === "refunded"
                                ? "Refunded"
                                : "Pending"}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {tx.slotName} · {tx.date}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "font-semibold",
                            tx.type === "refund"
                              ? "text-koru-golden"
                              : tx.type === "payment"
                              ? "text-neutral-900 dark:text-neutral-100"
                              : "text-koru-lime"
                          )}
                        >
                          {tx.type === "refund" ? "+" : "-"}$
                          {tx.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-neutral-400 font-mono">
                          {tx.receiptId}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon="search"
                  title="No transactions yet"
                  description="Your payment history will appear here when you book sessions."
                />
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Availability Modal */}
        <AvailabilityModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          initialData={availability}
          onSave={setAvailability}
        />

        {/* Share Modal */}
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          type={shareType}
          userData={{
            displayName: user?.name || "User",
            username: user?.username || "user",
            twitterHandle: user?.username || "user",
            bio: user?.bio || "",
            address: user?.twitterId || "",
            shortAddress: user?.twitterId?.slice(0, 8) || "",
            level: "Lv. 1",
            points: 0,
            badges: user?.isVerified ? ["Verified"] : [],
            website: "",
            joinDate: user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "2024",
            walletBalance: {
              onChain: `$${(user?.balance || 0).toFixed(2)}`,
              onChainUSD: `$${(user?.balance || 0).toFixed(2)}`,
              inApp: `$${(user?.pendingBalance || 0).toFixed(2)}`,
              inAppUSD: `$${(user?.pendingBalance || 0).toFixed(2)}`,
            },
            stats: {
              totalSpent: `$${(user?.totalEarnings || 0).toFixed(2)}`,
              totalRefunded: "$0",
              activeChats: stats.activeChats,
              appealsCreated: stats.totalSummons,
            },
          }}
          summon={
            selectedSummon
              ? {
                  id: selectedSummon.id,
                  targetHandle: selectedSummon.targetHandle,
                  targetName: selectedSummon.targetName,
                  totalPledged:
                    parseFloat(
                      selectedSummon.pledgedAmount.replace(/[^0-9.]/g, "")
                    ) || 0,
                  backers: selectedSummon.backers,
                  category: "Summon",
                  trend: "up" as const,
                  trendValue: 0,
                  request: "",
                  createdAt: selectedSummon.date,
                }
              : undefined
          }
        />
      </div>
    </AuthGuard>
  );
}
