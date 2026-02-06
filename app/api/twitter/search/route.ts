import { NextRequest, NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";
import {
  parseTwitterSearchResponse,
  profileToSupabaseFormat,
  type TwitterProfile,
  type TwitterSearchResponse,
} from "@/lib/types/twitter";
import {
  getCachedProfilesByQuery,
  upsertManyTwitterProfiles,
} from "@/lib/supabase";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "People";
  const count = searchParams.get("count") || "20";
  const useCache = searchParams.get("cache") !== "false";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    // First, check Supabase cache for matching profiles
    if (useCache && !RAPIDAPI_KEY) {
      const cachedProfiles = await getCachedProfilesByQuery(query);
      if (cachedProfiles.length >= 3) {
        // Only use cache if we have at least 3 results
        // Transform cached profiles to the app format
        const profiles: TwitterProfile[] = cachedProfiles.map((cached) => ({
          id: cached.twitter_id,
          twitterId: cached.twitter_id,
          username: cached.username,
          name: cached.name,
          bio: cached.bio || "",
          profileImageUrl: cached.profile_image_url || "",
          followersCount: cached.followers_count,
          followingCount: cached.following_count,
          verified: cached.verified,
        }));

        return NextResponse.json({
          profiles,
          source: "cache",
          count: profiles.length,
        });
      }
    }

    // If no cache or cache miss, fetch from RapidAPI
    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/search?` +
        new URLSearchParams({
          type,
          count,
          query,
        }),
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch from Twitter API" },
        { status: response.status },
      );
    }

    const data: TwitterSearchResponse = await response.json();
    let profiles = parseTwitterSearchResponse(data);

    // If People search returned no results, try Top search to extract users from tweets
    if (profiles.length === 0 && type === "People") {
      const topResponse = await fetch(
        `https://${RAPIDAPI_HOST}/search?` +
          new URLSearchParams({
            type: "Top",
            count,
            query,
          }),
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        },
      );

      if (topResponse.ok) {
        const topData: TwitterSearchResponse = await topResponse.json();
        profiles = parseTwitterSearchResponse(topData);
      }
    }

    // Cache profiles in twitter_profiles table for future searches
    // NOTE: This only caches to twitter_profiles, NOT users table
    // Users table is only for authenticated users who log in
    if (profiles.length > 0) {
      const profilesToCache = profiles.map(profileToSupabaseFormat);

      // Await the cache write to ensure data is available when user clicks on a profile
      // This typically takes < 100ms and ensures profile page shows fresh data
      try {
        await upsertManyTwitterProfiles(profilesToCache);
      } catch (err) {
        captureApiError(err, "GET /api/twitter/search:cache");
        // Don't fail the request if cache write fails
      }
    }

    return NextResponse.json({
      profiles,
      source: "api",
      count: profiles.length,
    });
  } catch (error) {
    captureApiError(error, "GET /api/twitter/search");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
