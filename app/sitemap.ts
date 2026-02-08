import { MetadataRoute } from "next";
import { getFeaturedProfiles, getActiveSummons } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.koruapp.xyz";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/summons`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic profile pages from featured profiles
  let profilePages: MetadataRoute.Sitemap = [];
  try {
    const { profiles } = await getFeaturedProfiles();
    profilePages = profiles.map((profile) => ({
      url: `${baseUrl}/profile/${profile.username}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Silently handle - sitemap will still have static pages
  }

  // Dynamic summon pages
  let summonPages: MetadataRoute.Sitemap = [];
  try {
    const summons = await getActiveSummons(100);
    summonPages = summons.map((summon) => ({
      url: `${baseUrl}/summons/${summon.id}`,
      lastModified: new Date(summon.created_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // Silently handle
  }

  return [...staticPages, ...profilePages, ...summonPages];
}
