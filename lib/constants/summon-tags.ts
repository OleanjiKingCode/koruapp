// Available tags for summons - users select these when creating or backing
export const SUMMON_TAGS = [
  // General
  "Personal",
  "Business",
  "Advice",
  "Collaboration",
  "Networking",
  "Mentorship",
  
  // Tech & Web3
  "Web3",
  "DeFi",
  "NFTs",
  "DAOs",
  "Crypto",
  "AI",
  "Tech",
  "Startup",
  "Investing",
  
  // Content & Media
  "Podcast",
  "Interview",
  "AMA",
  "Content",
  "Memes",
  "Education",
  
  // Industry
  "Gaming",
  "Music",
  "Sports",
  "Fashion",
  "Food",
  "Health",
  "Finance",
  
  // Social
  "Community",
  "Charity",
  "Politics",
  "Culture",
] as const;

export type SummonTag = (typeof SUMMON_TAGS)[number];

// Tag colors for display
export const SUMMON_TAG_COLORS: Record<string, string> = {
  // Web3 related - purple tones
  "Web3": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "DeFi": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "NFTs": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "DAOs": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Crypto": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  
  // Tech - blue tones
  "AI": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Tech": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Startup": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "Investing": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  
  // Content - pink/rose tones
  "Podcast": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Interview": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "AMA": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  "Content": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Memes": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Education": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  
  // Industry - various
  "Gaming": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Music": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Sports": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Fashion": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "Food": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Health": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "Finance": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  
  // General - neutral/warm tones
  "Personal": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Business": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Advice": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Collaboration": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  "Networking": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Mentorship": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  
  // Social
  "Community": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Charity": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Politics": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Culture": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

// Default color for tags not in the map
export const DEFAULT_TAG_COLOR = "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

// Get color for a tag
export function getTagColor(tag: string): string {
  return SUMMON_TAG_COLORS[tag] || DEFAULT_TAG_COLOR;
}

