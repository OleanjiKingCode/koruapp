// Summon-related types
export type TrendDirection = "up" | "down";

export interface SummonBacker {
  id: string;
  name: string;
  username: string;
  profileImageUrl: string | null;
  amount: number;
  backedAt?: string;
  reason?: string;
}

export interface Summon {
  id: string;
  targetHandle: string;
  targetName: string;
  targetProfileImage?: string | null;
  totalPledged: number;
  backers: number;
  backersData?: SummonBacker[]; // First 10 backers for display
  category: string;
  trend: TrendDirection;
  trendValue: number;
  request: string;
  tags?: Record<string, number>; // Tag counts: { "Web3": 5, "Tech": 3 }
  createdAt: string;
  // Creator info (optional, for display)
  creatorUsername?: string;
  creatorName?: string;
  creatorProfileImage?: string | null;
}

export interface UserSummon {
  id: string;
  targetHandle: string;
  targetName: string;
  pledgedAmount: string;
  status: string;
  backers: number;
  date: string;
}

export interface TreemapRect {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Summon;
  percentage: number;
}

export interface TreemapItem {
  data: Summon;
  value: number;
  percentage: number;
}

// For backwards compatibility, export aliases
export type Appeal = Summon;
export type UserAppeal = UserSummon;
