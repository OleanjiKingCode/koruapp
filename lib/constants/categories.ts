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
  "All",
] as const;

export const VIEW_MODES = ["grid", "list", "treemap"] as const;

export type Category = (typeof CATEGORIES)[number];
export type TimeFilter = (typeof TIME_FILTERS)[number];
export type ViewMode = (typeof VIEW_MODES)[number];



