"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { User, getUserByTwitterId, updateUser } from "@/lib/supabase";

// Fetcher for SWR
const fetcher = async (twitterId: string): Promise<User | null> => {
  if (!twitterId) return null;
  return getUserByTwitterId(twitterId);
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
    twitterId ? fetcher(twitterId) : null
  );

  const isLoading = status === "loading" || isLoadingDb;
  const isAuthenticated = status === "authenticated";

  // Combined user data - session data merged with DB data
  const user = session?.user
    ? {
        // From session (always fresh from Twitter login)
        id: session.user.id,
        twitterId: session.user.id,
        username: session.user.username,
        name: session.user.name,
        profileImageUrl: session.user.image,
        // From DB (persisted data)
        bio: dbUser?.bio || null,
        followersCount: dbUser?.followers_count || 0,
        followingCount: dbUser?.following_count || 0,
        isVerified: dbUser?.is_verified || false,
        isCreator: dbUser?.is_creator || false,
        pricePerMessage: dbUser?.price_per_message || 0,
        totalEarnings: dbUser?.total_earnings || 0,
        responseTimeHours: dbUser?.response_time_hours || 24,
        email: dbUser?.email || null,
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
    }>
  ) => {
    if (!twitterId) return null;

    const updated = await updateUser(twitterId, updates);
    if (updated) {
      // Revalidate the SWR cache
      mutate();
    }
    return updated;
  };

  return {
    user,
    dbUser,
    session,
    isLoading,
    isAuthenticated,
    error,
    updateUser: updateUserData,
    refresh: mutate,
  };
}

