import { NextRequest, NextResponse } from "next/server";
import {
  getUserByUsername,
  getProfileByUsername,
  getUserAvailabilitySlots,
  supabase,
  CachedTwitterProfile,
} from "@/lib/supabase";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";
const API_TIMEOUT = 5000; // 5 second timeout

// Response type for /user endpoint
interface TwitterUserResponse {
  result?: {
    data?: {
      user?: {
        result?: {
          rest_id?: string;
          is_blue_verified?: boolean;
          avatar?: {
            image_url?: string;
          };
          core?: {
            name?: string;
            screen_name?: string;
          };
          legacy?: {
            description?: string;
            followers_count?: number;
            friends_count?: number;
            profile_banner_url?: string;
            verified?: boolean;
          };
        };
      };
    };
  };
}

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
    // Use /user endpoint for direct lookup (more reliable than search)
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/user?username=${encodeURIComponent(username)}`,
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

    const data: TwitterUserResponse = await response.json();
    const user = data?.result?.data?.user?.result;

    if (!user || !user.core?.screen_name) return null;

    // Get profile image URL and convert to larger size
    let profileImageUrl = user.avatar?.image_url;
    if (profileImageUrl) {
      profileImageUrl = profileImageUrl.replace("_normal", "_400x400");
    }

    const result = {
      twitter_id: user.rest_id,
      profile_image_url: profileImageUrl || undefined,
      banner_url: user.legacy?.profile_banner_url || undefined,
      bio: user.legacy?.description || undefined,
      followers_count: user.legacy?.followers_count,
      following_count: user.legacy?.friends_count,
      verified: user.is_blue_verified || user.legacy?.verified || false,
      name: user.core.name,
    };

    console.log(`[Twitter API] Fresh data for @${username}:`, result);

    return result;
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

// Check if Koru user's Twitter data has changed
function hasKoruUserChanged(
  user: {
    profile_image_url?: string | null;
    bio?: string | null;
    name?: string | null;
    followers_count?: number | null;
    following_count?: number | null;
    is_verified?: boolean | null;
  },
  fresh: NonNullable<Awaited<ReturnType<typeof fetchProfileFromTwitter>>>,
): boolean {
  return !!(
    (fresh.profile_image_url &&
      fresh.profile_image_url !== user.profile_image_url) ||
    (fresh.bio && fresh.bio !== user.bio) ||
    (fresh.name && fresh.name !== user.name) ||
    (fresh.followers_count !== undefined &&
      fresh.followers_count !== user.followers_count) ||
    (fresh.following_count !== undefined &&
      fresh.following_count !== user.following_count) ||
    (fresh.verified !== undefined && fresh.verified !== user.is_verified)
  );
}

// Update Koru user with fresh Twitter data
async function updateKoruUser(
  userId: string,
  freshData: NonNullable<Awaited<ReturnType<typeof fetchProfileFromTwitter>>>,
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (freshData.profile_image_url)
    updateData.profile_image_url = freshData.profile_image_url;
  if (freshData.bio) updateData.bio = freshData.bio;
  if (freshData.name) updateData.name = freshData.name;
  if (freshData.followers_count !== undefined)
    updateData.followers_count = freshData.followers_count;
  if (freshData.following_count !== undefined)
    updateData.following_count = freshData.following_count;
  if (freshData.verified !== undefined)
    updateData.is_verified = freshData.verified;

  // Update in background
  supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .then(({ error }) => {
      if (error) {
        console.error(`Error updating Koru user ${userId}:`, error);
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

    // First check if user is registered on Koru
    // Fetch Koru user and fresh Twitter data in parallel
    const [koruUser, freshTwitterData] = await Promise.all([
      getUserByUsername(username),
      fetchProfileFromTwitter(username),
    ]);

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

      // If we got fresh Twitter data, check if it's different and update
      if (freshTwitterData && freshTwitterData.name) {
        if (hasKoruUserChanged(koruUser, freshTwitterData)) {
          // Update Koru user in background
          updateKoruUser(koruUser.id, freshTwitterData);
        }

        // Return profile with fresh Twitter data
        return NextResponse.json({
          profile: {
            id: koruUser.id,
            twitterId: koruUser.twitter_id,
            name: freshTwitterData.name || koruUser.name,
            handle: koruUser.username,
            bio: freshTwitterData.bio || koruUser.bio || undefined,
            profileImageUrl:
              freshTwitterData.profile_image_url ||
              koruUser.profile_image_url ||
              undefined,
            followersCount:
              freshTwitterData.followers_count ??
              koruUser.followers_count ??
              undefined,
            followingCount:
              freshTwitterData.following_count ??
              koruUser.following_count ??
              undefined,
            isVerified: freshTwitterData.verified ?? koruUser.is_verified,
            tags: koruUser.tags || undefined,
            location: koruUser.location || undefined,
            isOnKoru: true,
            isCreator: koruUser.is_creator,
            pricePerMessage: koruUser.price_per_message,
            responseTimeHours: koruUser.response_time_hours,
            availability: koruUser.availability,
            availabilitySlots: availabilitySlots || [],
            walletAddress: walletAddress || undefined,
          },
        });
      }

      // Twitter API failed - return cached Koru user data
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
          walletAddress: walletAddress || undefined,
        },
      });
    }

    // For non-Koru users: Check cached profile
    // (Twitter data was already fetched above in parallel with Koru user check)
    const cachedProfile = await getProfileByUsername(username);

    // If we got fresh data from API (already fetched above)
    if (freshTwitterData && freshTwitterData.name) {
      // Update cache in background if we have a cached version
      if (cachedProfile) {
        const tableName = cachedProfile.is_featured
          ? "featured_profiles"
          : "twitter_profiles";
        updateCachedProfile(cachedProfile, freshTwitterData, tableName);
      }

      return NextResponse.json({
        profile: {
          twitterId: freshTwitterData.twitter_id,
          name: freshTwitterData.name,
          handle: username,
          bio: freshTwitterData.bio || undefined,
          profileImageUrl: freshTwitterData.profile_image_url || undefined,
          bannerUrl: freshTwitterData.banner_url || undefined,
          followersCount: freshTwitterData.followers_count || undefined,
          followingCount: freshTwitterData.following_count || undefined,
          isVerified: freshTwitterData.verified || false,
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
