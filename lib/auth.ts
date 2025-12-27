import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";

// Twitter profile type for OAuth 2.0
interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
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
      // Persist the Twitter user data in the token
      if (account && profile) {
        const twitterProfile = profile as unknown as TwitterProfile;
        token.twitterId = twitterProfile.data?.id;
        token.twitterUsername = twitterProfile.data?.username;
        token.twitterName = twitterProfile.data?.name;
        token.twitterImage = twitterProfile.data?.profile_image_url;
      }
      return token;
    },
    async session({ session, token }) {
      // Send Twitter data to the client
      if (session.user) {
        session.user.id = token.twitterId as string;
        session.user.username = token.twitterUsername as string;
        session.user.name = token.twitterName as string;
        session.user.image = token.twitterImage as string;
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
      username: string;
      name: string;
      image: string;
    };
  }
}
