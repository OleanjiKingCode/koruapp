"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  PageHeader,
  FilterBar,
  ProfileCard,
  EmptyState,
} from "@/components/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn, parseFollowerCount } from "@/lib/utils";
import { MOCK_PROFILES } from "@/lib/data";
import { ROUTES } from "@/lib/constants";
import { useTwitterSearch } from "@/lib/hooks";
import { formatFollowerCount, type TwitterProfile } from "@/lib/types/twitter";
import { getUserByUsername } from "@/lib/supabase";
import type { SortField, SortDirection, Profile } from "@/lib/types";
import {
  CrownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/components/icons";

type TabValue = "hot" | "daily" | "weekly";

export default function DiscoverPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("highest_earned");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Table sorting
  const [tableSortField, setTableSortField] = useState<SortField>("earnings");
  const [tableSortDirection, setTableSortDirection] =
    useState<SortDirection>("desc");

  // Profile preview modal state
  const [selectedTwitterProfile, setSelectedTwitterProfile] =
    useState<TwitterProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnKoru, setIsOnKoru] = useState<boolean | null>(null);
  const [isCheckingKoru, setIsCheckingKoru] = useState(false);

  // Twitter search with SWR - only search when query >= 2 chars
  const {
    profiles: twitterProfiles,
    isLoading: isSearching,
    isValidating,
    isError,
    source,
  } = useTwitterSearch(searchQuery, {
    type: "People",
    count: 20,
    enabled: searchQuery.length >= 2,
  });

  // Handle search from FilterBar (FilterBar handles debouncing internally)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter and sort local mock profiles (shown when no search)
  const filteredMockProfiles = useMemo(() => {
    let profiles = [...MOCK_PROFILES];

    // Filter by category
    if (selectedCategory) {
      profiles = profiles.filter((p) =>
        p.categories.includes(selectedCategory)
      );
    }

    // Sort for table view
    if (viewMode === "list") {
      profiles.sort((a, b) => {
        let aVal: number, bVal: number;

        switch (tableSortField) {
          case "earnings":
            aVal = a.earnings;
            bVal = b.earnings;
            break;
          case "price":
            aVal = a.price;
            bVal = b.price;
            break;
          case "responseTime":
            aVal = a.responseTime;
            bVal = b.responseTime;
            break;
          case "followers":
            aVal = parseFollowerCount(a.followers);
            bVal = parseFollowerCount(b.followers);
            break;
          default:
            return 0;
        }

        return tableSortDirection === "desc" ? bVal - aVal : aVal - bVal;
      });
    } else {
      // Sort for grid view
      switch (sortBy) {
        case "most_followers":
          profiles.sort(
            (a, b) =>
              parseFollowerCount(b.followers) - parseFollowerCount(a.followers)
          );
          break;
        case "lowest_price":
          profiles.sort((a, b) => a.price - b.price);
          break;
        case "fastest_replies":
          profiles.sort((a, b) => a.responseTime - b.responseTime);
          break;
        default:
          profiles.sort((a, b) => b.earnings - a.earnings);
          break;
      }
    }

    return profiles;
  }, [selectedCategory, sortBy, viewMode, tableSortField, tableSortDirection]);

  // Sort Twitter profiles by followers
  const sortedTwitterProfiles = useMemo(() => {
    if (!twitterProfiles.length) return [];

    return [...twitterProfiles].sort((a, b) => {
      if (viewMode === "list") {
        const multiplier = tableSortDirection === "desc" ? -1 : 1;
        return (a.followersCount - b.followersCount) * multiplier;
      }
      // Grid view - always sort by followers descending
      return b.followersCount - a.followersCount;
    });
  }, [twitterProfiles, viewMode, tableSortDirection]);

  const handleTableSort = (field: SortField) => {
    if (tableSortField === field) {
      setTableSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setTableSortField(field);
      setTableSortDirection("desc");
    }
  };

  const handleViewProfile = (profile: Profile) => {
    router.push(ROUTES.PROFILE_VIEW(profile.id));
  };

  const handleViewTwitterProfile = async (profile: TwitterProfile) => {
    setSelectedTwitterProfile(profile);
    setIsProfileModalOpen(true);
    setIsCheckingKoru(true);
    setIsOnKoru(null);

    // Check if this user is on Koru
    try {
      const koruUser = await getUserByUsername(profile.username);
      setIsOnKoru(!!koruUser);
    } catch (error) {
      console.error("Error checking Koru user:", error);
      setIsOnKoru(false);
    } finally {
      setIsCheckingKoru(false);
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedTwitterProfile(null);
    setIsOnKoru(null);
  };

  // Determine what to show - show search results when query is 2+ chars
  const isShowingSearchResults = searchQuery.length >= 2;
  const hasSearchResults = sortedTwitterProfiles.length > 0;
  const isActivelySearching = isSearching || isValidating;

  return (
    <div className="min-h-[calc(100vh+400px)] pb-32">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <PageHeader
          title="Discover"
          description="Find and connect with people who matter"
        />

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full"
          >
            <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="hot"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                🔥 Hot
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm"
              >
                Weekly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <FilterBar
            onSearch={handleSearch}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
            onViewChange={setViewMode}
            selectedCategory={selectedCategory}
            currentSort={sortBy}
            currentView={viewMode}
            searchPlaceholder="Search X handles, names..."
            isSearching={isActivelySearching}
            minSearchLength={2}
          />
        </motion.div>

        {/* Search Status Indicator */}
        {isShowingSearchResults && !isActivelySearching && hasSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <SearchIcon className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Results for &ldquo;{searchQuery}&rdquo;
              </span>
              {source && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    source === "cache"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {source === "cache" ? "Cached" : "Live"}
                </span>
              )}
            </div>
            <span className="text-sm text-neutral-500">
              {sortedTwitterProfiles.length} profile
              {sortedTwitterProfiles.length !== 1 ? "s" : ""} found
            </span>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {isActivelySearching && isShowingSearchResults ? (
            // Loading State
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ProfileCard key={i} isLoading name="" handle="" />
              ))}
            </motion.div>
          ) : isShowingSearchResults ? (
            // Twitter Search Results
            hasSearchResults ? (
              viewMode === "grid" ? (
                // Grid View - Twitter Results
                <motion.div
                  key="twitter-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {sortedTwitterProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TwitterProfileCard
                        profile={profile}
                        onView={() => handleViewTwitterProfile(profile)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                // Table View - Twitter Results
                <motion.div
                  key="twitter-table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                            Rank
                          </th>
                          <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                            Profile
                          </th>
                          <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                            Followers
                          </th>
                          <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                            Following
                          </th>
                          <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                            Verified
                          </th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTwitterProfiles.map((profile, index) => (
                          <motion.tr
                            key={profile.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                          >
                            {/* Rank */}
                            <td className="p-4">
                              <RankBadge rank={index + 1} />
                            </td>

                            {/* Profile */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {profile.profileImageUrl ? (
                                  <img
                                    src={profile.profileImageUrl}
                                    alt={profile.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <AvatarGenerator
                                    seed={profile.username}
                                    size={40}
                                  />
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                      {profile.name}
                                    </p>
                                    {profile.verified && <VerifiedBadge />}
                                  </div>
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    @{profile.username}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Followers */}
                            <td className="p-4 text-neutral-700 dark:text-neutral-300 font-medium">
                              {formatFollowerCount(profile.followersCount)}
                            </td>

                            {/* Following */}
                            <td className="p-4 text-neutral-700 dark:text-neutral-300">
                              {formatFollowerCount(profile.followingCount)}
                            </td>

                            {/* Verified */}
                            <td className="p-4">
                              {profile.verified ? (
                                <span className="text-blue-500">✓</span>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="p-4">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleViewTwitterProfile(profile)
                                }
                              >
                                View
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            ) : isError ? (
              // Error State
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  icon="compass"
                  title="Search failed"
                  description="There was an error searching X. Please try again."
                  ctaText="Clear Search"
                  ctaHref="/discover"
                />
              </motion.div>
            ) : (
              // No Results
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  icon="compass"
                  title="No profiles found"
                  description={`No X profiles found for "${searchQuery}". Try a different search term.`}
                  ctaText="Clear Search"
                  ctaHref="/discover"
                />
              </motion.div>
            )
          ) : filteredMockProfiles.length > 0 ? (
            // Default - Show Mock/Registered Profiles
            viewMode === "grid" ? (
              // Grid View
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredMockProfiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProfileCard
                      name={profile.name}
                      handle={profile.handle}
                      bio={profile.bio}
                      followers={profile.followers}
                      categories={profile.categories}
                      avatarComponent={
                        <AvatarGenerator seed={profile.handle} size={56} />
                      }
                      onView={() => handleViewProfile(profile)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Table/List View
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800">
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          Rank
                        </th>
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          Profile
                        </th>
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Followers"
                            field="followers"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("followers")}
                          />
                        </th>
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Earnings"
                            field="earnings"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("earnings")}
                          />
                        </th>
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Min Price"
                            field="price"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("price")}
                          />
                        </th>
                        <th className="text-left p-4 font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Response"
                            field="responseTime"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("responseTime")}
                          />
                        </th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMockProfiles.map((profile, index) => (
                        <motion.tr
                          key={profile.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                        >
                          {/* Rank */}
                          <td className="p-4">
                            <RankBadge rank={index + 1} />
                          </td>

                          {/* Profile */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <AvatarGenerator
                                seed={profile.handle}
                                size={40}
                              />
                              <div>
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                  {profile.name}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                  @{profile.handle}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Followers */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300">
                            {profile.followers}
                          </td>

                          {/* Earnings */}
                          <td className="p-4 text-koru-golden font-semibold">
                            ${profile.earnings.toLocaleString()}
                          </td>

                          {/* Price */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300">
                            ${profile.price}
                          </td>

                          {/* Response Time */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300">
                            {profile.responseTime}h avg
                          </td>

                          {/* Action */}
                          <td className="p-4">
                            <Button
                              size="sm"
                              onClick={() => handleViewProfile(profile)}
                            >
                              View
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )
          ) : (
            // Empty State
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon="compass"
                title="No profiles found"
                description="No profiles match your current filters. Try clearing filters or browse all."
                ctaText="Clear Filters"
                ctaHref="/discover"
                secondaryCtaText="Browse Appeals"
                secondaryCtaHref="/appeals"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        profile={selectedTwitterProfile}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        isOnKoru={isOnKoru}
        isCheckingKoru={isCheckingKoru}
      />
    </div>
  );
}

// Profile Preview Modal Component
function ProfilePreviewModal({
  profile,
  isOpen,
  onClose,
  isOnKoru,
  isCheckingKoru,
}: {
  profile: TwitterProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isOnKoru: boolean | null;
  isCheckingKoru: boolean;
}) {
  const router = useRouter();

  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
              {/* Header with banner */}
              <div className="relative h-24 bg-gradient-to-r from-koru-purple via-koru-golden/50 to-koru-lime/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Profile content */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-white dark:bg-neutral-800 shadow-lg">
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl.replace(
                          "_normal",
                          "_400x400"
                        )}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarGenerator seed={profile.username} size={96} />
                    )}
                  </div>
                </div>

                {/* Name & Handle */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {profile.name}
                    </h2>
                    {profile.verified && <VerifiedBadge />}
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    @{profile.username}
                  </p>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {formatFollowerCount(profile.followersCount)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Followers
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {formatFollowerCount(profile.followingCount)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Following
                    </p>
                  </div>
                  {profile.statusesCount && profile.statusesCount > 0 && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {formatFollowerCount(profile.statusesCount)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Posts
                      </p>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {(profile.category || profile.professionalType) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.category && (
                      <Badge className="bg-koru-purple/10 text-koru-purple border-0">
                        {profile.category}
                      </Badge>
                    )}
                    {profile.professionalType && (
                      <Badge className="bg-koru-golden/10 text-koru-golden border-0">
                        {profile.professionalType}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Koru Status */}
                <div className="mb-6">
                  {isCheckingKoru ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      <div className="w-4 h-4 border-2 border-koru-purple border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Checking Koru status...
                      </span>
                    </div>
                  ) : isOnKoru ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-koru-lime/10 border border-koru-lime/20">
                      <div className="w-2 h-2 rounded-full bg-koru-lime" />
                      <span className="text-sm font-medium text-koru-lime">
                        Active on Kōru
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="w-2 h-2 rounded-full bg-neutral-400" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Not yet on Kōru
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {isOnKoru ? (
                    <>
                      <Button
                        onClick={() => {
                          onClose();
                          router.push(`/profile/${profile.username}`);
                        }}
                        className="w-full bg-gradient-to-r from-koru-purple to-koru-purple/80 hover:from-koru-purple/90 hover:to-koru-purple/70"
                      >
                        View Kōru Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          onClose();
                          router.push(`/appeals/new?to=${profile.username}`);
                        }}
                        className="w-full"
                      >
                        Send Appeal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          window.open(
                            `https://x.com/${profile.username}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <XLogoIcon className="w-4 h-4 mr-2" />
                        View on X
                      </Button>
                      <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                        This creator hasn&apos;t joined Kōru yet. Follow them on
                        X to stay updated!
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// X Logo Icon
function XLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Close Icon
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

// Twitter Profile Card Component
function TwitterProfileCard({
  profile,
  onView,
}: {
  profile: TwitterProfile;
  onView: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-soft transition-all duration-300 hover:shadow-xl hover:border-koru-purple/30 dark:hover:border-koru-purple/30"
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
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700"
              />
            ) : (
              <AvatarGenerator seed={profile.username} size={56} />
            )}
          </div>

          {/* Name & Handle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {profile.name}
              </h3>
              {profile.verified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
              @{profile.username}
            </p>
          </div>

          {/* Followers Badge */}
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm text-neutral-600 dark:text-neutral-400">
            <UsersIcon className="w-3 h-3" />
            {formatFollowerCount(profile.followersCount)}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Categories/Tags */}
        <div className="flex flex-wrap gap-2">
          {profile.category && (
            <span className="px-2 py-1 bg-koru-purple/10 text-koru-purple text-xs rounded-full">
              {profile.category}
            </span>
          )}
          {profile.professionalType && (
            <span className="px-2 py-1 bg-koru-purple/10 text-koru-purple text-xs rounded-full">
              {profile.professionalType}
            </span>
          )}
        </div>

        {/* CTA Button - Opens profile preview modal */}
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

// Verified Badge Component
function VerifiedBadge() {
  return (
    <svg
      className="w-4 h-4 text-blue-500"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  );
}

// Rank Badge with crowns for top 3
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-gold" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-silver" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <CrownIcon className="w-6 h-6 crown-bronze" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {rank}
      </span>
    </div>
  );
}

// Sortable Table Header
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: () => void;
}) {
  const isActive = field === currentField;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
    >
      {label}
      <div className="flex flex-col">
        <ChevronUpIcon
          className={cn(
            "w-3 h-3 -mb-1",
            isActive && direction === "asc"
              ? "text-koru-purple"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
        <ChevronDownIcon
          className={cn(
            "w-3 h-3",
            isActive && direction === "desc"
              ? "text-koru-purple"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
      </div>
    </button>
  );
}
