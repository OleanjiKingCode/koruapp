// Appeal-related types
export type TrendDirection = "up" | "down";

export interface Appeal {
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

export interface UserAppeal {
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
  data: Appeal;
  percentage: number;
}

export interface TreemapItem {
  data: Appeal;
  value: number;
  percentage: number;
}



