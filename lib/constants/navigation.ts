// Navigation constants
export const NAV_ITEMS = [
  { name: "Home", href: "/", iconName: "home" },
  { name: "Discover", href: "/discover", iconName: "discover" },
  { name: "Chats", href: "/chats", iconName: "chats" },
  { name: "Summons", href: "/summons", iconName: "summons" },
  { name: "Profile", href: "/profile", iconName: "profile" },
] as const;

export const FONT_OPTIONS = [
  { name: "Quicksand", value: "quicksand", className: "font-quicksand" },
  { name: "Tenor", value: "tenor", className: "font-tenor" },
  { name: "Script", value: "lemon", className: "font-lemon" },
] as const;

export const LANGUAGE_OPTIONS = [
  { name: "English", code: "en" },
  { name: "Pidgin", code: "pcm" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
export type FontOption = (typeof FONT_OPTIONS)[number];
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];
