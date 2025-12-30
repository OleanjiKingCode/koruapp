// Formatting utility functions

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; currency?: string }
): string {
  const { compact = false, currency = "USD" } = options || {};

  if (compact) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse follower count strings (e.g., "5.2M", "320K")
 */
export function parseFollowerCount(str: string): number {
  const num = parseFloat(str);
  if (str.includes("M")) return num * 1000000;
  if (str.includes("K")) return num * 1000;
  return num;
}

/**
 * Format follower count to compact string
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format percentage with fixed decimals
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format response time
 */
export function formatResponseTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  if (hours >= 24) {
    return `${Math.round(hours / 24)}d`;
  }
  return `${hours}h`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Format wallet address to short form
 */
export function formatAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}






