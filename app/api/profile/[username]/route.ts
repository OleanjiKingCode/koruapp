import { NextRequest, NextResponse } from "next/server";
import {
  getUserByUsername,
  getProfileByUsername,
  getUserAvailabilitySlots,
  supabase,
  CachedTwitterProfile,
} from "@/lib/supabase";
import {
  parseTwitterSearchResponse,
  type TwitterSearchResponse,
} from "@/lib/types/twitter";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";
const API_TIMEOUT = 5000; // 5 second timeout

async function fetchProfileFromTwitter(username: string): Promise<{
  profile_image_url?: string;
  banner_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  verified?: boolean;
  name?: string;
  twitter_id?: string;
} | null> {
  if (!RAPIDAPI_KEY) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/search?` +
        new URLSearchParams({
          type: "People",
          count: "5",
          query: username,
        }),
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: TwitterSearchResponse = await response.json();
    const profiles = parseTwitterSearchResponse(data);

    // Find exact username match (case-insensitive)
    const matchedProfile = profiles.find(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (!matchedProfile) return null;

    return {
      twitter_id: matchedProfile.twitterId,
      profile_image_url: matchedProfile.profileImageUrl || undefined,
      banner_url: matchedProfile.bannerUrl || undefined,
      bio: matchedProfile.bio || undefined,
      followers_count: matchedProfile.followersCount,
      following_count: matchedProfile.followingCount,
      verified: matchedProfile.verified,
      name: matchedProfile.name,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      console.log(`Twitter API timeout for ${username}`);
    } else {
      console.error(`Error fetching profile ${username}:`, error);
    }
    return null;
  }
}

function hasProfileChanged(
  cached: CachedTwitterProfile,
  fresh: NonNullable<Awaited<ReturnType<typeof fetchProfileFromTwitter>>>,
): boolean {
  // Check if any key fields have changed
  return (
    (fresh.profile_image_url &&
      fresh.profile_image_url !== cached.profile_image_url) ||
    (fresh.banner_url && fresh.banner_url !== cached.banner_url) ||
    (fresh.bio && fresh.bio !== cached.bio) ||
    (fresh.name && fresh.name !== cached.name) ||
    (fresh.followers_count !== undefined &&
      fresh.followers_count !== cached.followers_count) ||
    (fresh.following_count !== undefined &&
      fresh.following_count !== cached.following_count) ||
    (fresh.verified !== undefined && fresh.verified !== cached.verified)
  );
}

async function updateCachedProfile(
  profile: CachedTwitterProfile,
  freshData: NonNullable<Awaited<ReturnType<typeof fetchProfileFromTwitter>>>,
  tableName: "featured_profiles" | "twitter_profiles",
): Promise<void> {
  // Only update if data has actually changed
  if (!hasProfileChanged(profile, freshData)) {
    return;
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (freshData.profile_image_url)
    updateData.profile_image_url = freshData.profile_image_url;
  if (freshData.banner_url) updateData.banner_url = freshData.banner_url;
  if (freshData.bio) updateData.bio = freshData.bio;
  if (freshData.followers_count !== undefined)
    updateData.followers_count = freshData.followers_count;
  if (freshData.following_count !== undefined)
    updateData.following_count = freshData.following_count;
  if (freshData.verified !== undefined)
    updateData.verified = freshData.verified;
  if (freshData.name) updateData.name = freshData.name;

  // Update in background
  supabase
    .from(tableName)
    .update(updateData)
    .eq("id", profile.id)
    .then(({ error }) => {
      if (error) {
        console.error(
          `Error updating ${tableName} for ${profile.username}:`,
          error,
        );
      }
    });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // First check if user is registered on Koru (these users manage their own profiles)
    const koruUser = await getUserByUsername(username);
    if (koruUser) {
      let availabilitySlots = null;
      if (koruUser.is_creator) {
        availabilitySlots = await getUserAvailabilitySlots(koruUser.id);
      }

      // Get primary wallet address for payments
      const primaryWallet = koruUser.connected_wallets?.find(
        (w) => w.is_primary,
      );
      const walletAddress =
        primaryWallet?.address || koruUser.connected_wallets?.[0]?.address;

      return NextResponse.json({
        profile: {
          id: koruUser.id,
          twitterId: koruUser.twitter_id,
          name: koruUser.name,
          handle: koruUser.username,
          bio: koruUser.bio || undefined,
          profileImageUrl: koruUser.profile_image_url || undefined,
          followersCount: koruUser.followers_count || undefined,
          followingCount: koruUser.following_count || undefined,
          isVerified: koruUser.is_verified,
          tags: koruUser.tags || undefined,
          location: koruUser.location || undefined,
          isOnKoru: true,
          isCreator: koruUser.is_creator,
          pricePerMessage: koruUser.price_per_message,
          responseTimeHours: koruUser.response_time_hours,
          availability: koruUser.availability,
          availabilitySlots: availabilitySlots || [],
          walletAddress: walletAddress || undefined, // For escrow payments
        },
      });
    }

    // For non-Koru users: Fetch cached profile and fresh Twitter data in parallel
    // Always check Twitter to ensure we have the latest data
    const [cachedProfile, freshData] = await Promise.all([
      getProfileByUsername(username),
      fetchProfileFromTwitter(username),
    ]);

    // If we got fresh data from API
    if (freshData && freshData.name) {
      // Update cache in background if we have a cached version
      if (cachedProfile) {
        const tableName = cachedProfile.is_featured
          ? "featured_profiles"
          : "twitter_profiles";
        updateCachedProfile(cachedProfile, freshData, tableName);
      }

      return NextResponse.json({
        profile: {
          twitterId: freshData.twitter_id,
          name: freshData.name,
          handle: username,
          bio: freshData.bio || undefined,
          profileImageUrl: freshData.profile_image_url || undefined,
          bannerUrl: freshData.banner_url || undefined,
          followersCount: freshData.followers_count || undefined,
          followingCount: freshData.following_count || undefined,
          isVerified: freshData.verified || false,
          // Preserve category/tags from cache if available
          category: cachedProfile?.category || undefined,
          tags: cachedProfile?.tags || undefined,
          isOnKoru: false,
        },
      });
    }

    // API failed/timed out - fall back to cached data (even if stale)
    if (cachedProfile) {
      return NextResponse.json({
        profile: {
          twitterId: cachedProfile.twitter_id,
          name: cachedProfile.name,
          handle: cachedProfile.username,
          bio: cachedProfile.bio || undefined,
          profileImageUrl: cachedProfile.profile_image_url || undefined,
          bannerUrl: cachedProfile.banner_url || undefined,
          followersCount: cachedProfile.followers_count || undefined,
          followingCount: cachedProfile.following_count || undefined,
          isVerified: cachedProfile.verified,
          category: cachedProfile.category || undefined,
          tags: cachedProfile.tags || undefined,
          isOnKoru: false,
        },
      });
    }

    // Not found anywhere
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
