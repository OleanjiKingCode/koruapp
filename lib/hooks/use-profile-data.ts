"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  Chat,
  Summon,
  Transaction,
  Wallet,
  AvailabilitySlot,
} from "@/lib/supabase";
import { API_ROUTES } from "@/lib/constants/routes";

// Hook to fetch user's chats
export function useUserChats() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-chats-${userId}` : null,
    async () => {
      if (!userId) return [];
      const response = await fetch(API_ROUTES.USER_CHATS);
      if (!response.ok) throw new Error("Failed to fetch chats");
      const result = await response.json();
      return result.chats;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    chats: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch user's summons (both created and backed)
export function useUserSummons() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading } = useSWR(
    userId ? `user-summons-${userId}` : null,
    async () => {
      if (!userId) return { createdSummons: [], backedSummons: [] };
      const response = await fetch(API_ROUTES.USER_SUMMONS);
      if (!response.ok) throw new Error("Failed to fetch summons");
      return await response.json();
    },
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    createdSummons: data?.createdSummons || [],
    backedSummons: data?.backedSummons || [],
    isLoading,
    error,
  };
}

// Hook to fetch user's transactions
export function useUserTransactions(limit = 10) {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-transactions-${userId}-${limit}` : null,
    async () => {
      if (!userId) return [];
      const response = await fetch(`${API_ROUTES.USER_TRANSACTIONS}?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const result = await response.json();
      return result.transactions;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds for transactions
    }
  );

  return {
    transactions: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch user's wallets
export function useUserWallets() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-wallets-${userId}` : null,
    async () => {
      if (!userId) return [];
      const response = await fetch(API_ROUTES.USER_WALLETS);
      if (!response.ok) throw new Error("Failed to fetch wallets");
      const result = await response.json();
      return result.wallets;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    wallets: data || [],
    primaryWallet: data?.find((w) => w.is_primary) || data?.[0] || null,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch user's availability slots
export function useUserAvailability() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-availability-${userId}` : null,
    async () => {
      if (!userId) return [];
      const response = await fetch(API_ROUTES.USER_AVAILABILITY);
      if (!response.ok) throw new Error("Failed to fetch availability");
      const result = await response.json();
      return result.slots;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    slots: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook to fetch user's stats summary
export function useUserStats() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-stats-${userId}` : null,
    async () => {
      if (!userId) return null;
      const response = await fetch(API_ROUTES.USER_STATS);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const result = await response.json();
      return result.stats;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    stats: data || {
      totalChats: 0,
      activeChats: 0,
      totalSummons: 0,
      activeSummons: 0,
      totalTransactions: 0,
    },
    isLoading,
    error,
    refresh: mutate,
  };
}

// Combined hook for all profile data
export function useProfileData() {
  const { chats, isLoading: isLoadingChats } = useUserChats();
  const { createdSummons, backedSummons, isLoading: isLoadingSummons } = useUserSummons();
  const { transactions, isLoading: isLoadingTransactions } = useUserTransactions();
  const { wallets, primaryWallet, isLoading: isLoadingWallets } = useUserWallets();
  const { slots: availabilitySlots, isLoading: isLoadingAvailability } = useUserAvailability();
  const { stats, isLoading: isLoadingStats } = useUserStats();

  return {
    chats,
    createdSummons,
    backedSummons,
    transactions,
    wallets,
    primaryWallet,
    availabilitySlots,
    stats,
    isLoading:
      isLoadingChats ||
      isLoadingSummons ||
      isLoadingTransactions ||
      isLoadingWallets ||
      isLoadingAvailability ||
      isLoadingStats,
  };
}

