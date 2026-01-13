import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { SummonDetailClient } from "./client";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fetch summon data for both metadata and page content
async function getSummon(id: string) {
  const { data: summon, error } = await supabase
    .from("summons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !summon) {
    return null;
  }

  // Fetch creator info
  let creator = null;
  if (summon.creator_id) {
    const { data: creatorData } = await supabase
      .from("users")
      .select("id, name, username, profile_image_url")
      .eq("id", summon.creator_id)
      .single();
    creator = creatorData;
  }

  // Get backers from the backers array
  const backersFromArray: BackerInfo[] = summon.backers || [];

  // Transform backers to frontend format
  let backersData = backersFromArray.map((b: BackerInfo) => ({
    id: b.user_id,
    name: b.name,
    username: b.username,
    profileImageUrl: b.profile_image_url,
    amount: Number(b.amount),
    backedAt: b.backed_at,
  }));

  // If no backers in array but we have a creator and backers_count > 0,
  // add creator as first backer (for backwards compatibility)
  if (backersData.length === 0 && creator && summon.backers_count > 0) {
    backersData = [
      {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        profileImageUrl: creator.profile_image_url,
        amount: Number(summon.pledged_amount || summon.amount || 0),
        backedAt: summon.created_at,
      },
    ];
  }

  // Transform to frontend format
  return {
    id: summon.id,
    targetHandle:
      summon.target_username ||
      summon.target_handle ||
      summon.target_twitter_id,
    targetName: summon.target_name || summon.target_username || "Unknown",
    targetProfileImage:
      summon.target_profile_image || summon.target_image || null,
    totalPledged: Number(
      summon.total_backed || summon.pledged_amount || summon.amount || 0
    ),
    backers: summon.backers_count || backersData.length || 0,
    backersData,
    category: "All",
    trend: "up" as const,
    trendValue: 0,
    request: summon.message || summon.request || "",
    tags: summon.tags || {},
    createdAt: summon.created_at,
    expiresAt: summon.expires_at,
    status: summon.status,
    creatorId: summon.creator_id,
    creatorUsername: creator?.username || null,
    creatorName: creator?.name || null,
    creatorProfileImage: creator?.profile_image_url || null,
  };
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Generate metadata for social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const summon = await getSummon(id);

  if (!summon) {
    return {
      title: "Summon Not Found | Koru",
      description: "This summon could not be found.",
    };
  }

  const title = `Summon for @${summon.targetHandle} | Koru`;
  const description = summon.request
    ? `"${summon.request.slice(0, 150)}${summon.request.length > 150 ? "..." : ""}" - $${formatNumber(summon.totalPledged)} pledged by ${summon.backers} backer${summon.backers !== 1 ? "s" : ""}`
    : `$${formatNumber(summon.totalPledged)} pledged by ${summon.backers} backer${summon.backers !== 1 ? "s" : ""} to get @${summon.targetHandle} on Koru`;

  // Get top tags
  const topTags = summon.tags
    ? Object.entries(summon.tags)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([tag]) => tag)
    : [];

  // Use dynamic OG image that shows the summon card
  const ogImageUrl = `https://koruapp.xyz/api/og/summon/${id}`;

  return {
    title,
    description,
    keywords: ["Koru", "summon", summon.targetHandle, ...topTags],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://koruapp.xyz/summons/${id}`,
      siteName: "Koru",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Summon for @${summon.targetHandle}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SummonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const summon = await getSummon(id);

  return <SummonDetailClient summonId={id} initialSummon={summon} />;
}
