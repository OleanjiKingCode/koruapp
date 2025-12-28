"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  getUserChats,
  getUserSummons,
  getUserBackedSummons,
  getRecentTransactions,
  getUserWallets,
  getUserAvailabilitySlots,
  getUserStats,
  Chat,
  Summon,
  Transaction,
  Wallet,
  AvailabilitySlot,
  getUserByTwitterId,
} from "@/lib/supabase";

// Hook to fetch user's chats
export function useUserChats() {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-chats-${userId}` : null,
    () => (userId ? getUserChats(userId) : Promise.resolve([])),
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

  const { data: created, error: createdError, isLoading: isLoadingCreated } = useSWR(
    userId ? `user-summons-created-${userId}` : null,
    () => (userId ? getUserSummons(userId) : Promise.resolve([])),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: backed, error: backedError, isLoading: isLoadingBacked } = useSWR(
    userId ? `user-summons-backed-${userId}` : null,
    () => (userId ? getUserBackedSummons(userId) : Promise.resolve([])),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    createdSummons: created || [],
    backedSummons: backed || [],
    isLoading: isLoadingCreated || isLoadingBacked,
    error: createdError || backedError,
  };
}

// Hook to fetch user's transactions
export function useUserTransactions(limit = 10) {
  const { data: session } = useSession();
  const userId = session?.user?.dbId;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `user-transactions-${userId}-${limit}` : null,
    () => (userId ? getRecentTransactions(userId, limit) : Promise.resolve([])),
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
    () => (userId ? getUserWallets(userId) : Promise.resolve([])),
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
    () => (userId ? getUserAvailabilitySlots(userId) : Promise.resolve([])),
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
    () => (userId ? getUserStats(userId) : Promise.resolve(null)),
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

