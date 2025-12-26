"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PageHeader,
  EmptyState,
  AppealCardSkeleton,
  TreemapSkeleton,
} from "@/components/shared";
import { ShareModal } from "@/components/share";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarGenerator } from "@/components/ui/avatar-generator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, calculateTreemapLayout, formatCurrency } from "@/lib/utils";
import { CATEGORIES, TIME_FILTERS } from "@/lib/constants";
import { MOCK_APPEALS } from "@/lib/data";
import type { Appeal, TreemapRect } from "@/lib/types";
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

type ViewMode = "treemap" | "list";

export default function AppealsPage() {
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
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  // Form state
  const [targetSearch, setTargetSearch] = useState("");
  const [requestText, setRequestText] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [appealCategory, setAppealCategory] = useState("");

  const handleShareAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShareModalOpen(true);
  };

  const filteredAppeals = useMemo(() => {
    return MOCK_APPEALS.filter(
      (appeal) =>
        selectedCategory === "All" || appeal.category === selectedCategory
    )
      .filter(
        (appeal) =>
          !searchQuery ||
          appeal.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appeal.targetHandle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.totalPledged - a.totalPledged);
  }, [selectedCategory, searchQuery]);

  const totalPledged = filteredAppeals.reduce(
    (sum, a) => sum + a.totalPledged,
    0
  );

  const handleCreateAppeal = () => {
    console.log({ targetSearch, requestText, pledgeAmount, appealCategory });
    setIsModalOpen(false);
    setTargetSearch("");
    setRequestText("");
    setPledgeAmount("");
    setAppealCategory("");
  };

  return (
    <div className="min-h-screen pb-[500px] sm:pb-96">
      <main className="max-w-container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <PageHeader
            title="Appeals"
            description="Rally the community to get attention from who matters"
          />

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Appeal
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className=" text-xl">
                  Create New Appeal
                </DialogTitle>
                <DialogDescription>
                  Rally others to get someone&apos;s attention
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Who do you want to reach?
                  </label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      placeholder="Search X handle..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm  font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    What do you want?
                  </label>
                  <textarea
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="e.g., Host an AMA, Advice on starting a company..."
                    className="w-full h-24 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100  text-sm resize-none focus:outline-none focus:ring-2 focus:ring-koru-purple/50 focus:border-koru-purple"
                  />
                </div>

                <div>
                  <label className="text-sm  font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Your pledge (USDC)
                  </label>
                  <div className="relative">
                    <DollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      type="number"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      placeholder="100"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm  font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Category
                  </label>
                  <Select
                    value={appealCategory}
                    onValueChange={setAppealCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web3">Web3</SelectItem>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateAppeal}
                  className="w-full"
                  disabled={!targetSearch || !requestText || !pledgeAmount}
                >
                  Create Appeal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  <AppealCardSkeleton key={i} />
                ))}
              </motion.div>
            )
          ) : viewMode === "treemap" ? (
            <TreemapView
              key="treemap"
              appeals={filteredAppeals}
              totalPledged={totalPledged}
              onShare={handleShareAppeal}
            />
          ) : (
            <ListView
              key="list"
              appeals={filteredAppeals}
              onShare={handleShareAppeal}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Share Modal */}
      {selectedAppeal && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          type="appeal"
          appeal={selectedAppeal}
        />
      )}
    </div>
  );
}

// Treemap View Component
function TreemapView({
  appeals,
  totalPledged,
  onShare,
}: {
  appeals: Appeal[];
  totalPledged: number;
  onShare: (appeal: Appeal) => void;
}) {
  // Calculate treemap layout using imported utility
  const treemapRects = useMemo(() => {
    return calculateTreemapLayout(appeals, totalPledged);
  }, [appeals, totalPledged]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full overflow-hidden border border-neutral-200 dark:border-neutral-800"
      style={{ aspectRatio: "1 / 1", maxHeight: "700px" }}
    >
      {treemapRects.map((rect, index) => {
        const appeal = rect.data;
        const isUp = appeal.trend === "up";
        const isLarge = rect.percentage > 15;
        const isMedium = rect.percentage > 8;
        const isSmall = rect.percentage > 3;

        return (
          <motion.div
            key={appeal.id}
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
                      <AvatarGenerator seed={appeal.targetHandle} size={24} />
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
                      ? appeal.targetHandle.toUpperCase()
                      : appeal.targetHandle.slice(0, 4).toUpperCase()}
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
                    ${(appeal.totalPledged / 1000).toFixed(0)}K
                  </p>
                )}
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
              <div className="text-center text-white">
                <p className=" text-sm sm:text-base mb-0.5 truncate">
                  {appeal.targetName}
                </p>
                <p className="text-xs text-white/80  line-clamp-2">
                  {appeal.request}
                </p>
                <p className="text-[10px] text-white/60 mt-1">
                  {appeal.backers} backers · {rect.percentage.toFixed(2)}%
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(appeal);
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
  appeals,
  onShare,
}: {
  appeals: Appeal[];
  onShare: (appeal: Appeal) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {appeals.map((appeal, index) => (
        <motion.div
          key={appeal.id}
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
            <AvatarGenerator seed={appeal.targetHandle} size={48} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className=" font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {appeal.targetName}
                </h3>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {appeal.category}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                @{appeal.targetHandle} · {appeal.request}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-lg  text-koru-golden">
                  ${(appeal.totalPledged / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-neutral-500">
                  {appeal.backers} backers
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-sm ",
                  appeal.trend === "up"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                )}
              >
                {appeal.trend === "up" ? (
                  <TrendUpIcon className="w-4 h-4" />
                ) : (
                  <TrendDownIcon className="w-4 h-4" />
                )}
                {appeal.trendValue.toFixed(2)}%
              </div>

              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(appeal);
                }}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-koru-golden/10 hover:text-koru-golden text-neutral-500 transition-all"
                title="Share appeal"
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
