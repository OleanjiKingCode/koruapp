import * as Sentry from "@sentry/nextjs";
import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { upsertUser } from "./supabase";
import {
  parseTwitterSearchResponse,
  type TwitterSearchResponse,
} from "./types/twitter";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "twitter241.p.rapidapi.com";

// Helper function to fetch Twitter profile data using search API
async function fetchTwitterProfileData(username: string) {
  if (!RAPIDAPI_KEY) {
    console.warn("RAPIDAPI_KEY not configured, skipping Twitter profile fetch");
    return null;
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/search?` +
        new URLSearchParams({
          type: "People",
          count: "20",
          query: username,
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
      console.error("Failed to fetch Twitter profile:", response.status);
      return null;
    }

    const data: TwitterSearchResponse = await response.json();
    const profiles = parseTwitterSearchResponse(data);

    // Find the exact user by username (case-insensitive)
    const userProfile = profiles.find(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    return userProfile || null;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        tags: { operation: "auth:fetchTwitterProfile" },
        extra: { username },
      });
    }
    console.error("Error fetching Twitter profile data:", error);
    return null;
  }
}

// Twitter profile type for OAuth 2.0 with extended fields
interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    description?: string; // Bio
    verified?: boolean;
    verified_type?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
      listed_count: number;
    };
    created_at?: string;
    location?: string;
    url?: string;
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      try {
        // Persist the Twitter user data in the token
        if (account && profile) {
          const twitterProfile = profile as unknown as TwitterProfile;

          // Handle different response formats - Twitter API might return data nested or flat
          let data = twitterProfile?.data;

          // If data is not nested, try using profile directly
          if (!data && twitterProfile) {
            // Check if profile has the fields directly
            if ("id" in twitterProfile || "username" in twitterProfile) {
              data = twitterProfile as any;
            }
          }

          // Validate we have the required data
          if (!data?.id) {
            console.error("Twitter profile data is missing or invalid:", {
              hasData: !!data,
              dataKeys: data ? Object.keys(data) : [],
              profileKeys: Object.keys(twitterProfile || {}),
              profileType: typeof profile,
            });

            return token;
          }

          token.twitterId = data.id;
          token.twitterUsername = data.username;
          token.twitterName = data.name;
          token.twitterImage = data.profile_image_url;
          token.twitterBio = data.description;
          token.twitterVerified =
            data.verified || data.verified_type === "blue";
          token.twitterFollowers = data.public_metrics?.followers_count;
          token.twitterFollowing = data.public_metrics?.following_count;

          // Save user to Supabase on login with extended fields
          try {
            // First, try to fetch additional data from Twitter search API (banner, etc.)
            let twitterProfileData = null;
            try {
              twitterProfileData = await fetchTwitterProfileData(data.username);
            } catch (fetchError) {
              console.warn("Failed to fetch Twitter profile data:", fetchError);
              // Continue with OAuth data if search fails
            }

            // Use data from Twitter search API if available, otherwise use OAuth data
            const profileImageUrl =
              twitterProfileData?.profileImageUrl || data.profile_image_url;
            const bio = twitterProfileData?.bio || data.description;
            const bannerUrl = twitterProfileData?.bannerUrl;
            const location = twitterProfileData?.location || data.location;
            const followersCount =
              twitterProfileData?.followersCount ||
              data.public_metrics?.followers_count;
            const followingCount =
              twitterProfileData?.followingCount ||
              data.public_metrics?.following_count;
            const isVerified =
              twitterProfileData?.verified ||
              data.verified ||
              data.verified_type === "blue";

            const dbUser = await upsertUser({
              twitter_id: data.id,
              username: data.username,
              name: data.name,
              profile_image_url: profileImageUrl,
              banner_url: bannerUrl,
              bio: bio,
              is_verified: isVerified,
              followers_count: followersCount,
              following_count: followingCount,
              location: location,
            });

            // Store the database user ID
            if (dbUser) {
              token.dbUserId = dbUser.id;
              // Update user with banner URL if we have it (fire and forget)
              if (bannerUrl && dbUser.id) {
                // Note: upsertUser doesn't support banner_url, so we'd need to update separately
                // For now, we'll store it in twitter_profiles cache via the search API
                // The search API already handles this
              }
            } else {
              console.warn(
                "Failed to save user to database, but continuing with login",
              );
            }
          } catch (dbError) {
            if (process.env.NODE_ENV === "production") {
              Sentry.captureException(dbError, {
                tags: { operation: "auth:jwt:upsertUser" },
                extra: { twitterId: token.twitterId },
              });
            }
            // Log detailed error but don't fail the login
            console.error("Error saving user to database:", dbError);
            if (dbError instanceof Error) {
              console.error("Database error message:", dbError.message);
            }
            // Continue with login even if database save fails
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          Sentry.captureException(error, { tags: { operation: "auth:jwt" } });
        }
        console.error("JWT callback error:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
        // Return token anyway to not break the auth flow
      }
      return token;
    },
    async session({ session, token }) {
      try {
        // Send Twitter data to the client including bio and verification
        if (session.user && token.twitterId) {
          session.user.id = token.twitterId as string;
          session.user.dbId = token.dbUserId as string | undefined;
          session.user.username = (token.twitterUsername as string) || "";
          session.user.name = (token.twitterName as string) || "";
          session.user.image = (token.twitterImage as string) || "";
          session.user.bio = token.twitterBio as string | undefined;
          session.user.verified = token.twitterVerified as boolean | undefined;
          session.user.followers = token.twitterFollowers as number | undefined;
          session.user.following = token.twitterFollowing as number | undefined;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "production") {
          Sentry.captureException(error, {
            tags: { operation: "auth:session" },
          });
        }
        console.error("Session callback error:", error);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      dbId?: string; // Database UUID
      username: string;
      name: string;
      image: string;
      bio?: string;
      verified?: boolean;
      followers?: number;
      following?: number;
    };
  }
}
