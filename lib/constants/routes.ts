// Route constants
export const ROUTES = {
  HOME: "/",
  DISCOVER: "/discover",
  APPEALS: "/appeals",
  PROFILE: "/profile",
  HOW_IT_WORKS: "/how-it-works",
  SIGN_IN: "/sign-in",
  CHAT: (id: string) => `/chat/${id}`,
} as const;

export const EXTERNAL_LINKS = {
  TWITTER: "https://twitter.com",
  DISCORD: "https://discord.com",
  GITHUB: "https://github.com",
} as const;

