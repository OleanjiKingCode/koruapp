import { NextRequest, NextResponse } from "next/server";
import { getFeaturedProfiles, supabase, FeaturedProfile } from "@/lib/supabase";
import {
  parseTwitterSearchResponse,
  type TwitterSearchResponse,
} from "@/lib/types/twitter";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";
const API_TIMEOUT = 5000; // 5 second timeout for API calls

async function fetchProfileFromTwitter(username: string): Promise<{
  profile_image_url?: string;
  banner_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  verified?: boolean;
  name?: string;
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
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: TwitterSearchResponse = await response.json();
    const profiles = parseTwitterSearchResponse(data);

    // Find exact username match (case-insensitive)
    const matchedProfile = profiles.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );

    if (!matchedProfile) return null;

    return {
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
    // Log timeout or network errors
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`Twitter API timeout for ${username}`);
    } else {
      console.error(`Error fetching profile ${username}:`, error);
    }
    return null;
  }
}

async function refreshProfileWithFallback(profile: FeaturedProfile): Promise<FeaturedProfile> {
  // Try to fetch fresh data from Twitter API
  const freshData = await fetchProfileFromTwitter(profile.username);

  // If API failed/timed out, return cached data
  if (!freshData) {
    return profile;
  }

  // Check if there are actual changes
  const hasChanges =
    (freshData.profile_image_url && freshData.profile_image_url !== profile.profile_image_url) ||
    (freshData.banner_url && freshData.banner_url !== profile.banner_url) ||
    (freshData.bio && freshData.bio !== profile.bio) ||
    (freshData.followers_count !== undefined && freshData.followers_count !== profile.followers_count) ||
    (freshData.name && freshData.name !== profile.name);

  if (hasChanges) {
    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (freshData.profile_image_url) updateData.profile_image_url = freshData.profile_image_url;
    if (freshData.banner_url) updateData.banner_url = freshData.banner_url;
    if (freshData.bio) updateData.bio = freshData.bio;
    if (freshData.followers_count !== undefined) updateData.followers_count = freshData.followers_count;
    if (freshData.following_count !== undefined) updateData.following_count = freshData.following_count;
    if (freshData.verified !== undefined) updateData.verified = freshData.verified;
    if (freshData.name) updateData.name = freshData.name;

    // Update database in background (fire and forget)
    supabase
      .from("featured_profiles")
      .update(updateData)
      .eq("id", profile.id)
      .then(({ error }) => {
        if (error) {
          console.error(`Error updating featured profile ${profile.username}:`, error);
        }
      });

    // Return updated profile data
    return {
      ...profile,
      ...updateData,
      updated_at: updateData.updated_at as string,
    } as FeaturedProfile;
  }

  // No changes, return profile with fresh data merged
  return {
    ...profile,
    profile_image_url: freshData.profile_image_url || profile.profile_image_url,
    banner_url: freshData.banner_url || profile.banner_url,
    bio: freshData.bio || profile.bio,
    followers_count: freshData.followers_count ?? profile.followers_count,
    following_count: freshData.following_count ?? profile.following_count,
    verified: freshData.verified ?? profile.verified,
    name: freshData.name || profile.name,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const categories = searchParams.get("categories")?.split(",").filter(Boolean);
    const refresh = searchParams.get("refresh") === "true";

    // Get featured profiles list from DB
    const result = await getFeaturedProfiles(page, limit, categories);

    // Only refresh from Twitter API if explicitly requested and limit to a few profiles
    // This prevents mass timeouts and rate limiting
    if (refresh && result.profiles.length > 0) {
      // Only refresh first 5 profiles to avoid rate limits
      const profilesToRefresh = result.profiles.slice(0, 5);
      const refreshPromises = profilesToRefresh.map((profile) =>
        refreshProfileWithFallback(profile)
      );
      const refreshedProfiles = await Promise.all(refreshPromises);
      
      // Merge refreshed profiles back
      const updatedProfiles = result.profiles.map((profile, index) => 
        index < 5 ? refreshedProfiles[index] : profile
      );

      return NextResponse.json({
        ...result,
        profiles: updatedProfiles,
      });
    }

    // Return cached data directly (fast path)
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching featured profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
