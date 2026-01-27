"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import { ShareModal } from "@/components/share";
import { LoginModal } from "@/components/auth";
import { cn, formatCurrency } from "@/lib/utils";
import { getTagColor, SUMMON_TAGS, API_ROUTES, ROUTES } from "@/lib/constants";
import type { Summon, SummonBacker } from "@/lib/types";

// Extended summon type with additional fields
interface ExtendedSummon extends Summon {
  expiresAt?: string | null;
  status?: string;
  creatorId?: string;
}

// Extended backer type with backed date
interface ExtendedBacker extends SummonBacker {
  backedAt?: string;
}

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

function ShareIcon({ className }: { className?: string }) {
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
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
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

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface SummonDetailClientProps {
  summonId: string;
  initialSummon: ExtendedSummon | null;
}

// Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export function SummonDetailClient({
  summonId,
  initialSummon,
}: SummonDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Use SWR for client-side data with initial server data
  const { data, mutate } = useSWR<{ summon: ExtendedSummon }>(
    `/api/summons/${summonId}`,
    fetcher,
    {
      fallbackData: initialSummon ? { summon: initialSummon } : undefined,
      revalidateOnFocus: false,
    }
  );

  const summon = data?.summon;

  // Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [backModalOpen, setBackModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Back form state
  const [backAmount, setBackAmount] = useState("5");
  const [backSelectedTags, setBackSelectedTags] = useState<string[]>([]);
  const [backError, setBackError] = useState<string | null>(null);
  const [isBackingSubmitting, setIsBackingSubmitting] = useState(false);

  // Check if user has already backed
  const hasUserBacked = () => {
    if (!session?.user?.dbId || !summon?.backersData) return false;
    return summon.backersData.some(
      (backer) => backer.id === session.user.dbId
    );
  };

  const handleBack = () => {
    if (!session?.user?.id) {
      setShowLoginModal(true);
      return;
    }
    setBackAmount("5");
    setBackError(null);
    setBackSelectedTags([]);
    setBackModalOpen(true);
  };

  const handleSubmitBacking = async () => {
    if (!session?.user?.dbId || !summon) {
      setBackError("You must be logged in to back a summon");
      return;
    }

    const amount = parseFloat(backAmount);
    if (isNaN(amount) || amount < 1) {
      setBackError("Amount must be at least $1");
      return;
    }

    if (backSelectedTags.length === 0) {
      setBackError("Please select at least one tag");
      return;
    }

    setIsBackingSubmitting(true);
    setBackError(null);

    try {
      const response = await fetch(API_ROUTES.SUMMONS_BACK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summon_id: summon.id,
          amount: amount,
          tags: backSelectedTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to back summon");
      }

      setBackModalOpen(false);
      mutate(); // Refresh the summon data
    } catch (err) {
      setBackError(
        err instanceof Error ? err.message : "Failed to back summon"
      );
    } finally {
      setIsBackingSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Show 404 if summon not found
  if (!summon) {
    return (
      <div className="min-h-screen pb-96">
        <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
          >
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
              <MegaphoneIcon className="w-12 h-12 text-koru-purple/60" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              Summon Not Found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
              This summon doesn&apos;t exist or may have been removed.
            </p>
            <Link href={ROUTES.SUMMONS}>
              <Button className="bg-koru-purple hover:bg-koru-purple/90">
                View All Summons
              </Button>
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  // Get sorted tags
  const sortedTags = summon.tags
    ? Object.entries(summon.tags)
        .sort(([, a], [, b]) => (b as number) - (a as number))
    : [];

  return (
    <div className="min-h-screen pb-96">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            href={ROUTES.SUMMONS}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-koru-purple transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Summons</span>
          </Link>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-soft"
            >
              {/* Gradient Header */}
              <div className="h-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge
                    className={cn(
                      "text-xs font-medium",
                      summon.status === "active"
                        ? "bg-koru-lime/20 text-koru-lime border-koru-lime/30"
                        : "bg-neutral-200 text-neutral-600"
                    )}
                  >
                    {summon.status === "active" ? "Active" : summon.status}
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="absolute -top-10 left-6">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-white dark:bg-neutral-800">
                    <OptimizedAvatar
                      src={summon.targetProfileImage}
                      alt={summon.targetName}
                      size={80}
                      fallbackSeed={summon.targetHandle}
                    />
                  </div>
                </div>

                <div className="pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                        Summon for
                      </p>
                      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {summon.targetName}
                      </h1>
                      <a
                        href={`https://twitter.com/${summon.targetHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-500 hover:text-koru-purple transition-colors"
                      >
                        <TwitterIcon className="w-4 h-4" />
                        <span>@{summon.targetHandle}</span>
                      </a>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareModalOpen(true)}
                        className="gap-2"
                      >
                        <ShareIcon className="w-4 h-4" />
                        Share
                      </Button>
                      {!hasUserBacked() && (
                        <Button
                          size="sm"
                          onClick={handleBack}
                          className="bg-koru-purple hover:bg-koru-purple/90 gap-2"
                        >
                          <MegaphoneIcon className="w-4 h-4" />
                          Back Summon
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {sortedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {sortedTags.map(([tag, count]) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium",
                            getTagColor(tag)
                          )}
                        >
                          {tag}
                          <span className="ml-1 opacity-60">({count as number})</span>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Request Message */}
                  {summon.request && (
                    <div className="mt-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Request
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                        {summon.request}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Backers List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-koru-purple/10 flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-koru-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Backers
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {summon.backers} {summon.backers === 1 ? "person" : "people"} backing this summon
                  </p>
                </div>
              </div>

              {summon.backersData && summon.backersData.length > 0 ? (
                <div className="space-y-3">
                  {(summon.backersData as ExtendedBacker[]).map((backer, idx) => (
                    <div
                      key={backer.id || idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <OptimizedAvatar
                          src={backer.profileImageUrl}
                          alt={backer.name}
                          size={40}
                          fallbackSeed={backer.username}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {backer.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                          @{backer.username}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-koru-golden">
                          {formatCurrency(backer.amount)}
                        </p>
                        {backer.backedAt && (
                          <p className="text-xs text-neutral-400">
                            {formatTimeAgo(backer.backedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <UsersIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    No backers yet. Be the first to back this summon!
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-2xl bg-koru-golden/5 border border-koru-golden/10">
                  <DollarIcon className="w-6 h-6 text-koru-golden mx-auto mb-2" />
                  <p className="text-2xl font-bold text-koru-golden">
                    {formatCurrency(summon.totalPledged, { compact: true })}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Total Pledged
                  </p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-koru-purple/5 border border-koru-purple/10">
                  <UsersIcon className="w-6 h-6 text-koru-purple mx-auto mb-2" />
                  <p className="text-2xl font-bold text-koru-purple">
                    {summon.backers}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Backers
                  </p>
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                {summon.trend === "up" ? (
                  <TrendUpIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendDownIcon className="w-5 h-5 text-rose-500" />
                )}
                <span
                  className={cn(
                    "font-semibold",
                    summon.trend === "up" ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {summon.trendValue.toFixed(1)}%
                </span>
                <span className="text-sm text-neutral-500">trend</span>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft"
            >
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-4">
                Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500">Created</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDate(summon.createdAt)}
                  </span>
                </div>
                {summon.creatorName && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Created by</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      @{summon.creatorUsername}
                    </span>
                  </div>
                )}
                {summon.expiresAt && (
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Expires</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatDate(summon.expiresAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-500">Status</span>
                  <Badge
                    className={cn(
                      "text-xs font-medium",
                      summon.status === "active"
                        ? "bg-koru-lime/20 text-koru-lime"
                        : "bg-neutral-200 text-neutral-600"
                    )}
                  >
                    {summon.status === "active" ? "Active" : summon.status}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* CTA Card */}
            {!hasUserBacked() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-koru-purple/10 to-koru-golden/10 rounded-3xl border border-koru-purple/20 p-6"
              >
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Want to see @{summon.targetHandle} on Koru?
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Back this summon to show your support and help get their attention!
                </p>
                <Button
                  onClick={handleBack}
                  className="w-full bg-koru-purple hover:bg-koru-purple/90"
                >
                  <MegaphoneIcon className="w-4 h-4 mr-2" />
                  Back This Summon
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        type="summon"
        summon={summon}
      />

      {/* Back Modal */}
      <AnimatePresence>
        {backModalOpen && summon && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setBackModalOpen(false)}
            />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-sm pointer-events-auto"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <OptimizedAvatar
                        src={summon.targetProfileImage}
                        alt={summon.targetName}
                        size={48}
                        fallbackSeed={summon.targetHandle}
                      />
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Back this Summon
                        </h3>
                        <p className="text-sm text-neutral-500">
                          @{summon.targetHandle}
                        </p>
                      </div>
                      <button
                        onClick={() => setBackModalOpen(false)}
                        className="ml-auto p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <CloseIcon className="w-4 h-4 text-neutral-500" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Show existing tags with counts */}
                      {summon.tags && Object.keys(summon.tags).length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                            Community interests
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(summon.tags)
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .map(([tag, count]) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium",
                                    getTagColor(tag)
                                  )}
                                >
                                  {tag}{" "}
                                  <span className="opacity-60">({count as number})</span>
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Tag selection for backer */}
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                          What interests you?
                          {backSelectedTags.length > 0 && (
                            <span className="ml-2 text-koru-purple">
                              ({backSelectedTags.length} selected)
                            </span>
                          )}
                        </label>
                        <div className="max-h-32 overflow-y-auto p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                          <div className="flex flex-wrap gap-1.5">
                            {SUMMON_TAGS.map((tag) => {
                              const isSelected = backSelectedTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setBackSelectedTags(
                                        backSelectedTags.filter((t) => t !== tag)
                                      );
                                    } else {
                                      setBackSelectedTags([
                                        ...backSelectedTags,
                                        tag,
                                      ]);
                                    }
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium transition-all",
                                    isSelected
                                      ? "bg-koru-purple text-white ring-2 ring-koru-purple/30"
                                      : getTagColor(tag) +
                                          " hover:ring-1 hover:ring-koru-purple/20"
                                  )}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                          Your pledge amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                            $
                          </span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={backAmount}
                            onChange={(e) => setBackAmount(e.target.value)}
                            className="w-full h-10 pl-7 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-koru-purple/50"
                          />
                        </div>
                      </div>

                      {backError && (
                        <p className="text-sm text-red-500">{backError}</p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setBackModalOpen(false)}
                          disabled={isBackingSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                          onClick={handleSubmitBacking}
                          disabled={
                            isBackingSubmitting || backSelectedTags.length === 0
                          }
                        >
                          {isBackingSubmitting
                            ? "Backing..."
                            : `Back $${backAmount}`}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        callbackUrl={`/summons/${summonId}`}
        title="Sign in to back"
        description="Connect your X account to back this summon"
      />
    </div>
  );
}
