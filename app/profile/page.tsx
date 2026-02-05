"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { SiFarcaster } from "react-icons/si";
import { usePrivy } from "@privy-io/react-auth";
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
import { VerifiedBadge } from "@/components/discover/verified-badge";
import {
  useAvailability,
  useTransactions,
  useUser,
  useUserChats,
  useUserSummons,
  useUserStats,
  useUsdcBalance,
  useEthBalance,
} from "@/lib/hooks";
import { useContractPendingBalance } from "@/lib/hooks/use-koru-escrow";
import {
  useWalletSync,
  shortenAddress as shortenWalletAddress,
} from "@/lib/hooks/use-wallet-sync";
import type { Address } from "viem";
import type { Chat, Summon } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
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
  BellIcon,
  CreditCardIcon,
  ClockIcon,
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

  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
  } = usePrivy();

  const getWalletAddress = (): string | null => {
    if (!privyUser) return null;
    const walletAccount = privyUser.linkedAccounts?.find(
      (account: { type: string }) => account.type === "wallet",
    );
    if (walletAccount && "address" in walletAccount) {
      return walletAccount.address as string;
    }
    if (privyUser.wallet?.address) {
      return privyUser.wallet.address;
    }
    return null;
  };

  const walletAddress = getWalletAddress();
  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Blockchain balances (wagmi hooks use connected wallet automatically)
  const {
    balance: usdcBalance,
    formatted: usdcFormatted,
    isLoading: isLoadingUsdc,
  } = useUsdcBalance(walletAddress as Address | undefined);

  const {
    balance: ethBalance,
    formatted: ethFormatted,
    isLoading: isLoadingEth,
  } = useEthBalance(walletAddress as Address | undefined);

  // Contract pending/ready balance (read directly from blockchain)
  const {
    pendingFormatted: contractPending,
    readyFormatted: contractReady,
    isLoading: isLoadingContractBalance,
  } = useContractPendingBalance(walletAddress as Address | undefined);

  // Get real user data
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Wallet sync status
  const {
    syncStatus,
    linkedWalletAddress,
    isWalletMismatch,
    isLinking,
    isChanging,
    changeSyncedWallet,
    canChangeSyncedWallet,
    daysUntilChange,
    linkError,
  } = useWalletSync();

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
          <div className="flex flex-col gap-3 mb-3">
            {isLoading ? (
              <ProfileHeaderSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-soft"
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

                <div className="px-6 md:px-8 pb-6 relative">
                  {/* Avatar - positioned to overlap banner */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-14 left-6 md:left-8"
                  >
                    <div
                      className={cn(
                        "w-28 h-28 rounded-2xl overflow-hidden",
                        user?.profileImageUrl
                          ? ""
                          : "border-4 border-white dark:border-neutral-900 shadow-xl bg-white dark:bg-neutral-800",
                      )}
                    >
                      <OptimizedAvatar
                        src={user?.profileImageUrl?.replace(
                          "_normal",
                          "_400x400",
                        )}
                        alt={user?.name || "Profile"}
                        size={112}
                        fallbackSeed={user?.username || "user"}
                      />
                    </div>
                  </motion.div>

                  {/* Content below avatar */}
                  <div className="pt-16">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h1 className="text-2xl md:text-3xl text-neutral-900 dark:text-neutral-100">
                            {user?.name || "User"}
                          </h1>
                          {user?.isVerified && <VerifiedBadge size={20} />}
                          {user?.isCreator && (
                            <Badge className="bg-koru-purple/20 text-koru-purple border-0">
                              Creator
                            </Badge>
                          )}
                        </div>

                        {/* Username & Followers */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <a
                            href={`https://x.com/${user?.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          >
                            <XIcon className="w-4 h-4" />@
                            {user?.username || "username"}
                          </a>
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
                          {user?.createdAt && (
                            <>
                              <span className="text-neutral-300 dark:text-neutral-600">
                                •
                              </span>
                              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                Member since{" "}
                                {new Date(user.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Bio */}
                        {user?.bio && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 max-w-lg">
                            {user.bio}
                          </p>
                        )}

                        {/* Tags - hidden on mobile */}
                        {user?.tags && user.tags.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-2 mb-3">
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
                                    "font-medium",
                                  )}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {/* Website link if exists */}
                        {user?.website && (
                          <div className="mb-3">
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors group"
                            >
                              <LinkIcon className="w-4 h-4" />
                              <span className="group-hover:underline">
                                Website
                              </span>
                            </a>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs border-koru-golden text-koru-golden bg-koru-golden/10"
                          >
                            Early Adopter
                          </Badge>
                        </div>

                        {/* Mobile Response Time & Active Chats - hidden on desktop */}
                        <div className="flex sm:hidden items-center gap-4 text-xs mt-3">
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1.5 rounded-lg">
                            <ClockIcon className="w-3.5 h-3.5 text-koru-lime" />
                            <span>
                              {user?.responseTimeHours || 24}h response
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1.5 rounded-lg">
                            <ChatIcon className="w-3.5 h-3.5 text-koru-golden" />
                            <span>{stats.activeChats} active</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions - hidden on mobile (moved to top) */}
                      <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                        <div className="flex gap-2">
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
                        {/* Response Time & Active Chats */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                            <ClockIcon className="w-4 h-4 text-koru-lime" />
                            <span>
                              {user?.responseTimeHours || 24}h response
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                            <ChatIcon className="w-4 h-4 text-koru-golden" />
                            <span>{stats.activeChats} active chats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons - top right */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2 sm:hidden z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShareProfile}
                      className="h-9 w-9 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                    <Link href="/profile/edit">
                      <Button size="icon" className="h-9 w-9">
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Connection Cards Row - Farcaster & Wallet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Farcaster Card */}
              <AnimatePresence mode="wait">
                {!isFarcasterConnected ? (
                  <motion.div
                    key="farcaster-connect"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.1 }}
                    className="h-full"
                  >
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft overflow-hidden relative h-full">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-100 dark:from-purple-900/20 to-transparent rounded-full opacity-50" />
                      <div className="absolute right-2 top-2 opacity-10">
                        <SiFarcaster className="w-12 h-12 text-purple-600" />
                      </div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shrink-0">
                          <SiFarcaster className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            Connect Farcaster
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            Share casts & earn bonus points
                          </p>
                        </div>
                        <Button
                          onClick={handleConnectFarcaster}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-xs font-medium shrink-0"
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="farcaster-connected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full"
                  >
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20 p-4 flex items-center gap-3 h-full">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <CheckIcon className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                          Farcaster Connected
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          @cryptoexplorer.eth
                        </p>
                      </div>
                      <button
                        onClick={() => setIsFarcasterConnected(false)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                      >
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Wallet Card */}
              <AnimatePresence mode="wait">
                {privyReady && !walletAddress ? (
                  <motion.div
                    key="wallet-connect"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.15 }}
                    className="h-full"
                  >
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft overflow-hidden relative h-full">
                      <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-koru-lime/20 dark:from-koru-lime/10 to-transparent rounded-full opacity-50" />
                      <div className="absolute right-2 top-2 opacity-10">
                        <WalletIcon className="w-12 h-12 text-koru-lime" />
                      </div>

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-koru-lime to-koru-lime/70 flex items-center justify-center shrink-0">
                          <WalletIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            Connect Wallet
                          </h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            Link wallet on Base to unlock features
                          </p>
                        </div>
                        <Button
                          onClick={() => privyLogin()}
                          disabled={!privyReady}
                          size="sm"
                          className="bg-gradient-to-r from-koru-lime to-koru-lime/80 hover:from-koru-lime/90 hover:to-koru-lime/70 text-neutral-900 rounded-lg text-xs font-medium shrink-0"
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : privyReady && walletAddress ? (
                  <motion.div
                    key="wallet-connected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full"
                  >
                    {isWalletMismatch ? (
                      /* Wallet Mismatch Warning */
                      <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-2xl border border-amber-500/30 p-4 h-full">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                              <svg
                                className="w-5 h-5 text-amber-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                                Different Wallet Connected
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                Connected:{" "}
                                <span className="font-mono">
                                  {shortenAddress(walletAddress)}
                                </span>
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                Synced:{" "}
                                <span className="font-mono">
                                  {linkedWalletAddress
                                    ? shortenAddress(linkedWalletAddress)
                                    : "None"}
                                </span>
                              </p>
                            </div>
                          </div>
                          {/* Action buttons */}
                          <div className="flex gap-2">
                            {canChangeSyncedWallet ? (
                              <button
                                onClick={async () => {
                                  const result = await changeSyncedWallet();
                                  if (!result.success && result.error) {
                                    console.error(result.error);
                                  }
                                }}
                                disabled={isChanging}
                                className="flex-1 text-xs px-3 py-2 rounded-lg bg-koru-purple text-white hover:bg-koru-purple/90 transition-all disabled:opacity-50"
                              >
                                {isChanging
                                  ? "Updating..."
                                  : "Change Synced Address"}
                              </button>
                            ) : (
                              <div className="flex-1 text-xs px-3 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-center">
                                Can change in {daysUntilChange} day
                                {daysUntilChange !== 1 ? "s" : ""}
                              </div>
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  await privyLogout();
                                } catch (error) {
                                  console.error(
                                    "Error disconnecting wallet:",
                                    error,
                                  );
                                }
                              }}
                              className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            >
                              Disconnect
                            </button>
                          </div>
                          {linkError && (
                            <p className="text-xs text-red-500">{linkError}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Wallet Connected - Synced */
                      <div className="bg-gradient-to-r from-koru-lime/10 to-koru-lime/5 rounded-2xl border border-koru-lime/20 p-4 flex items-center gap-3 h-full">
                        <div className="w-10 h-10 rounded-xl bg-koru-lime/20 flex items-center justify-center shrink-0">
                          <CheckIcon className="w-5 h-5 text-koru-lime" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                            {isLinking
                              ? "Linking Wallet..."
                              : "Wallet Connected"}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate">
                            {shortenAddress(walletAddress)} • Base
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await privyLogout();
                            } catch (error) {
                              console.error(
                                "Error disconnecting wallet:",
                                error,
                              );
                            }
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {isLoading ? (
            <BalanceCardSkeleton className="mb-8" />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-3"
            >
              {/* Compact Balance Row - stacks on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Wallet Balance */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Wallet
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {walletAddress
                            ? isLoadingUsdc
                              ? "..."
                              : `$${parseFloat(usdcFormatted).toFixed(2)}`
                            : "--"}
                        </span>
                        <span className="text-xs text-koru-purple font-medium">
                          USDC
                        </span>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {walletAddress
                            ? isLoadingEth
                              ? "..."
                              : parseFloat(ethFormatted).toFixed(4)
                            : "--"}
                        </span>
                        <span className="text-xs text-koru-golden font-medium">
                          ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Koru Balance (Escrow) */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                        Koru
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-koru-purple hover:text-koru-purple/80"
                    >
                      Withdraw
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-koru-lime">
                          {walletAddress
                            ? isLoadingContractBalance
                              ? "..."
                              : `$${contractReady}`
                            : "--"}
                        </span>
                        <span className="text-xs text-neutral-500">ready</span>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-semibold text-neutral-500 dark:text-neutral-400">
                          {walletAddress
                            ? isLoadingContractBalance
                              ? "..."
                              : `$${contractPending}`
                            : "--"}
                        </span>
                        <span className="text-xs text-neutral-400">
                          pending
                        </span>
                      </div>
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
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3"
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
            className="mb-3"
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
                        {/* Times - hidden on mobile */}
                        <div className="hidden sm:flex flex-wrap gap-1 max-w-[180px]">
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
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm flex items-center gap-1.5"
              >
                <ChatIcon className="w-4 h-4" />
                Chats ({chats.length})
              </TabsTrigger>
              <TabsTrigger
                value="summons"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm flex items-center gap-1.5"
              >
                <BellIcon className="w-4 h-4" />
                Summons ({createdSummons.length + backedSummons.length})
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm flex items-center gap-1.5"
              >
                <CreditCardIcon className="w-4 h-4" />
                Transactions
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
                                : "text-neutral-400",
                          )}
                        >
                          {chat.status === "active" && chat.deadline_at
                            ? `Due ${new Date(
                                chat.deadline_at,
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
                                  2,
                                )}`,
                                backers: summon.backers_count,
                                status: summon.status,
                                date: new Date(
                                  summon.created_at,
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
                                : "bg-koru-lime/10",
                          )}
                        >
                          {tx.type === "payment" ? (
                            <DollarIcon
                              className={cn(
                                "w-5 h-5",
                                tx.status === "refunded"
                                  ? "text-koru-golden"
                                  : "text-koru-purple",
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
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
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
                                : "text-koru-lime",
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
                      selectedSummon.pledgedAmount.replace(/[^0-9.]/g, ""),
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
