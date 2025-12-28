// Route constants
export const ROUTES = {
  HOME: "/",
  DISCOVER: "/discover",
  SUMMONS: "/summons",
  PROFILE: "/profile",
  PROFILE_VIEW: (id: string) => `/profile/${id}`,
  HOW_IT_WORKS: "/how-it-works",
  SIGN_IN: "/sign-in",
  CHAT: (id: string) => `/chat/${id}`,
} as const;

export const EXTERNAL_LINKS = {
  TWITTER: "https://twitter.com",
  DISCORD: "https://discord.com",
  GITHUB: "https://github.com",
} as const;

