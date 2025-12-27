// Category and filter constants
export const CATEGORIES = [
  "All",
  "Web3",
  "Tech",
  "Business",
  "Medical",
  "Sports",
] as const;

export const TIME_FILTERS = [
  "24H",
  "48H",
  "7D",
  "30D",
  "3M",
  "6M",
  "12M",
] as const;

export const SORT_OPTIONS = [
  { label: "Highest Earned", value: "highest_earned" },
  { label: "Most Followers", value: "most_followers" },
  { label: "Lowest Price", value: "lowest_price" },
  { label: "Fastest Replies", value: "fastest_replies" },
] as const;

export const VIEW_MODES = ["grid", "list", "treemap"] as const;

export type Category = (typeof CATEGORIES)[number];
export type TimeFilter = (typeof TIME_FILTERS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];
export type ViewMode = (typeof VIEW_MODES)[number];



