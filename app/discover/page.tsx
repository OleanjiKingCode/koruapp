"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

// UI Components
import {
  PageHeader,
  FilterBar,
  ProfileCard,
  EmptyState,
} from "@/components/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import {
  TwitterProfileCard,
  FeaturedProfileCard,
  VerifiedBadge,
  RankBadge,
  SortableHeader,
} from "@/components/discover";
import { FireIcon, SearchIcon } from "@/components/icons";

// Hooks
import {
  useTwitterSearch,
  useFeaturedProfiles,
  useInfiniteScroll,
  useTableSort,
} from "@/lib/hooks";

// Utils, Constants & Types
import { formatFollowerCount } from "@/lib/utils/format";
import { getTagColor, deduplicateTags } from "@/lib/utils/tags";
import { type TabValue, MIN_SEARCH_LENGTH } from "@/lib/constants";
import type { FeaturedProfile } from "@/lib/supabase";
import {
  formatFollowerCount as formatTwitterFollowers,
  type TwitterProfile,
} from "@/lib/types/twitter";
import type { SortField } from "@/lib/types";

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search query from URL
  const initialSearch = searchParams.get("search") || "";

  // UI state
  const [activeTab, setActiveTab] = useState<TabValue>("hot");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("highest_earned");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Update URL when search query changes
  const updateSearchUrl = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.length >= MIN_SEARCH_LENGTH) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      const newUrl = params.toString() ? `?${params.toString()}` : "/discover";
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  // Sync URL when search query changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchUrl(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateSearchUrl]);

  // Featured profiles from DB
  const {
    profiles: featuredProfiles,
    categories,
    isLoading: isLoadingFeatured,
    hasMore,
    loadMore,
  } = useFeaturedProfiles({ selectedCategories });

  // Table sorting - map sortBy to tableSortField
  const getSortFieldFromSortBy = (
    sortByValue: string
  ): "followers" | "earnings" => {
    switch (sortByValue) {
      case "most_followers":
        return "followers";
      case "highest_earned":
      default:
        return "earnings";
    }
  };

  const {
    sortField: tableSortField,
    sortDirection: tableSortDirection,
    handleSort: handleTableSort,
  } = useTableSort({
    defaultField: getSortFieldFromSortBy(sortBy),
    defaultDirection: "desc",
  });

  // Update table sort when sortBy changes
  useEffect(() => {
    const field = getSortFieldFromSortBy(sortBy);
    if (tableSortField !== field) {
      handleTableSort(field);
    }
  }, [sortBy]);

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingFeatured,
    onLoadMore: loadMore,
    enabled: !searchQuery,
  });

  // Twitter search (only when query >= 2 chars)
  const {
    profiles: twitterProfiles,
    isLoading: isSearching,
    isValidating,
    isError,
  } = useTwitterSearch(searchQuery, {
    type: "People",
    count: 20,
    enabled: searchQuery.length >= MIN_SEARCH_LENGTH,
  });

  // Derived state
  const isShowingSearchResults = searchQuery.length >= MIN_SEARCH_LENGTH;
  const isActivelySearching = isSearching || isValidating;
  const hasSearchResults = twitterProfiles.length > 0;

  // Sort Twitter profiles by followers
  const sortedTwitterProfiles = useMemo(() => {
    if (!twitterProfiles.length) return [];
    return [...twitterProfiles].sort((a, b) => {
      const multiplier = tableSortDirection === "desc" ? -1 : 1;
      return (a.followersCount - b.followersCount) * multiplier;
    });
  }, [twitterProfiles, tableSortDirection]);

  // Sort featured profiles (works for both grid and list view)
  const sortedFeaturedProfiles = useMemo(() => {
    if (!featuredProfiles.length) return [];

    const profiles = [...featuredProfiles];

    profiles.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortBy) {
        case "most_followers":
          aVal = a.followers_count;
          bVal = b.followers_count;
          break;
        case "highest_earned":
        default:
          // For now, sort by followers as earnings data might not be available
          // TODO: Add earnings field to FeaturedProfile if needed
          aVal = a.followers_count;
          bVal = b.followers_count;
          break;
      }
      // Always use desc for grid view, respect tableSortDirection for list view
      const direction = viewMode === "grid" ? "desc" : tableSortDirection;
      return direction === "desc" ? bVal - aVal : aVal - bVal;
    });

    return profiles;
  }, [featuredProfiles, sortBy, tableSortDirection, viewMode]);

  // Handlers
  const handleViewFeaturedProfile = (profile: FeaturedProfile) => {
    router.push(`/profile/${profile.username}`);
  };

  const handleViewTwitterProfile = (profile: TwitterProfile) => {
    router.push(`/profile/${profile.username}`);
  };

  return (
    <div className="min-h-[calc(100vh+400px)] pb-64">
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
                <FireIcon className="mr-1 size-4" /> Hot
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
            onSearch={setSearchQuery}
            onCategoryChange={setSelectedCategories}
            onSortChange={setSortBy}
            onViewChange={setViewMode}
            categories={["All", ...categories]}
            selectedCategories={selectedCategories}
            currentSort={sortBy}
            currentView={viewMode}
            searchPlaceholder="Search X handles, names..."
            isSearching={isActivelySearching}
            minSearchLength={MIN_SEARCH_LENGTH}
          />
        </motion.div>


        {isShowingSearchResults && !isActivelySearching && hasSearchResults && (
          <SearchStatusIndicator
            searchQuery={searchQuery}
            resultCount={sortedTwitterProfiles.length}
          />
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {(isActivelySearching && isShowingSearchResults) ||
            (isLoadingFeatured &&
              !isShowingSearchResults &&
              featuredProfiles.length === 0) ? (
            <LoadingGrid />
          ) : isShowingSearchResults ? (
            // Twitter Search Results
            hasSearchResults ? (
              viewMode === "grid" ? (
                <TwitterResultsGrid
                  profiles={sortedTwitterProfiles}
                  onView={handleViewTwitterProfile}
                />
              ) : (
                <TwitterResultsTable
                  profiles={sortedTwitterProfiles}
                  onView={handleViewTwitterProfile}
                />
              )
            ) : isError ? (
              <ErrorState />
            ) : (
              <NoResultsState searchQuery={searchQuery} />
            )
          ) : featuredProfiles.length > 0 ? (
            viewMode === "grid" ? (
              <FeaturedProfilesGrid
                profiles={featuredProfiles}
                isLoading={isLoadingFeatured}
                hasMore={hasMore}
                sentinelRef={sentinelRef}
                onView={(profile) =>
                  router.push(`/profile/${profile.username}`)
                }
              />
            ) : (
              <FeaturedProfilesTable
                profiles={sortedFeaturedProfiles}
                sortField={tableSortField}
                sortDirection={tableSortDirection}
                onSort={handleTableSort}
                onView={handleViewFeaturedProfile}
              />
            )
          ) : (
            <EmptyFiltersState
              onClearFilters={() => {
                setSelectedCategories([]);
                setSearchQuery("");
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ============================================================================
// Sub-components for cleaner JSX
// ============================================================================

function SearchStatusIndicator({
  searchQuery,
  resultCount,
}: {
  searchQuery: string;
  resultCount: number;
}) {
  return (
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
      </div>
      <span className="text-sm text-neutral-500">
        {resultCount} profile{resultCount !== 1 ? "s" : ""} found
      </span>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
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
  );
}

function TwitterResultsGrid({
  profiles,
  onView,
}: {
  profiles: TwitterProfile[];
  onView: (profile: TwitterProfile) => void;
}) {
  return (
    <motion.div
      key="twitter-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TwitterProfileCard
              profile={profile}
              onView={() => onView(profile)}
            />
          </motion.div>
        ))}
      </div>
      <CantFindProfileCTA />
    </motion.div>
  );
}

function TwitterResultsTable({
  profiles,
  onView,
}: {
  profiles: TwitterProfile[];
  onView: (profile: TwitterProfile) => void;
}) {
  return (
    <motion.div
      key="twitter-table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
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
              {profiles.map((profile, index) => (
                <motion.tr
                  key={profile.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <td className="p-4">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarGenerator seed={profile.username} size={40} />
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
                  <td className="p-4 text-neutral-700 dark:text-neutral-300 font-medium">
                    {formatTwitterFollowers(profile.followersCount)}
                  </td>
                  <td className="p-4 text-neutral-700 dark:text-neutral-300">
                    {formatTwitterFollowers(profile.followingCount)}
                  </td>
                  <td className="p-4">
                    {profile.verified ? (
                      <span className="text-blue-500">✓</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Button size="sm" onClick={() => onView(profile)}>
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CantFindProfileCTA />
    </motion.div>
  );
}

function FeaturedProfilesGrid({
  profiles,
  isLoading,
  hasMore,
  sentinelRef,
  onView,
}: {
  profiles: FeaturedProfile[];
  isLoading: boolean;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement>;
  onView: (profile: FeaturedProfile) => void;
}) {
  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id || profile.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.5) }}
          >
            <FeaturedProfileCard
              profile={profile}
              onView={() => onView(profile)}
            />
          </motion.div>
        ))}
      </div>


      <div ref={sentinelRef} className="h-10" />


      {(isLoading || hasMore) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-neutral-200 dark:border-neutral-700" />
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-koru-purple border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Loading more profiles...
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Discovering amazing people for you
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function FeaturedProfilesTable({
  profiles,
  sortField,
  sortDirection,
  onSort,
  onView,
}: {
  profiles: FeaturedProfile[];
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSort: (field: SortField) => void;
  onView: (profile: FeaturedProfile) => void;
}) {
  return (
    <motion.div
      key="table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <div className="overflow-x-auto pb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="text-left text-sm font-medium p-4 text-neutral-600 dark:text-neutral-400">
                Rank
              </th>
              <th className="text-left text-sm font-medium p-4 text-neutral-600 dark:text-neutral-400">
                Profile
              </th>
              <th className="text-left text-sm font-medium p-4 text-neutral-600 dark:text-neutral-400">
                <SortableHeader
                  label="Followers"
                  field="followers"
                  currentField={sortField}
                  direction={sortDirection}
                  onClick={() => onSort("followers")}
                />
              </th>
              <th className="text-left text-sm font-medium p-4 text-neutral-600 dark:text-neutral-400">
                Categories & Tags
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile, index) => (
              <motion.tr
                key={profile.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
              >
                <td className="p-4">
                  <RankBadge rank={index + 1} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <AvatarGenerator seed={profile.username} size={40} />
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {profile.name}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        @{profile.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-neutral-700 dark:text-neutral-300">
                  {formatFollowerCount(profile.followers_count)}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-[350px]">
                    {deduplicateTags(profile.tags || [])
                      .slice(0, 5)
                      .map((tag) => {
                        const color = getTagColor(tag);
                        return (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.5 ${color.bg} ${color.text} text-xs rounded font-normal border ${color.border}`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    {/* Show +N more if there are more tags */}
                    {(profile.tags?.length || 0) > 5 && (
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs rounded font-normal">
                        +{(profile.tags?.length || 0) - 5}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Button size="sm" onClick={() => onView(profile)}>
                    View
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function ErrorState() {
  return (
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
  );
}

function NoResultsState({ searchQuery }: { searchQuery: string }) {
  return (
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
  );
}

function EmptyFiltersState({
  onClearFilters,
}: {
  onClearFilters?: () => void;
}) {
  return (
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
        ctaHref={onClearFilters ? undefined : "/discover"}
        action={
          onClearFilters ? (
            <Button
              onClick={onClearFilters}
              className="bg-koru-purple hover:bg-koru-purple/90"
            >
              Clear Filters
            </Button>
          ) : undefined
        }
        secondaryCtaText="Browse Summons"
        secondaryCtaHref="/summons"
      />
    </motion.div>
  );
}

function CantFindProfileCTA() {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Can&apos;t find the profile you&apos;re looking for?
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-koru-purple text-white font-medium text-sm hover:bg-koru-purple/90 transition-colors"
      >
        Reach out to us
      </Link>
    </div>
  );
}

function DiscoverLoading() {
  return (
    <div className="min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-1/3" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverLoading />}>
      <DiscoverContent />
    </Suspense>
  );
}
