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

  // Link wallet to user account
  const linkWallet = async (address: string, chain: string = "base") => {
    if (!twitterId || !address) return null;

    const normalizedAddress = address.toLowerCase();
    const existingWallets = dbUser?.connected_wallets || [];

    // Check if wallet already linked
    const alreadyLinked = existingWallets.some(
      (w) => w.address.toLowerCase() === normalizedAddress,
    );

    if (alreadyLinked) {
      return dbUser;
    }

    // Add new wallet as primary (first wallet is always primary)
    const newWallet: ConnectedWallet = {
      address: normalizedAddress,
      chain,
      is_primary: existingWallets.length === 0, // First wallet is primary
    };

    const updatedWallets = [...existingWallets, newWallet];

    return updateUserData({ connected_wallets: updatedWallets });
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
    isWalletLinked,
    hasLinkedWallet,
    primaryWalletAddress: primaryWallet?.address || null,
    refresh: mutate,
  };
}
