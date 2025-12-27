import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for cached Twitter profiles
export interface CachedTwitterProfile {
  id: string;
  twitter_id: string;
  username: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  followers_count: number;
  following_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Database operations for caching profiles
export async function getCachedProfile(
  username: string
): Promise<CachedTwitterProfile | null> {
  const { data, error } = await supabase
    .from("twitter_profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !data) return null;

  // Check if cache is older than 24 hours
  const cacheAge = Date.now() - new Date(data.updated_at).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (cacheAge > twentyFourHours) {
    return null; // Return null to force refresh
  }

  return data;
}

export async function getCachedProfilesByQuery(
  query: string
): Promise<CachedTwitterProfile[]> {
  const { data, error } = await supabase
    .from("twitter_profiles")
    .select("*")
    .or(`username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`)
    .order("followers_count", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data;
}

export async function upsertTwitterProfile(
  profile: Omit<CachedTwitterProfile, "id" | "created_at" | "updated_at">
): Promise<CachedTwitterProfile | null> {
  const { data, error } = await supabase
    .from("twitter_profiles")
    .upsert(
      {
        ...profile,
        username: profile.username.toLowerCase(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "twitter_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting profile:", error);
    return null;
  }

  return data;
}

export async function upsertManyTwitterProfiles(
  profiles: Omit<CachedTwitterProfile, "id" | "created_at" | "updated_at">[]
): Promise<void> {
  const { error } = await supabase.from("twitter_profiles").upsert(
    profiles.map((profile) => ({
      ...profile,
      username: profile.username.toLowerCase(),
      updated_at: new Date().toISOString(),
    })),
    {
      onConflict: "twitter_id",
    }
  );

  if (error) {
    console.error("Error upserting profiles:", error);
  }
}

// =============================================
// USER OPERATIONS
// =============================================

// Types for users
export interface User {
  id: string;
  twitter_id: string;
  username: string;
  name: string;
  email: string | null;
  profile_image_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  is_creator: boolean;
  price_per_message: number;
  total_earnings: number;
  response_time_hours: number;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

// Get user by Twitter ID
export async function getUserByTwitterId(
  twitterId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("twitter_id", twitterId)
    .single();

  if (error || !data) return null;
  return data;
}

// Get user by username
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !data) return null;
  return data;
}

// Create or update user on login
export async function upsertUser(user: {
  twitter_id: string;
  username: string;
  name: string;
  email?: string | null;
  profile_image_url?: string | null;
  bio?: string | null;
  is_verified?: boolean;
  followers_count?: number;
  following_count?: number;
}): Promise<User | null> {
  // Build the upsert object, only including fields that are provided
  const upsertData: Record<string, unknown> = {
    twitter_id: user.twitter_id,
    username: user.username.toLowerCase(),
    name: user.name,
    last_login_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Add optional fields if provided
  if (user.email !== undefined) upsertData.email = user.email;
  if (user.profile_image_url !== undefined)
    upsertData.profile_image_url = user.profile_image_url;
  if (user.bio !== undefined) upsertData.bio = user.bio;
  if (user.is_verified !== undefined) upsertData.is_verified = user.is_verified;
  if (user.followers_count !== undefined)
    upsertData.followers_count = user.followers_count;
  if (user.following_count !== undefined)
    upsertData.following_count = user.following_count;

  const { data, error } = await supabase
    .from("users")
    .upsert(upsertData, {
      onConflict: "twitter_id",
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting user:", error);
    return null;
  }

  return data;
}

// Update user profile
export async function updateUser(
  twitterId: string,
  updates: Partial<
    Omit<User, "id" | "twitter_id" | "created_at" | "updated_at">
  >
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("twitter_id", twitterId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data;
}
