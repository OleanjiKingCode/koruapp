// Summon-related types
export type TrendDirection = "up" | "down";

export interface Summon {
  id: string;
  targetHandle: string;
  targetName: string;
  totalPledged: number;
  backers: number;
  category: string;
  trend: TrendDirection;
  trendValue: number;
  request: string;
  createdAt: string;
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

