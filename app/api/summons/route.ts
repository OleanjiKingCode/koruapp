import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase, getActiveSummons, getSummonBackers } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get all active summons
    let summons = await getActiveSummons(limit);

    // Filter by category if provided
    if (category && category !== "All") {
      // Note: summons table doesn't have category field, so we'll skip this for now
      // If you want category filtering, you'd need to add it to the schema
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

    // Fetch backers for each summon (first 10 only)
    const summonsWithBackers = await Promise.all(
      summons.map(async (summon: any) => {
        const backers = await getSummonBackers(summon.id, 10);
        return {
          ...summon,
          backersData: backers.map((b: any) => ({
            id: b.user?.id || b.user_id,
            name: b.user?.name || "Anonymous",
            username: b.user?.username || "user",
            profileImageUrl: b.user?.profile_image_url || null,
            amount: Number(b.amount),
          })),
        };
      })
    );

    // Transform to match the frontend Summon type
    const transformedSummons = summonsWithBackers.map((summon: any) => ({
      id: summon.id,
      targetHandle: summon.target_username || summon.target_twitter_id,
      targetName: summon.target_name || summon.target_username || "Unknown",
      targetProfileImage: summon.target_profile_image || null,
      totalPledged: Number(summon.pledged_amount || 0),
      backers: summon.backers_count || 0,
      backersData: summon.backersData || [],
      category: "All", // Default category since summons table doesn't have category
      trend: "up" as const, // Default trend - could be calculated from recent backers
      trendValue: 0, // Default trend value - could be calculated
      request: summon.message || "",
      createdAt: summon.created_at,
    }));

    return NextResponse.json({ summons: transformedSummons });
  } catch (error) {
    console.error("Error fetching summons:", error);
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
      pledged_amount,
      goal_amount,
      expires_at,
    } = body;

    if (!target_username || !message || !pledged_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
        request: message,
        amount: parseFloat(pledged_amount),
        expires_at: expires_at || null,
        status: "active",
        backers_count: 1, // Creator counts as first backer
        total_backed: parseFloat(pledged_amount), // Initialize with pledged amount
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
    console.error("Error creating summon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
