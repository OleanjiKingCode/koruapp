"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { User, ConnectedWallet } from "@/lib/supabase";
import { API_ROUTES } from "@/lib/constants/routes";

// Fetcher for SWR
const fetcher = async (twitterId: string): Promise<User | null> => {
  if (!twitterId) return null;
  const response = await fetch(API_ROUTES.USER);
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  const data = await response.json();
  return data.user;
};

export function useUser() {
  const { data: session, status } = useSession();
  const twitterId = session?.user?.id;

  const {
    data: dbUser,
    error,
    isLoading: isLoadingDb,
    mutate,
  } = useSWR(twitterId ? `user-${twitterId}` : null, () =>
    twitterId ? fetcher(twitterId) : null,
  );

  const isLoading = status === "loading" || isLoadingDb;
  const isAuthenticated = status === "authenticated";

  // Get primary wallet address from connected_wallets
  const getPrimaryWallet = (): ConnectedWallet | null => {
    if (!dbUser?.connected_wallets || dbUser.connected_wallets.length === 0) {
      return null;
    }
    // Find primary wallet, or return first one
    return (
      dbUser.connected_wallets.find((w) => w.is_primary) ||
      dbUser.connected_wallets[0]
    );
  };

  const primaryWallet = getPrimaryWallet();

  // Combined user data - session data merged with DB data
  const user = session?.user
    ? {
        // From session (always fresh from Twitter login)
        id: session.user.id,
        twitterId: session.user.id,
        username: session.user.username,
        name: session.user.name,
        profileImageUrl: session.user.image,
        // From session (Twitter data) - use these as fallback
        bio: dbUser?.bio || session.user.bio || null,
        followersCount: dbUser?.followers_count || session.user.followers || 0,
        followingCount: dbUser?.following_count || session.user.following || 0,
        isVerified: dbUser?.is_verified || session.user.verified || false,
        // From DB (persisted data)
        isCreator: dbUser?.is_creator || false,
        pricePerMessage: dbUser?.price_per_message || 0,
        totalEarnings: dbUser?.total_earnings || 0,
        responseTimeHours: dbUser?.response_time_hours || 24,
        email: dbUser?.email || null,
        tags: dbUser?.tags || [],
        website: dbUser?.website || null,
        // Wallet info
        connectedWallets: dbUser?.connected_wallets || [],
        primaryWalletAddress: primaryWallet?.address || null,
        // Balance info
        balance: dbUser?.balance || 0,
        pendingBalance: dbUser?.pending_balance || 0,
        totalWithdrawn: dbUser?.total_withdrawn || 0,
        // Timestamps
        createdAt: dbUser?.created_at,
        lastLoginAt: dbUser?.last_login_at,
      }
    : null;

  // Update user in DB
  const updateUserData = async (
    updates: Partial<{
      bio: string;
      is_creator: boolean;
      price_per_message: number;
      response_time_hours: number;
      email: string;
      tags: string[];
      website: string;
      connected_wallets: ConnectedWallet[];
    }>,
  ) => {
    if (!twitterId) return null;

    try {
      const response = await fetch(API_ROUTES.USER_UPDATE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      const data = await response.json();

      // Revalidate the SWR cache
      mutate();

      return data.user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // 14-day cooldown in milliseconds
  const WALLET_CHANGE_COOLDOWN_DAYS = 14;
  const WALLET_CHANGE_COOLDOWN_MS =
    WALLET_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

  // Get the date when wallet can next be changed
  const getNextWalletChangeDate = (): Date | null => {
    if (!primaryWallet?.linked_at) return null;
    const linkedDate = new Date(primaryWallet.linked_at);
    return new Date(linkedDate.getTime() + WALLET_CHANGE_COOLDOWN_MS);
  };

  // Check if wallet change is allowed (14 days passed)
  const canChangeWallet = (): boolean => {
    if (!primaryWallet?.linked_at) return true; // No wallet linked, can add
    const nextChangeDate = getNextWalletChangeDate();
    if (!nextChangeDate) return true;
    return new Date() >= nextChangeDate;
  };

  // Get days remaining until wallet can be changed
  const getDaysUntilWalletChange = (): number => {
    const nextChangeDate = getNextWalletChangeDate();
    if (!nextChangeDate) return 0;
    const now = new Date();
    if (now >= nextChangeDate) return 0;
    const diffMs = nextChangeDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  };

  // Link wallet to user account (first time)
  const linkWallet = async (address: string, chain: string = "base") => {
    if (!twitterId || !address) {
      throw new Error("Invalid address or not authenticated");
    }

    const normalizedAddress = address.toLowerCase();
    const existingWallets = dbUser?.connected_wallets || [];

    // Check if this exact wallet already linked as primary to THIS account
    const alreadyPrimary = existingWallets.some(
      (w) =>
        w.address.toLowerCase() === normalizedAddress &&
        w.is_primary &&
        !w.unlinked_at,
    );

    if (alreadyPrimary) {
      return dbUser;
    }

    // Add new wallet as primary
    const newWallet: ConnectedWallet = {
      address: normalizedAddress,
      chain,
      is_primary: true,
      linked_at: new Date().toISOString(),
    };

    // Mark any existing primary as not primary
    const updatedWallets = existingWallets.map((w) => {
      if (w.is_primary) {
        return {
          ...w,
          is_primary: false,
          unlinked_at: new Date().toISOString(),
        };
      }
      return w;
    });

    // This will throw an error if the wallet is already linked to another account
    return updateUserData({
      connected_wallets: [...updatedWallets, newWallet],
    });
  };

  // Change primary wallet (with 14-day cooldown check)
  const changePrimaryWallet = async (
    newAddress: string,
    chain: string = "base",
  ): Promise<{ success: boolean; error?: string }> => {
    if (!twitterId || !newAddress)
      return { success: false, error: "Invalid address" };

    // Check cooldown
    if (!canChangeWallet()) {
      const daysRemaining = getDaysUntilWalletChange();
      return {
        success: false,
        error: `You can change your wallet in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`,
      };
    }

    const normalizedAddress = newAddress.toLowerCase();
    const existingWallets = dbUser?.connected_wallets || [];

    // Mark old primary as not primary (keep for history)
    const updatedWallets = existingWallets.map((w) => {
      if (w.is_primary) {
        return {
          ...w,
          is_primary: false,
          unlinked_at: new Date().toISOString(),
        };
      }
      return w;
    });

    // Check if new address already exists in history
    const existingWalletIndex = updatedWallets.findIndex(
      (w) => w.address.toLowerCase() === normalizedAddress,
    );

    if (existingWalletIndex !== -1) {
      // Reactivate existing wallet as primary
      updatedWallets[existingWalletIndex] = {
        ...updatedWallets[existingWalletIndex],
        is_primary: true,
        linked_at: new Date().toISOString(),
        unlinked_at: undefined,
      };
      await updateUserData({ connected_wallets: updatedWallets });
    } else {
      // Add new wallet as primary
      const newWallet: ConnectedWallet = {
        address: normalizedAddress,
        chain,
        is_primary: true,
        linked_at: new Date().toISOString(),
      };
      await updateUserData({
        connected_wallets: [...updatedWallets, newWallet],
      });
    }

    return { success: true };
  };

  // Check if a wallet address matches the user's stored primary wallet
  const isWalletLinked = (address: string): boolean => {
    if (!address || !primaryWallet) return false;
    return primaryWallet.address.toLowerCase() === address.toLowerCase();
  };

  // Check if user has any wallet linked
  const hasLinkedWallet = (): boolean => {
    return !!primaryWallet;
  };

  return {
    user,
    dbUser,
    session,
    isLoading,
    isAuthenticated,
    error,
    updateUser: updateUserData,
    linkWallet,
    changePrimaryWallet,
    isWalletLinked,
    hasLinkedWallet,
    canChangeWallet,
    getDaysUntilWalletChange,
    primaryWalletAddress: primaryWallet?.address || null,
    refresh: mutate,
  };
}
