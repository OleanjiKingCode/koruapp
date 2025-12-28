// Discover page constants

export const PROFILES_PER_PAGE = 50;

export const TAB_VALUES = ["hot", "daily", "weekly"] as const;
export type TabValue = (typeof TAB_VALUES)[number];

export const TAG_COLORS = [
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
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const SORT_OPTIONS = {
  HIGHEST_EARNED: "highest_earned",
  MOST_FOLLOWERS: "most_followers",
  LOWEST_PRICE: "lowest_price",
  FASTEST_REPLIES: "fastest_replies",
} as const;

export const MIN_SEARCH_LENGTH = 2;

