import type { Metadata } from "next";
import { getProfileByUsername } from "@/lib/supabase";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: username } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.koruapp.xyz";

  try {
    const profile = await getProfileByUsername(username);

    if (profile) {
      const title = `${profile.name || profile.username} | Koru`;
      const description = profile.bio
        ? `${profile.bio.slice(0, 155)}${profile.bio.length > 155 ? "..." : ""}`
        : `Connect with ${profile.name || profile.username} on Koru.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${baseUrl}/profile/${profile.username}`,
          ...(profile.profile_image_url && {
            images: [
              {
                url: profile.profile_image_url,
                width: 400,
                height: 400,
                alt: profile.name || profile.username,
              },
            ],
          }),
        },
        twitter: {
          card: "summary",
          title,
          description,
          ...(profile.profile_image_url && {
            images: [profile.profile_image_url],
          }),
        },
      };
    }
  } catch {
    // Fall through to default metadata
  }

  return {
    title: `@${username} | Koru`,
    description: `View ${username}'s profile on Koru.`,
  };
}

export default function ProfileDetailLayout({ children }: ProfileLayoutProps) {
  return children;
}
