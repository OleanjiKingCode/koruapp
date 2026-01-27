"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedAvatar } from "@/components/ui/optimized-image";
import { cn, formatCurrency } from "@/lib/utils";
import { getTagColor, SUMMON_TAGS, API_ROUTES, ROUTES } from "@/lib/constants";
import type { Summon, SummonBacker } from "@/lib/types";

// Icons
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

function LinkIcon({ className }: { className?: string }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
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

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Extended backer type with backed date
interface ExtendedBacker extends SummonBacker {
  backedAt?: string;
}

interface SummonDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summon: Summon | null;
  onBack: (summon: Summon) => void;
  currentUserId?: string;
}

export function SummonDetailsModal({
  open,
  onOpenChange,
  summon,
  onBack,
  currentUserId,
}: SummonDetailsModalProps) {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!summon) return;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/summons/${summon.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  if (!summon) return null;

  // Check if user has already backed
  const hasUserBacked = () => {
    if (!currentUserId || !summon.backersData) return false;
    return summon.backersData.some((backer) => backer.id === currentUserId);
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
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateString);
  };

  // Get sorted tags
  const sortedTags = summon.tags
    ? Object.entries(summon.tags).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )
    : [];

  const handleViewFullPage = () => {
    onOpenChange(false);
    router.push(`/summons/${summon.id}`);
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
              className="w-full max-w-lg pointer-events-auto my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-koru-purple/20 via-koru-golden/10 to-koru-lime/10 p-6 pb-16">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-neutral-600 dark:text-neutral-400 transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>

                  {/* Stats row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80">
                      <DollarIcon className="w-4 h-4 text-koru-golden" />
                      <span className="font-bold text-koru-golden">
                        {formatCurrency(summon.totalPledged, { compact: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80">
                      <UsersIcon className="w-4 h-4 text-koru-purple" />
                      <span className="font-bold text-koru-purple">
                        {summon.backers}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full",
                        summon.trend === "up"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-rose-500/10 text-rose-500"
                      )}
                    >
                      {summon.trend === "up" ? (
                        <TrendUpIcon className="w-4 h-4" />
                      ) : (
                        <TrendDownIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {summon.trendValue.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Avatar - overlapping header */}
                <div className="px-6 -mt-12 relative">
                  <div className="flex items-end gap-4">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden bg-white dark:bg-neutral-800 flex-shrink-0">
                      <OptimizedAvatar
                        src={summon.targetProfileImage}
                        alt={summon.targetName}
                        size={80}
                        fallbackSeed={summon.targetHandle}
                      />
                    </div>
                    <div className="pb-2">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Summon for
                      </p>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        {summon.targetName}
                      </h2>
                      <a
                        href={`https://twitter.com/${summon.targetHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-koru-purple transition-colors"
                      >
                        <TwitterIcon className="w-3.5 h-3.5" />
                        <span>@{summon.targetHandle}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Tags */}
                  {sortedTags.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Community Interests
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sortedTags.map(([tag, count]) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={cn("text-xs font-medium", getTagColor(tag))}
                          >
                            {tag}
                            <span className="ml-1 opacity-60">
                              ({count as number})
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Message */}
                  {summon.request && (
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Request
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm whitespace-pre-wrap">
                        {summon.request}
                      </p>
                    </div>
                  )}

                  {/* Backers List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Backers ({summon.backers})
                      </p>
                    </div>

                    {summon.backersData && summon.backersData.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(summon.backersData as ExtendedBacker[]).map(
                          (backer, idx) => (
                            <div
                              key={backer.id || idx}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <OptimizedAvatar
                                  src={backer.profileImageUrl}
                                  alt={backer.name}
                                  size={32}
                                  fallbackSeed={backer.username}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                  {backer.name}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                  @{backer.username}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-koru-golden">
                                  {formatCurrency(backer.amount)}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6 text-center">
                        <UsersIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          No backers yet
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>Created {formatTimeAgo(summon.createdAt)}</span>
                    {summon.creatorUsername && (
                      <>
                        <span>·</span>
                        <span>by @{summon.creatorUsername}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 transition-all",
                        linkCopied && "!bg-koru-lime/20 !text-koru-lime !border-koru-lime/30"
                      )}
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <>
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    {!hasUserBacked() ? (
                      <Button
                        className="flex-1 bg-koru-purple hover:bg-koru-purple/90"
                        onClick={() => {
                          onOpenChange(false);
                          onBack(summon);
                        }}
                      >
                        <MegaphoneIcon className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 border-koru-lime/30 text-koru-lime"
                        disabled
                      >
                        Already Backed
                      </Button>
                    )}
                  </div>

                  {/* View Full Page Link */}
                  <button
                    onClick={handleViewFullPage}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-500 hover:text-koru-purple transition-colors"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                    View full page
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SummonDetailsModal;
