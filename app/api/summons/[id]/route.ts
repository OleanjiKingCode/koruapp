import { NextRequest, NextResponse } from "next/server";
import { captureApiError } from "@/lib/sentry";
import { supabase } from "@/lib/supabase";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Summon ID is required" },
        { status: 400 },
      );
    }

    // Fetch the summon by ID
    const { data: summon, error: summonError } = await supabase
      .from("summons")
      .select("*")
      .eq("id", id)
      .single();

    if (summonError || !summon) {
      return NextResponse.json({ error: "Summon not found" }, { status: 404 });
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
    const transformedSummon = {
      id: summon.id,
      targetHandle:
        summon.target_username ||
        summon.target_handle ||
        summon.target_twitter_id,
      targetName: summon.target_name || summon.target_username || "Unknown",
      targetProfileImage:
        summon.target_profile_image || summon.target_image || null,
      totalPledged: Number(
        summon.total_backed || summon.pledged_amount || summon.amount || 0,
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

    return NextResponse.json({ summon: transformedSummon });
  } catch (error) {
    captureApiError(error, "GET /api/summons/[id]");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
