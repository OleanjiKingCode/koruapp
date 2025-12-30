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

// API endpoint constants
export const API_ROUTES = {
  USER: "/api/user",
  USER_UPDATE: "/api/user/update",
  DISCOVER_FEATURED: "/api/discover/featured",
  DISCOVER_CATEGORIES: "/api/discover/categories",
  USER_CHATS: "/api/user/chats",
  USER_SUMMONS: "/api/user/summons",
  USER_TRANSACTIONS: "/api/user/transactions",
  USER_WALLETS: "/api/user/wallets",
  USER_AVAILABILITY: "/api/user/availability",
  USER_STATS: "/api/user/stats",
  PROFILE: (username: string) => `/api/profile/${username}`,
  SUMMONS_CREATE: "/api/summons",
  CHAT_MESSAGES: (chatId: string) => `/api/chat/${chatId}/messages`,
} as const;

export const EXTERNAL_LINKS = {
  TWITTER: "https://twitter.com",
  DISCORD: "https://discord.com",
  GITHUB: "https://github.com",
} as const;
