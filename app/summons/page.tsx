"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  PageHeader,
  EmptyState,
  SummonCardSkeleton,
  TreemapSkeleton,
} from "@/components/shared";
import { ShareModal } from "@/components/share";
import { LoginModal } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn, calculateTreemapLayout, formatCurrency } from "@/lib/utils";
import {
  CATEGORIES,
  TIME_FILTERS,
  API_ROUTES,
  SUMMON_TAGS,
  getTagColor,
} from "@/lib/constants";
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
  const [selectedTime, setSelectedTime] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<
    "totalPledged" | "backers" | "createdAt"
  >("totalPledged");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch summons from API
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch");
    }
    return res.json();
  };

  const {
    data,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR<{
    summons: Summon[];
  }>(
    `/api/summons?category=${selectedCategory}&search=${searchQuery}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const allSummons = data?.summons || [];

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSummon, setSelectedSummon] = useState<Summon | null>(null);

  // Back modal state
  const [backModalOpen, setBackModalOpen] = useState(false);
  const [summonToBack, setSummonToBack] = useState<Summon | null>(null);
  const [backAmount, setBackAmount] = useState("5");
  const [isBackingSubmitting, setIsBackingSubmitting] = useState(false);
  const [backError, setBackError] = useState<string | null>(null);

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Form state
  const [step, setStep] = useState<"info" | "form">("info");
  const [targetSearch, setTargetSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<TwitterProfile | null>(
    null
  );
  const [requestText, setRequestText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pledgeAmount, setPledgeAmount] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Back modal tags state
  const [backSelectedTags, setBackSelectedTags] = useState<string[]>([]);
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

  const handleBackSummon = (summon: Summon) => {
    if (!session?.user?.id) {
      setShowLoginModal(true);
      return;
    }
    setSummonToBack(summon);
    setBackAmount("5");
    setBackError(null);
    setBackSelectedTags([]);
    setBackModalOpen(true);
  };

  const handleSubmitBacking = async () => {
    if (!session?.user?.dbId || !summonToBack) {
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
          summon_id: summonToBack.id,
          amount: amount,
          tags: backSelectedTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to back summon");
      }

      setBackModalOpen(false);
      mutate(); // Refresh the summons list
    } catch (err) {
      setBackError(
        err instanceof Error ? err.message : "Failed to back summon"
      );
    } finally {
      setIsBackingSubmitting(false);
    }
  };

  // Helper function to get time filter cutoff date
  const getTimeFilterCutoff = (timeFilter: string): Date | null => {
    const now = new Date();
    switch (timeFilter) {
      case "24H":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "48H":
        return new Date(now.getTime() - 48 * 60 * 60 * 1000);
      case "7D":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30D":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "3M":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "6M":
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case "12M":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case "All":
      default:
        return null; // No filter
    }
  };

  const filteredSummons = useMemo(() => {
    // Filter by time first
    const cutoffDate = getTimeFilterCutoff(selectedTime);
    let filtered = allSummons;

    if (cutoffDate) {
      filtered = allSummons.filter((summon) => {
        const createdAt = new Date(summon.createdAt);
        return createdAt >= cutoffDate;
      });
    }

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case "backers":
          aVal = a.backers;
          bVal = b.backers;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "totalPledged":
        default:
          aVal = a.totalPledged;
          bVal = b.totalPledged;
          break;
      }
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  }, [allSummons, sortBy, sortDirection, selectedTime]);

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
      setSelectedTags([]);
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

    if (selectedTags.length === 0) {
      setError("Please select at least one tag for your summon");
      return;
    }

    const amount = parseFloat(pledgeAmount);
    if (isNaN(amount) || amount < 1) {
      setError("Pledge amount must be at least $1");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Convert selected tags to counts object (each tag starts with count of 1)
    const tagsObject: Record<string, number> = {};
    selectedTags.forEach((tag) => {
      tagsObject[tag] = 1;
    });

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
          message: requestText.trim() || selectedTags.join(", "), // fallback message
          tags: tagsObject,
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
        // Refresh the summons list
        mutate();
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
    <div className="min-h-[100vh] pb-[500px] sm:pb-96">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <PageHeader
            title="Summons"
            description="Rally the community to get attention from who matters"
          />

          <Button
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
                                  What&apos;s this summon about?
                                  {selectedTags.length > 0 && (
                                    <span className="ml-2 text-koru-purple">
                                      ({selectedTags.length} selected)
                                    </span>
                                  )}
                                </label>
                                <div className="max-h-40 overflow-y-auto p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                                  <div className="flex flex-wrap gap-2">
                                    {SUMMON_TAGS.map((tag) => {
                                      const isSelected =
                                        selectedTags.includes(tag);
                                      return (
                                        <button
                                          key={tag}
                                          type="button"
                                          onClick={() => {
                                            if (isSelected) {
                                              setSelectedTags(
                                                selectedTags.filter(
                                                  (t) => t !== tag
                                                )
                                              );
                                            } else {
                                              setSelectedTags([
                                                ...selectedTags,
                                                tag,
                                              ]);
                                            }
                                          }}
                                          className={cn(
                                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                            isSelected
                                              ? "bg-koru-purple text-white ring-2 ring-koru-purple/30"
                                              : getTagColor(tag) +
                                                  " hover:ring-2 hover:ring-koru-purple/20"
                                          )}
                                        >
                                          {tag}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <p className="text-xs text-neutral-500">
                                  Select tags that describe what you want to
                                  discuss
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
                                    selectedTags.length === 0 ||
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
            {/* Clear filter button */}
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all"
                title="Clear category filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Clear search button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all bg-neutral-100 dark:bg-neutral-800"
              title="Clear search"
            >
              Clear Search
            </button>
          )}

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
          ) : filteredSummons.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-koru-purple/20 to-koru-golden/20 flex items-center justify-center">
                <MegaphoneIcon className="w-12 h-12 text-koru-purple/60" />
              </div>
              {allSummons.length === 0 ? (
                <>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    No Summons Yet
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
                    Be the first to rally the community! Create a summon to get
                    attention from who matters.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70 text-white font-semibold rounded-xl transition-all shadow-lg shadow-koru-purple/20 flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create First Summon
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    No Summons in the Last {selectedTime}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
                    There are no summons created in this time period. Try
                    selecting a longer time range or view all summons.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedTime("All")}
                      className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl transition-all flex items-center gap-2"
                    >
                      View All Summons
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70 text-white font-semibold rounded-xl transition-all shadow-lg shadow-koru-purple/20 flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Create Summon
                    </button>
                  </div>
                </>
              )}
            </motion.div>
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
              onBack={handleBackSummon}
              currentUserId={session?.user?.dbId}
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

      {/* Back Modal */}
      <AnimatePresence>
        {backModalOpen && summonToBack && (
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
                      {summonToBack.targetProfileImage ? (
                        <img
                          src={summonToBack.targetProfileImage}
                          alt={summonToBack.targetName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator
                          seed={summonToBack.targetHandle}
                          size={48}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Back this Summon
                        </h3>
                        <p className="text-sm text-neutral-500">
                          @{summonToBack.targetHandle}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Show existing tags with counts */}
                      {summonToBack.tags &&
                        Object.keys(summonToBack.tags).length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                              Community interests
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(summonToBack.tags)
                                .sort(([, a], [, b]) => b - a)
                                .map(([tag, count]) => (
                                  <span
                                    key={tag}
                                    className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-medium",
                                      getTagColor(tag)
                                    )}
                                  >
                                    {tag}{" "}
                                    <span className="opacity-60">
                                      ({count})
                                    </span>
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
                                        backSelectedTags.filter(
                                          (t) => t !== tag
                                        )
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
        callbackUrl="/summons"
        title="Sign in to back"
        description="Connect your X account to back this summon"
      />
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
                      {summon.targetProfileImage ? (
                        <img
                          src={summon.targetProfileImage}
                          alt={summon.targetName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator seed={summon.targetHandle} size={24} />
                      )}
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
                <p className="text-sm sm:text-base mb-0.5 truncate">
                  {summon.targetName}
                </p>
                <p className="text-xs text-white/80 line-clamp-2">
                  {summon.request}
                </p>
                {/* Backers avatars */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="flex -space-x-1.5">
                    {summon.backersData && summon.backersData.length > 0
                      ? summon.backersData.slice(0, 3).map((backer, idx) => (
                          <div
                            key={backer.id || idx}
                            className="w-5 h-5 rounded-full ring-1 ring-white/50 overflow-hidden"
                            title={backer.name}
                          >
                            {backer.profileImageUrl ? (
                              <img
                                src={backer.profileImageUrl}
                                alt={backer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <AvatarGenerator
                                seed={backer.username}
                                size={20}
                              />
                            )}
                          </div>
                        ))
                      : null}
                    {summon.backers > 3 && (
                      <div className="w-5 h-5 rounded-full ring-1 ring-white/50 bg-white/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">
                          +{summon.backers - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/60">
                    {summon.backers} backer{summon.backers !== 1 ? "s" : ""} ·{" "}
                    {rect.percentage.toFixed(2)}%
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(summon);
                  }}
                  className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
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
  onBack,
  currentUserId,
}: {
  summons: Summon[];
  onShare: (summon: Summon) => void;
  onBack: (summon: Summon) => void;
  currentUserId?: string;
}) {
  // Check if user has already backed a summon
  const hasUserBacked = (summon: Summon) => {
    if (!currentUserId || !summon.backersData) return false;
    return summon.backersData.some((backer) => backer.id === currentUserId);
  };
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
            {summon.targetProfileImage ? (
              <img
                src={summon.targetProfileImage}
                alt={summon.targetName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
              />
            ) : (
              <AvatarGenerator seed={summon.targetHandle} size={48} />
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className=" font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {summon.targetName}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  @{summon.targetHandle}
                </span>
                {summon.tags && Object.keys(summon.tags).length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-300 dark:text-neutral-600">
                      ·
                    </span>
                    {Object.entries(summon.tags)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([tag, count]) => (
                        <span
                          key={tag}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            getTagColor(tag)
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    {/* {Object.keys(summon.tags).length > 3 && (
                      <span className="text-xs text-neutral-400">
                        +{Object.keys(summon.tags).length - 3}
                      </span>
                    )} */}
                  </div>
                ) : (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {summon.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats - Two rows */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/* First row: Amount, Trend, Back, Share */}
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-lg text-koru-golden">
                  ${(summon.totalPledged / 1000).toFixed(1)}K
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-sm",
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

                {/* Back Button - show if user hasn't backed yet */}
                {!hasUserBacked(summon) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBack(summon);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-koru-purple/10 hover:bg-koru-purple/20 text-koru-purple text-xs font-medium transition-all"
                    title="Back this summon"
                  >
                    Back
                  </button>
                )}

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

              {/* Second row: Backer avatars - aligned right */}
              <div className="flex items-center justify-end">
                <div className="flex -space-x-1">
                  {summon.backersData && summon.backersData.length > 0 ? (
                    <>
                      {summon.backersData.slice(0, 20).map((backer, idx) => (
                        <div
                          key={backer.id || idx}
                          className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-neutral-900 overflow-hidden"
                          title={backer.name}
                        >
                          {backer.profileImageUrl ? (
                            <img
                              src={backer.profileImageUrl}
                              alt={backer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarGenerator seed={backer.username} size={20} />
                          )}
                        </div>
                      ))}
                      {summon.backers > 20 && (
                        <div className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-neutral-900 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-neutral-600 dark:text-neutral-300">
                            +{summon.backers - 20}
                          </span>
                        </div>
                      )}
                    </>
                  ) : summon.backers > 0 ? (
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {summon.backers} backer{summon.backers !== 1 ? "s" : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
