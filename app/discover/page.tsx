"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  FloatingNav,
  Footer,
  PageHeader,
  FilterBar,
  ProfileCard,
  EmptyState,
} from "@/components/shared";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import { cn, parseFollowerCount } from "@/lib/utils";
import { MOCK_PROFILES } from "@/lib/data";
import { ROUTES } from "@/lib/constants";
import type { SortField, SortDirection, Profile } from "@/lib/types";
import { CrownIcon, ChevronUpIcon, ChevronDownIcon } from "@/components/icons";

type TabValue = "hot" | "daily" | "weekly";

export default function DiscoverPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("highest_earned");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearching, setIsSearching] = useState(false);

  // Table sorting
  const [tableSortField, setTableSortField] = useState<SortField>("earnings");
  const [tableSortDirection, setTableSortDirection] =
    useState<SortDirection>("desc");

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    let profiles = [...MOCK_PROFILES];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.handle.toLowerCase().includes(query) ||
          p.bio.toLowerCase().includes(query)
      );
    }

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
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    viewMode,
    tableSortField,
    tableSortDirection,
  ]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query) {
      setIsSearching(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSearching(false);
    }
  };

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

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <FloatingNav />

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
          />
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isSearching ? (
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
          ) : filteredProfiles.length > 0 ? (
            viewMode === "grid" ? (
              // Grid View
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProfiles.map((profile, index) => (
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
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
                          Rank
                        </th>
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
                          Profile
                        </th>
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Followers"
                            field="followers"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("followers")}
                          />
                        </th>
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Earnings"
                            field="earnings"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("earnings")}
                          />
                        </th>
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
                          <SortableHeader
                            label="Min Price"
                            field="price"
                            currentField={tableSortField}
                            direction={tableSortDirection}
                            onClick={() => handleTableSort("price")}
                          />
                        </th>
                        <th className="text-left p-4  font-semibold text-neutral-600 dark:text-neutral-400">
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
                      {filteredProfiles.map((profile, index) => (
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
                                <p className=" font-semibold text-neutral-900 dark:text-neutral-100">
                                  {profile.name}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                  @{profile.handle}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Followers */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300 ">
                            {profile.followers}
                          </td>

                          {/* Earnings */}
                          <td className="p-4 text-koru-golden  font-semibold">
                            ${profile.earnings.toLocaleString()}
                          </td>

                          {/* Price */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300 ">
                            ${profile.price}
                          </td>

                          {/* Response Time */}
                          <td className="p-4 text-neutral-700 dark:text-neutral-300 ">
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
                icon="search"
                title="No profiles found"
                description={
                  searchQuery
                    ? `No results for "${searchQuery}". Try a different search term.`
                    : "No profiles match your current filters."
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
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
      <span className="text-sm   font-medium text-neutral-600 dark:text-neutral-400">
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
