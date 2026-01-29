import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase, getActiveSummons } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get all active summons (now includes backers array)
    let summons = await getActiveSummons(limit);

    // Filter by category if provided
    if (category && category !== "All") {
      // Note: summons table doesn't have category field, so we'll skip this for now
    }

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      summons = summons.filter(
        (summon) =>
          summon.target_username?.toLowerCase().includes(query) ||
          summon.target_name?.toLowerCase().includes(query) ||
          summon.message?.toLowerCase().includes(query)
      );
    }

    // Fetch creator info for summons
    const creatorIds = [
      ...new Set(summons.map((s: any) => s.creator_id).filter(Boolean)),
    ];
    let creatorsMap: Record<string, any> = {};

    if (creatorIds.length > 0) {
      const { data: creators } = await supabase
        .from("users")
        .select("id, name, username, profile_image_url")
        .in("id", creatorIds);

      if (creators) {
        creatorsMap = creators.reduce((acc: Record<string, any>, c: any) => {
          acc[c.id] = c;
          return acc;
        }, {});
      }
    }

    // Transform to match the frontend Summon type
    const transformedSummons = summons.map((summon: any) => {
      const creator = creatorsMap[summon.creator_id];

      // Use the backers array directly from the summon
      const backersFromArray: BackerInfo[] = summon.backers || [];

      // Transform backers to frontend format
      let backersData = backersFromArray.map((b: BackerInfo) => ({
        id: b.user_id,
        name: b.name,
        username: b.username,
        profileImageUrl: b.profile_image_url,
        amount: Number(b.amount),
      }));

      // If no backers in array but we have a creator and backers_count > 0,
      // add creator as first backer (for backwards compatibility with old summons)
      if (backersData.length === 0 && creator && summon.backers_count > 0) {
        backersData = [
          {
            id: creator.id,
            name: creator.name,
            username: creator.username,
            profileImageUrl: creator.profile_image_url,
            amount: Number(summon.pledged_amount || summon.amount || 0),
          },
        ];
      }

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
        tags: summon.tags || {}, // Include tag counts
        createdAt: summon.created_at,
        creatorUsername: creator?.username || null,
        creatorName: creator?.name || null,
        creatorProfileImage: creator?.profile_image_url || null,
      };
    });

    return NextResponse.json({ summons: transformedSummons });
  } catch (error) {
    captureApiError(error, "GET /api/summons");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      target_twitter_id,
      target_username,
      target_name,
      target_profile_image,
      message,
      tags,
      pledged_amount,
      goal_amount,
      expires_at,
    } = body;

    if (!target_username || !pledged_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate tags if provided
    const summonTags: Record<string, number> = tags || {};

    // Get creator info to add to backers array
    const { data: creatorData } = await supabase
      .from("users")
      .select("id, username, name, profile_image_url")
      .eq("id", session.user.dbId)
      .single();

    // Create creator as first backer
    const creatorAsBacker: BackerInfo = {
      user_id: session.user.dbId,
      username: creatorData?.username || session.user.name || "user",
      name: creatorData?.name || session.user.name || "User",
      profile_image_url:
        creatorData?.profile_image_url || session.user.image || null,
      amount: parseFloat(pledged_amount),
      backed_at: new Date().toISOString(),
    };

    // Create summon directly using Supabase client
    // Map to correct column names: summons table uses target_handle, target_image, request, amount
    const { data: summon, error: summonError } = await supabase
      .from("summons")
      .insert({
        creator_id: session.user.dbId,
        target_twitter_id: target_twitter_id || target_username,
        target_handle: target_username,
        target_name: target_name || null,
        target_image: target_profile_image || null,
        request: message || Object.keys(summonTags).join(", "), // Fallback to tags as message
        tags: summonTags, // Store tag counts
        amount: parseFloat(pledged_amount),
        expires_at: expires_at || null,
        status: "active",
        backers_count: 1, // Creator counts as first backer
        total_backed: parseFloat(pledged_amount), // Initialize with pledged amount
        backers: [creatorAsBacker], // Add creator to backers array
      })
      .select()
      .single();

    if (summonError) {
      console.error("Error creating summon:", summonError);
      return NextResponse.json(
        {
          error: "Failed to create summon",
          details: summonError.message,
        },
        { status: 500 }
      );
    }

    if (!summon) {
      return NextResponse.json(
        { error: "Failed to create summon" },
        { status: 500 }
      );
    }

    // Increment the creator's total_summons_created count
    // Try RPC first, then fall back to manual update
    const { error: rpcError } = await supabase.rpc("increment_user_summons", {
      user_id: session.user.dbId,
    });

    if (rpcError) {
      // If RPC doesn't exist, fetch current value and increment manually
      console.warn("RPC function not available, updating manually:", rpcError);
      const { data: userData } = await supabase
        .from("users")
        .select("total_summons_created")
        .eq("id", session.user.dbId)
        .single();

      if (userData) {
        await supabase
          .from("users")
          .update({
            total_summons_created: (userData.total_summons_created || 0) + 1,
          })
          .eq("id", session.user.dbId);
      }
    }

    return NextResponse.json({ summon });
  } catch (error) {
    captureApiError(error, "POST /api/summons");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
