// How users discovered Koru - shown in the waitlist form dropdown
export const WAITLIST_SOURCES = [
  "X / Twitter",
  "Friend or colleague",
  "Podcast",
  "Newsletter",
  "Search engine",
  "YouTube",
  "Discord / Telegram",
  "Reddit",
  "Conference / Event",
  "Blog or article",
  "Other",
] as const;

export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];
