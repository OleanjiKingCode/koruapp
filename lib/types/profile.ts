// Profile-related types
export interface Profile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  followers: string;
  categories: string[];
  earnings: number;
  price: number;
  responseTime: number;
  availability?: Availability;
}

export interface Availability {
  timezone: string;
  averageResponseTime: string; // e.g., "2-4 hours"
  availableDays: string[]; // e.g., ["Mon", "Tue", "Wed", "Thu", "Fri"]
  unavailableDays: string[]; // e.g., ["Sat", "Sun"]
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
  available: boolean;
}

export interface WalletBalance {
  onChain: string; // Wallet balance (crypto)
  onChainUSD: string; // USD equivalent
  inApp: string; // In-app balance (from refunds, payments received)
  inAppUSD: string;
}

export interface UserData {
  address: string;
  shortAddress: string;
  username: string;
  displayName: string;
  bio: string;
  website: string;
  twitterHandle: string;
  points: number;
  level: string;
  badges: string[];
  joinDate: string;
  stats: UserStats;
  walletBalance: WalletBalance;
  availability?: Availability;
}

export interface UserStats {
  totalSpent: string;
  totalRefunded: string;
  activeChats: number;
  appealsCreated: number;
}

export interface Chat {
  id: string;
  otherParty: string;
  handle: string;
  status: "Pending" | "Active" | "Replied" | "Completed" | "Refunded";
  amount: string;
  deadline: string;
  lastMessage: string;
  type: "sent" | "received"; // Whether user initiated or received the chat
  avatar?: string;
  createdAt: string;
  awaitingReply: "me" | "them" | null; // Who needs to respond next
}

export type SortField = "earnings" | "price" | "responseTime" | "followers";
export type SortDirection = "asc" | "desc";
