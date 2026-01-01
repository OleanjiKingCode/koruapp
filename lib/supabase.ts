import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization of Supabase client (server-side only)
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Only create client on server side
  if (typeof window === "undefined") {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase URL and key must be provided. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment variables."
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  }

  throw new Error(
    "Supabase client can only be used on the server side. Use API routes instead."
  );
}

// Export a getter function that lazily initializes the client
// This ensures the client is only created when actually used, and only on the server
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Types for cached Twitter profiles
export interface CachedTwitterProfile {
  id: string;
  twitter_id: string;
  username: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  banner_url: string | null;
  followers_count: number;
  following_count: number;
  verified: boolean;
  location: string | null;
  statuses_count: number;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean;
  featured_order: number | null;
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
    .limit(1);

  if (error || !data || data.length === 0) return null;
  const profile = data[0];

  // Check if cache is older than 24 hours
  const cacheAge = Date.now() - new Date(profile.updated_at).getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (cacheAge > twentyFourHours) {
    return null; // Return null to force refresh
  }

  return profile;
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

type ProfileUpsertData = Partial<
  Omit<CachedTwitterProfile, "id" | "created_at" | "updated_at">
> & {
  twitter_id: string;
  username: string;
  name: string;
};

export async function upsertManyTwitterProfiles(
  profiles: ProfileUpsertData[]
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
// FEATURED PROFILES OPERATIONS (uses featured_profiles table)
// =============================================

// Type for featured profiles
export interface FeaturedProfile {
  id: string;
  twitter_id: string;
  username: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  banner_url: string | null;
  followers_count: number;
  following_count: number;
  verified: boolean;
  location: string | null;
  category: string;
  tags: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get featured profiles with pagination (from featured_profiles table)
export async function getFeaturedProfiles(
  page: number = 0,
  limit: number = 50,
  categories?: string[]
): Promise<{
  profiles: FeaturedProfile[];
  total: number;
  hasMore: boolean;
}> {
  let query = supabase
    .from("featured_profiles")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (categories && categories.length > 0) {
    // Filter by tags only - use AND logic for multiple filters
    // Profile must have ALL selected categories in their tags array
    categories.forEach((category) => {
      // Filter: tags array contains this category
      // Using filter with 'cs' operator (contains) - each filter adds an AND condition
      query = query.filter("tags", "cs", `{${category}}`);
    });
  }

  const { data, error, count } = await query
    .order("display_order", { ascending: true })
    .range(page * limit, (page + 1) * limit - 1);

  if (error || !data) {
    console.error("Error fetching featured profiles:", error);
    return { profiles: [], total: 0, hasMore: false };
  }

  return {
    profiles: data,
    total: count || 0,
    hasMore: (count || 0) > (page + 1) * limit,
  };
}

// Get profile by username (for profile page)
// Checks both featured_profiles and twitter_profiles tables
export async function getProfileByUsername(
  username: string
): Promise<CachedTwitterProfile | null> {
  // First check featured_profiles (has category and tags from seed)
  // Use limit(1) to handle duplicates - just take the first match
  const { data: featuredData, error: featuredError } = await supabase
    .from("featured_profiles")
    .select("*")
    .ilike("username", username)
    .eq("is_active", true)
    .limit(1);

  if (!featuredError && featuredData && featuredData.length > 0) {
    const featured = featuredData[0];
    // Map featured profile to CachedTwitterProfile format
    return {
      id: featured.id,
      twitter_id: featured.twitter_id,
      username: featured.username,
      name: featured.name,
      bio: featured.bio,
      profile_image_url: featured.profile_image_url,
      banner_url: featured.banner_url,
      followers_count: featured.followers_count,
      following_count: featured.following_count,
      verified: featured.verified,
      location: featured.location,
      statuses_count: 0,
      category: featured.category,
      tags: featured.tags,
      is_featured: true,
      featured_order: featured.display_order,
      created_at: featured.created_at,
      updated_at: featured.updated_at,
    };
  }

  // Fall back to twitter_profiles cache
  // Use limit(1) to handle duplicates - just take the first match
  const { data, error } = await supabase
    .from("twitter_profiles")
    .select("*")
    .ilike("username", username)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Search featured profiles
export async function searchFeaturedProfiles(
  query: string,
  limit: number = 20
): Promise<CachedTwitterProfile[]> {
  const { data, error } = await supabase
    .from("twitter_profiles")
    .select("*")
    .or(`username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`)
    .order("followers_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// Get featured categories (from featured_profiles table)
export async function getFeaturedCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("featured_profiles")
    .select("category")
    .eq("is_active", true)
    .not("category", "is", null);

  if (error || !data) return [];

  const categories = [...new Set(data.map((p) => p.category).filter(Boolean))];
  return categories as string[];
}

// =============================================
// USER OPERATIONS
// =============================================

// Types for availability (embedded in user)
export interface AvailabilitySlotData {
  day: string;
  start: string;
  end: string;
}

export interface UserAvailability {
  timezone: string;
  slots: AvailabilitySlotData[];
}

// Types for connected wallets (embedded in user)
export interface ConnectedWallet {
  address: string;
  chain: string;
  is_primary: boolean;
}

// Types for users
export interface User {
  id: string;
  twitter_id: string;
  username: string;
  name: string;
  email: string | null;
  profile_image_url: string | null;
  banner_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  location: string | null;

  // Creator settings
  is_creator: boolean;
  price_per_message: number;
  response_time_hours: number;

  // Balances
  balance: number;
  pending_balance: number;
  total_earnings: number;
  total_withdrawn: number;

  // Tags
  tags: string[] | null;

  // Embedded data (JSONB columns)
  availability: UserAvailability | null;
  connected_wallets: ConnectedWallet[] | null;

  // Stats
  total_chats: number;
  total_summons_created: number;
  total_summons_backed: number;

  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Types for chats
export interface Chat {
  id: string;
  requester_id: string;
  creator_id: string;
  appeal_id: string | null;
  status:
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "refunded"
    | "cancelled";
  amount: number;
  slot_name: string | null;
  slot_duration: number | null;
  deadline_at: string | null;
  completed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  requester?: User;
  creator?: User;
}

// Types for summons (appeals)
export interface Summon {
  id: string;
  creator_id: string;
  target_twitter_id: string;
  target_username: string;
  target_name: string;
  target_profile_image: string | null;
  title: string | null;
  message: string;
  pledged_amount: number;
  goal_amount: number | null;
  backers_count: number;
  status: "active" | "successful" | "expired" | "cancelled";
  expires_at: string | null;
  successful_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: User;
}

// Types for transactions
export interface Transaction {
  id: string;
  user_id: string;
  type: "payment" | "refund" | "withdrawal" | "deposit" | "earning" | "pledge";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  amount: number;
  currency: string;
  chat_id: string | null;
  appeal_id: string | null;
  wallet_id: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  payment_method: string | null;
  payment_provider: string | null;
  external_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Types for wallets
export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  chain: string;
  is_primary: boolean;
  label: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Types for availability slots
export interface AvailabilitySlot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  is_active: boolean;
  max_bookings_per_day: number;
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
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Get user by username
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Create or update user on login
export async function upsertUser(user: {
  twitter_id: string;
  username: string;
  name: string;
  email?: string | null;
  profile_image_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
  is_verified?: boolean;
  followers_count?: number;
  following_count?: number;
  location?: string | null;
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
  if (user.banner_url !== undefined) upsertData.banner_url = user.banner_url;
  if (user.bio !== undefined) upsertData.bio = user.bio;
  if (user.is_verified !== undefined) upsertData.is_verified = user.is_verified;
  if (user.followers_count !== undefined)
    upsertData.followers_count = user.followers_count;
  if (user.following_count !== undefined)
    upsertData.following_count = user.following_count;
  if (user.location !== undefined) upsertData.location = user.location;

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

// =============================================
// CHATS OPERATIONS
// =============================================

// Get user's chats (as creator or requester)
export async function getUserChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from("chats")
    .select(`
      *,
      requester:users!requester_id (
        id,
        name,
        username,
        profile_image_url
      ),
      creator:users!creator_id (
        id,
        name,
        username,
        profile_image_url
      )
    `)
    .or(`requester_id.eq.${userId},creator_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  
  // Transform to include otherParty based on the current user
  return data.map((chat: any) => {
    const isRequester = chat.requester_id === userId;
    return {
      ...chat,
      otherParty: isRequester ? chat.creator : chat.requester,
    };
  });
}

// Get chat by ID
export async function getChatById(chatId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Create a new chat
export async function createChat(chat: {
  requester_id: string;
  creator_id: string;
  amount: number;
  slot_name?: string | null;
  slot_duration?: number | null;
  deadline_at?: string | null;
}): Promise<Chat | null> {
  const { data, error } = await supabase
    .from("chats")
    .insert({
      requester_id: chat.requester_id,
      creator_id: chat.creator_id,
      amount: chat.amount,
      slot_name: chat.slot_name,
      slot_duration: chat.slot_duration,
      deadline_at: chat.deadline_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  return data;
}

// =============================================
// SUMMONS (APPEALS) OPERATIONS
// =============================================

// Get user's created summons
export async function getUserSummons(userId: string): Promise<Summon[]> {
  const { data, error } = await supabase
    .from("appeals")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

// Get user's backed summons
export async function getUserBackedSummons(userId: string): Promise<Summon[]> {
  const { data, error } = await supabase
    .from("appeal_backers")
    .select("appeal_id")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) return [];

  const appealIds = data.map((b) => b.appeal_id);

  const { data: appeals, error: appealsError } = await supabase
    .from("appeals")
    .select("*")
    .in("id", appealIds)
    .order("created_at", { ascending: false });

  if (appealsError || !appeals) return [];
  return appeals;
}

// Get all active summons
export async function getActiveSummons(limit = 50): Promise<Summon[]> {
  const { data, error } = await supabase
    .from("summons")
    .select("*")
    .eq("status", "active")
    .order("total_backed", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Transform to match Summon interface
  return data.map((s: any) => ({
    id: s.id,
    creator_id: s.creator_id,
    target_twitter_id: s.target_twitter_id,
    target_username: s.target_handle,
    target_name: s.target_name,
    target_profile_image: s.target_image,
    title: null,
    message: s.request,
    pledged_amount: Number(s.total_backed || s.amount || 0),
    goal_amount: null,
    backers_count: s.backers_count || 0,
    status: s.status as "active" | "successful" | "expired" | "cancelled",
    expires_at: s.expires_at,
    successful_at: s.completed_at,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

// Create a new summon (appeal)
export async function createSummon(summon: {
  creator_id: string;
  target_twitter_id: string;
  target_username: string;
  target_name: string;
  target_profile_image?: string | null;
  message: string;
  pledged_amount: number;
  goal_amount?: number | null;
  expires_at?: string | null;
}): Promise<Summon | null> {
  const { data, error } = await supabase
    .from("appeals")
    .insert({
      ...summon,
      status: "active",
      backers_count: 1, // Creator counts as first backer
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating summon:", error);
    return null;
  }

  // Also increment the creator's total_summons_created count
  await supabase.rpc("increment_user_summons", { user_id: summon.creator_id });

  return data;
}

// Get summon by target username
export async function getSummonByTarget(
  targetUsername: string
): Promise<Summon | null> {
  const { data, error } = await supabase
    .from("appeals")
    .select("*")
    .ilike("target_username", targetUsername)
    .eq("status", "active")
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Backer type for summons
export interface SummonBacker {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  user?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
}

// Get backers for a summon with user info
export async function getSummonBackers(
  summonId: string,
  limit: number = 10
): Promise<SummonBacker[]> {
  // Try appeal_backers first, then summon_backers
  const { data, error } = await supabase
    .from("appeal_backers")
    .select(`
      id,
      user_id,
      amount,
      created_at,
      user:users!user_id (
        id,
        name,
        username,
        profile_image_url
      )
    `)
    .eq("appeal_id", summonId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    // Try summon_backers table as fallback
    const { data: summonBackers, error: sbError } = await supabase
      .from("summon_backers")
      .select(`
        id,
        user_id,
        amount,
        created_at,
        user:users!user_id (
          id,
          name,
          username,
          profile_image_url
        )
      `)
      .eq("summon_id", summonId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (sbError || !summonBackers) return [];
    return summonBackers;
  }

  return data || [];
}

// Back an existing summon
export async function backSummon(
  summonId: string,
  userId: string,
  amount: number
): Promise<boolean> {
  // First add the backer
  const { error: backerError } = await supabase.from("appeal_backers").insert({
    appeal_id: summonId,
    user_id: userId,
    amount,
  });

  if (backerError) {
    console.error("Error adding backer:", backerError);
    return false;
  }

  // Then update the summon's pledged_amount and backers_count
  const { error: updateError } = await supabase.rpc(
    "increment_summon_backing",
    {
      summon_id: summonId,
      backing_amount: amount,
    }
  );

  if (updateError) {
    console.error("Error updating summon:", updateError);
    return false;
  }

  return true;
}

// =============================================
// TRANSACTIONS OPERATIONS
// =============================================

// Get user's transactions
export async function getUserTransactions(
  userId: string,
  limit = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// Get recent transactions (for profile)
export async function getRecentTransactions(
  userId: string,
  limit = 5
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// =============================================
// WALLETS OPERATIONS
// =============================================

// Get user's wallets
export async function getUserWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });

  if (error || !data) return [];
  return data;
}

// Get primary wallet
export async function getPrimaryWallet(userId: string): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// Add wallet
export async function addWallet(
  userId: string,
  address: string,
  chain: string = "ethereum",
  label?: string
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from("wallets")
    .insert({
      user_id: userId,
      address,
      chain,
      label,
      is_primary: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding wallet:", error);
    return null;
  }

  return data;
}

// =============================================
// AVAILABILITY OPERATIONS
// =============================================

// Get user's availability slots
export async function getUserAvailabilitySlots(
  userId: string
): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("user_id", userId)
    .order("price", { ascending: true });

  if (error || !data) return [];
  return data;
}

// Create availability slot
export async function createAvailabilitySlot(
  userId: string,
  slot: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    max_bookings_per_day?: number;
  }
): Promise<AvailabilitySlot | null> {
  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      user_id: userId,
      ...slot,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating availability slot:", error);
    return null;
  }

  return data;
}

// Update availability slot
export async function updateAvailabilitySlot(
  slotId: string,
  updates: Partial<
    Omit<AvailabilitySlot, "id" | "user_id" | "created_at" | "updated_at">
  >
): Promise<AvailabilitySlot | null> {
  const { data, error } = await supabase
    .from("availability_slots")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .select()
    .single();

  if (error) {
    console.error("Error updating availability slot:", error);
    return null;
  }

  return data;
}

// =============================================
// MESSAGES OPERATIONS
// =============================================

// Types for messages
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined fields
  sender?: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
}

// Get messages for a chat
export async function getChatMessages(
  chatId: string,
  limit: number = 100
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!sender_id (
        id,
        name,
        username,
        profile_image_url
      )
    `)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data;
}

// Send a message
export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select(`
      *,
      sender:users!sender_id (
        id,
        name,
        username,
        profile_image_url
      )
    `)
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  // Update the chat's last_message and last_message_at
  await supabase
    .from("chats")
    .update({
      last_message: content.trim().substring(0, 100),
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId);

  return data;
}

// Mark messages as read
export async function markMessagesAsRead(
  chatId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_id", chatId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }
  return true;
}

// Get unread message count for a chat
export async function getUnreadCount(
  chatId: string,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("chat_id", chatId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
  return count || 0;
}

// =============================================
// USER STATS
// =============================================

// Get user stats summary
export async function getUserStats(userId: string): Promise<{
  totalChats: number;
  activeChats: number;
  totalSummons: number;
  activeSummons: number;
  totalTransactions: number;
} | null> {
  try {
    // Get chat counts
    const { count: totalChats } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},creator_id.eq.${userId}`);

    const { count: activeChats } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},creator_id.eq.${userId}`)
      .eq("status", "active");

    // Get summon counts
    const { count: totalSummons } = await supabase
      .from("appeals")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", userId);

    const { count: activeSummons } = await supabase
      .from("appeals")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", userId)
      .eq("status", "active");

    // Get transaction count
    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      totalChats: totalChats || 0,
      activeChats: activeChats || 0,
      totalSummons: totalSummons || 0,
      activeSummons: activeSummons || 0,
      totalTransactions: totalTransactions || 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}
