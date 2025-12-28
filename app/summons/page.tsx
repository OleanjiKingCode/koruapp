"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import {
  PageHeader,
  EmptyState,
  SummonCardSkeleton,
  TreemapSkeleton,
} from "@/components/shared";
import { ShareModal } from "@/components/share";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn, calculateTreemapLayout, formatCurrency } from "@/lib/utils";
import { CATEGORIES, TIME_FILTERS, API_ROUTES } from "@/lib/constants";
import { MOCK_SUMMONS } from "@/lib/data";
import type { Summon, TreemapRect } from "@/lib/types";
import { useDebouncedTwitterSearch } from "@/lib/hooks/use-twitter-search";
import type { TwitterProfile } from "@/lib/types/twitter";
import {
  PlusIcon,
  SearchIcon,
  DollarIcon,
  GridIcon,
  ListIcon,
  CrownIcon,
  TrendUpIcon,
  TrendDownIcon,
  ShareIcon,
} from "@/components/icons";
import { LoadingSpinner } from "@/components/shared/filter-bar";

type ViewMode = "treemap" | "list";

// Icon components
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

export default function SummonsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTime, setSelectedTime] = useState("24H");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSummon, setSelectedSummon] = useState<Summon | null>(null);

  // Form state
  const [step, setStep] = useState<"info" | "form">("info");
  const [targetSearch, setTargetSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<TwitterProfile | null>(
    null
  );
  const [requestText, setRequestText] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Twitter search with 5 results limit
  const {
    profiles,
    isLoading: isSearching,
    isValidating,
  } = useDebouncedTwitterSearch(targetSearch, {
    type: "People",
    count: 5,
    enabled: targetSearch.length >= 2,
  });

  const isActivelySearching = isSearching || isValidating;
  // Show dropdown when there are search results
  useEffect(() => {
    if (profiles.length > 0 && targetSearch.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [profiles, targetSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShareSummon = (summon: Summon) => {
    setSelectedSummon(summon);
    setShareModalOpen(true);
  };

  const filteredSummons = useMemo(() => {
    return MOCK_SUMMONS.filter(
      (summon) =>
        selectedCategory === "All" || summon.category === selectedCategory
    )
      .filter(
        (summon) =>
          !searchQuery ||
          summon.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summon.targetHandle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.totalPledged - a.totalPledged);
  }, [selectedCategory, searchQuery]);

  const totalPledged = filteredSummons.reduce(
    (sum, a) => sum + a.totalPledged,
    0
  );

  // Reset modal state when it opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setStep("info");
      setTargetSearch("");
      setSelectedProfile(null);
      setRequestText("");
      setPledgeAmount("10");
      setError(null);
      setShowDropdown(false);
    }
  }, [isModalOpen]);

  const handleSelectProfile = (profile: TwitterProfile) => {
    setSelectedProfile(profile);
    // setTargetSearch(profile.username);
    setShowDropdown(false);
  };

  const { data: session } = useSession();

  const handleCreateSummon = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to create a summon");
      return;
    }

    if (!selectedProfile) {
      setError("Please select a user from the search results");
      return;
    }

    if (!requestText.trim()) {
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
          target_twitter_id:
            selectedProfile.twitterId || selectedProfile.username,
          target_username: selectedProfile.username,
          target_name: selectedProfile.name,
          target_profile_image: selectedProfile.profileImageUrl || null,
          message: requestText.trim(),
          pledged_amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create summon");
      }

      const data = await response.json();
      if (data.summon) {
        setIsModalOpen(false);
        // Refresh the page or update the summons list
        window.location.reload();
      } else {
        setError("Failed to create summon. Please try again.");
      }
    } catch (err) {
      console.error("Error creating summon:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <PageHeader
            title="Summons"
            description="Rally the community to get attention from who matters"
          />

          <Button
            size="lg"
            className="w-full sm:w-auto gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Create Summon
          </Button>

          {/* Custom Modal matching profile page style */}
          <AnimatePresence>
            {isModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsModalOpen(false)}
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
                          onClick={() => setIsModalOpen(false)}
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
                                ? "Create a Summon"
                                : selectedProfile
                                ? `Summon ${selectedProfile.name.split(" ")[0]}`
                                : "Create Summon"}
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {selectedProfile
                                ? `@${selectedProfile.username}`
                                : "Rally others to get someone's attention"}
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
                                Create a{" "}
                                <span className="font-semibold text-koru-purple">
                                  Summon
                                </span>{" "}
                                to publicly request a conversation with someone
                                on X (Twitter).
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
                                        Write a message and set how much
                                        you&apos;re willing to pay for their
                                        time
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
                                        More backers = more visibility and
                                        incentive for them to join
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
                                        When they accept, you&apos;ll be first
                                        in line to chat with them
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
                                {/* <Button
                                  variant="ghost"
                                  onClick={() => setIsModalOpen(false)}
                                  className="w-full"
                                >
                                  Maybe Later
                                </Button> */}
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
                                  Who do you want to reach?
                                </label>
                                <div className="relative">
                                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                  <Input
                                    ref={searchInputRef}
                                    value={targetSearch}
                                    onChange={(e) => {
                                      setTargetSearch(e.target.value);
                                      setSelectedProfile(null);
                                    }}
                                    onFocus={() => {
                                      if (profiles.length > 0) {
                                        setShowDropdown(true);
                                      }
                                    }}
                                    placeholder="Search X handle..."
                                    className="pl-10"
                                  />
                                  {isActivelySearching &&
                                    targetSearch.length >= 2 && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <LoadingSpinner className=" w-4 h-4 text-koru-purple" />
                                      </div>
                                    )}
                                  {/* Search Results Dropdown */}
                                  {showDropdown && (
                                    <div
                                      ref={dropdownRef}
                                      className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-80 overflow-y-auto"
                                    >
                                      {isActivelySearching ? (
                                        <div className="p-4 text-center text-sm text-neutral-500">
                                          Searching...
                                        </div>
                                      ) : profiles.length > 0 ? (
                                        profiles.map((profile) => (
                                          <button
                                            key={profile.id}
                                            onClick={() =>
                                              handleSelectProfile(profile)
                                            }
                                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                                          >
                                            <img
                                              src={
                                                profile.profileImageUrl ||
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                                              }
                                              alt={profile.name}
                                              className="w-10 h-10 rounded-full"
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                                  {profile.name}
                                                </p>
                                                {profile.verified && (
                                                  <Badge className="bg-blue-500/20 text-blue-500 border-0 text-xs px-1.5 py-0">
                                                    ✓
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                                @{profile.username}
                                              </p>
                                            </div>
                                          </button>
                                        ))
                                      ) : targetSearch.length >= 2 ? (
                                        <div className="p-4 text-center text-sm text-neutral-500">
                                          No users found
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                                {selectedProfile && (
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-koru-purple/5 border border-koru-purple/20">
                                    <img
                                      src={
                                        selectedProfile.profileImageUrl ||
                                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProfile.username}`
                                      }
                                      alt={selectedProfile.name}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                        {selectedProfile.name}
                                      </p>
                                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        @{selectedProfile.username}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSelectedProfile(null);
                                        setTargetSearch("");
                                      }}
                                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                    >
                                      <CloseIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                  Your Message
                                  {selectedProfile &&
                                    ` to ${selectedProfile.name.split(" ")[0]}`}
                                </label>
                                <textarea
                                  value={requestText}
                                  onChange={(e) =>
                                    setRequestText(e.target.value)
                                  }
                                  placeholder={
                                    selectedProfile
                                      ? `Why do you want to talk to ${
                                          selectedProfile.name.split(" ")[0]
                                        }? What would you like to discuss?`
                                      : "What would you like to discuss?"
                                  }
                                  className="w-full h-28 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-koru-purple/50"
                                />
                                <p className="text-xs text-neutral-500">
                                  This message will be visible to the target and
                                  other backers
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
                                    onChange={(e) =>
                                      setPledgeAmount(e.target.value)
                                    }
                                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-koru-purple/50"
                                  />
                                </div>
                                <p className="text-xs text-neutral-500">
                                  This amount will be held and only charged if
                                  they join and accept
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
                                  disabled={
                                    isSubmitting ||
                                    !selectedProfile ||
                                    !requestText.trim() ||
                                    !pledgeAmount
                                  }
                                  className="w-full bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70 text-white font-semibold disabled:opacity-50"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      Creating...
                                    </>
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
        </div>

        {/* Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm  font-medium transition-all",
                  selectedCategory === cat
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1 ml-auto">
            {TIME_FILTERS.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  "px-3 py-1.5 text-sm  font-medium transition-all",
                  selectedTime === time
                    ? "text-koru-purple"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                )}
              >
                {time}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              onClick={() => setViewMode("treemap")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "treemap"
                  ? "bg-white dark:bg-neutral-700 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-white dark:bg-neutral-700 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Views */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            viewMode === "treemap" ? (
              <TreemapSkeleton key="treemap-skeleton" />
            ) : (
              <motion.div
                key="list-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <SummonCardSkeleton key={i} />
                ))}
              </motion.div>
            )
          ) : viewMode === "treemap" ? (
            <TreemapView
              key="treemap"
              summons={filteredSummons}
              totalPledged={totalPledged}
              onShare={handleShareSummon}
            />
          ) : (
            <ListView
              key="list"
              summons={filteredSummons}
              onShare={handleShareSummon}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Share Modal */}
      {selectedSummon && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          type="summon"
          summon={selectedSummon}
        />
      )}
    </div>
  );
}

// Treemap View Component
function TreemapView({
  summons,
  totalPledged,
  onShare,
}: {
  summons: Summon[];
  totalPledged: number;
  onShare: (summon: Summon) => void;
}) {
  // Calculate treemap layout using imported utility
  const treemapRects = useMemo(() => {
    return calculateTreemapLayout(summons, totalPledged);
  }, [summons, totalPledged]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
      style={{ aspectRatio: "1 / 1", maxHeight: "700px" }}
    >
      {treemapRects.map((rect, index) => {
        const summon = rect.data;
        const isUp = summon.trend === "up";
        const isLarge = rect.percentage > 15;
        const isMedium = rect.percentage > 8;
        const isSmall = rect.percentage > 3;

        return (
          <motion.div
            key={summon.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            whileHover={{ zIndex: 50 }}
            className={cn(
              "absolute cursor-pointer group overflow-hidden",
              "border border-white/20",
              isUp ? "bg-emerald-600" : "bg-rose-600"
            )}
            style={{
              left: `${rect.x}%`,
              top: `${rect.y}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
            }}
          >
            {/* Diagonal gradient overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-30",
                isUp
                  ? "bg-gradient-to-br from-emerald-400 to-transparent"
                  : "bg-gradient-to-br from-rose-400 to-transparent"
              )}
            />

            {/* Sparkline effect for larger cells */}
            {(isLarge || isMedium) && (
              <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-40">
                <svg
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 30"
                >
                  <path
                    d={`M0,20 L10,${15 + (index % 10)} L25,${
                      18 - (index % 8)
                    } L40,${22 - (index % 6)} L55,${14 + (index % 7)} L70,${
                      19 - (index % 5)
                    } L85,${16 + (index % 4)} L100,${18 - (index % 6)}`}
                    fill="none"
                    stroke={isUp ? "#10b981" : "#f43f5e"}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}

            {/* Content */}
            <div className="relative p-2 sm:p-3 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                  {(isLarge || isMedium) && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md overflow-hidden bg-white/20 shrink-0">
                      <AvatarGenerator seed={summon.targetHandle} size={24} />
                    </div>
                  )}
                  <span
                    className={cn(
                      " font-bold text-white uppercase tracking-wide truncate",
                      isLarge
                        ? "text-sm sm:text-base"
                        : isMedium
                        ? "text-xs sm:text-sm"
                        : "text-[10px] sm:text-xs"
                    )}
                  >
                    {isSmall
                      ? summon.targetHandle.toUpperCase()
                      : summon.targetHandle.slice(0, 4).toUpperCase()}
                  </span>
                </div>
                {isLarge && index < 3 && (
                  <CrownIcon
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 shrink-0",
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-300"
                        : "text-amber-600"
                    )}
                  />
                )}
              </div>

              <div className="mt-auto">
                <p
                  className={cn(
                    " font-bold text-white leading-tight",
                    isLarge
                      ? "text-base sm:text-xl"
                      : isMedium
                      ? "text-sm sm:text-lg"
                      : isSmall
                      ? "text-xs sm:text-sm"
                      : "text-[10px]"
                  )}
                >
                  {rect.percentage.toFixed(2)}%
                </p>
                {(isLarge || isMedium) && (
                  <p className="text-[10px] sm:text-xs text-white/70 ">
                    ${(summon.totalPledged / 1000).toFixed(0)}K
                  </p>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
              <div className="text-center text-white">
                <p className=" text-sm sm:text-base mb-0.5 truncate">
                  {summon.targetName}
                </p>
                <p className="text-xs text-white/80  line-clamp-2">
                  {summon.request}
                </p>
                <p className="text-[10px] text-white/60 mt-1">
                  {summon.backers} backers · {rect.percentage.toFixed(2)}%
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(summon);
                  }}
                  className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs  font-medium transition-colors flex items-center gap-1 mx-auto"
                >
                  <ShareIcon className="w-3 h-3" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// List View Component
function ListView({
  summons,
  onShare,
}: {
  summons: Summon[];
  onShare: (summon: Summon) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {summons.map((summon, index) => (
        <motion.div
          key={summon.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-koru-purple/30 dark:hover:border-koru-purple/30 transition-all cursor-pointer group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Rank */}
            <div className="hidden sm:flex items-center justify-center w-8 shrink-0">
              {index < 3 ? (
                <CrownIcon
                  className={cn(
                    "w-6 h-6",
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-400"
                      : "text-amber-600"
                  )}
                />
              ) : (
                <span className="text-sm  text-neutral-400">#{index + 1}</span>
              )}
            </div>

            {/* Avatar */}
            <AvatarGenerator seed={summon.targetHandle} size={48} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className=" font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {summon.targetName}
                </h3>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {summon.category}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                @{summon.targetHandle} · {summon.request}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-lg  text-koru-golden">
                  ${(summon.totalPledged / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-neutral-500">
                  {summon.backers} backers
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-sm ",
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
                {summon.trendValue.toFixed(2)}%
              </div>

              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(summon);
                }}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-koru-golden/10 hover:text-koru-golden text-neutral-500 transition-all"
                title="Share summon"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
