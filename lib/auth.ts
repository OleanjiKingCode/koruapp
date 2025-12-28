import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { upsertUser } from "./supabase";

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
      // Request additional user fields including bio, verified status, and metrics
      authorization: {
        params: {
          scope: "users.read tweet.read offline.access",
        },
      },
      userinfo: {
        url: "https://api.twitter.com/2/users/me",
        params: {
          "user.fields": "id,name,username,profile_image_url,description,verified,verified_type,public_metrics,created_at,location,url",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the Twitter user data in the token
      if (account && profile) {
        const twitterProfile = profile as unknown as TwitterProfile;
        const data = twitterProfile.data;
        
        token.twitterId = data?.id;
        token.twitterUsername = data?.username;
        token.twitterName = data?.name;
        token.twitterImage = data?.profile_image_url;
        token.twitterBio = data?.description;
        token.twitterVerified = data?.verified || data?.verified_type === "blue";
        token.twitterFollowers = data?.public_metrics?.followers_count;
        token.twitterFollowing = data?.public_metrics?.following_count;

        // Save user to Supabase on login with extended fields
        if (data?.id) {
          try {
            const dbUser = await upsertUser({
              twitter_id: data.id,
              username: data.username,
              name: data.name,
              profile_image_url: data.profile_image_url,
              bio: data.description,
              is_verified: data.verified || data.verified_type === "blue",
              followers_count: data.public_metrics?.followers_count,
              following_count: data.public_metrics?.following_count,
            });
            // Store the database user ID
            if (dbUser) {
              token.dbUserId = dbUser.id;
            }
          } catch (error) {
            console.error("Error saving user to database:", error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send Twitter data to the client including bio and verification
      if (session.user) {
        session.user.id = token.twitterId as string;
        session.user.dbId = token.dbUserId as string | undefined;
        session.user.username = token.twitterUsername as string;
        session.user.name = token.twitterName as string;
        session.user.image = token.twitterImage as string;
        session.user.bio = token.twitterBio as string | undefined;
        session.user.verified = token.twitterVerified as boolean | undefined;
        session.user.followers = token.twitterFollowers as number | undefined;
        session.user.following = token.twitterFollowing as number | undefined;
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
