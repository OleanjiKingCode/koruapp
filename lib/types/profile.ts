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
}

export interface UserData {
  address: string;
  shortAddress: string;
  username: string;
  points: number;
  level: string;
  badges: string[];
  joinDate: string;
  stats: UserStats;
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
  status: string;
  amount: string;
  deadline: string;
  lastMessage: string;
}

export type SortField = "earnings" | "price" | "responseTime" | "followers";
export type SortDirection = "asc" | "desc";
