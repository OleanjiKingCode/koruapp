import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase, getActiveSummons, addSummonIdToUser } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";
import { notifySummonCreated, notifySummonBacked } from "@/lib/notifications";
import { parseAmount, parsePagination } from "@/lib/validation";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
  reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("search");
    const { limit } = parsePagination(null, searchParams.get("limit"));

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
          summon.message?.toLowerCase().includes(query),
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
        backedAt: b.backed_at,
        reason: b.reason,
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
            backedAt: summon.created_at,
            reason: undefined,
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
          summon.total_backed || summon.pledged_amount || summon.amount || 0,
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
      { status: 500 },
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
        { status: 400 },
      );
    }

    // Validate tags if provided
    const summonTags: Record<string, number> = tags || {};

    // Get creator info to add to backers array
    const { data: creatorData } = await supabase
      .from("users")
      .select(
        "id, username, name, profile_image_url, total_summons_created, total_summons_backed",
      )
      .eq("id", session.user.dbId)
      .single();

    const pledgeAmountNum = parseAmount(pledged_amount);
    if (pledgeAmountNum === null) {
      return NextResponse.json(
        { error: "Invalid pledge amount" },
        { status: 400 },
      );
    }

    // --- Check if an active summon already exists for this target ---
    const { data: existingSummons } = await supabase
      .from("summons")
      .select(
        "id, backers, backers_count, total_backed, tags, creator_id, target_handle",
      )
      .eq("target_handle", target_username)
      .eq("status", "active")
      .limit(1);

    const existingSummon =
      existingSummons && existingSummons.length > 0 ? existingSummons[0] : null;

    if (existingSummon) {
      // An active summon already exists for this target — back it instead of creating a duplicate
      const existingBackers: BackerInfo[] = existingSummon.backers || [];
      const alreadyBacked = existingBackers.some(
        (b) => b.user_id === session.user.dbId,
      );

      if (alreadyBacked) {
        return NextResponse.json(
          {
            error: "You have already backed a summon for this person",
            existing_summon_id: existingSummon.id,
          },
          { status: 400 },
        );
      }

      // Add user as a new backer to the existing summon
      const newBacker: BackerInfo = {
        user_id: session.user.dbId,
        username: creatorData?.username || session.user.name || "user",
        name: creatorData?.name || session.user.name || "User",
        profile_image_url:
          creatorData?.profile_image_url || session.user.image || null,
        amount: pledgeAmountNum,
        backed_at: new Date().toISOString(),
        reason: message?.trim() || undefined,
      };

      const updatedBackers = [...existingBackers, newBacker];

      // Merge tags from this backer
      const existingTags: Record<string, number> = existingSummon.tags || {};
      const updatedTags = { ...existingTags };
      Object.keys(summonTags).forEach((tag) => {
        updatedTags[tag] = (updatedTags[tag] || 0) + (summonTags[tag] || 1);
      });

      const { error: updateError } = await supabase
        .from("summons")
        .update({
          backers: updatedBackers,
          tags: updatedTags,
          total_backed: (existingSummon.total_backed || 0) + pledgeAmountNum,
          backers_count: updatedBackers.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSummon.id);

      if (updateError) {
        captureApiError(updateError, "POST /api/summons:back-existing");
        return NextResponse.json(
          { error: "Failed to back existing summon" },
          { status: 500 },
        );
      }

      // Add summon ID to user's backed_ids
      await addSummonIdToUser(
        session.user.dbId,
        existingSummon.id,
        "backed_ids",
      );

      // Increment user's total_summons_backed
      if (creatorData) {
        await supabase
          .from("users")
          .update({
            total_summons_backed: (creatorData.total_summons_backed || 0) + 1,
          })
          .eq("id", session.user.dbId);
      }

      // Notify summon creator
      if (
        existingSummon.creator_id &&
        existingSummon.creator_id !== session.user.dbId
      ) {
        try {
          await notifySummonBacked(
            existingSummon.creator_id,
            creatorData?.name || session.user.name || "Someone",
            creatorData?.username || "user",
            creatorData?.profile_image_url || null,
            pledgeAmountNum,
            existingSummon.target_handle || target_username,
            existingSummon.id,
          );
        } catch (notifyError) {
          captureApiError(
            notifyError,
            "POST /api/summons:backing-notification",
          );
        }
      }

      return NextResponse.json({
        summon: existingSummon,
        backed_existing: true,
        message: "Backed existing summon successfully",
      });
    }

    // --- No existing summon — create a new one ---

    // Create creator as first backer
    const creatorAsBacker: BackerInfo = {
      user_id: session.user.dbId,
      username: creatorData?.username || session.user.name || "user",
      name: creatorData?.name || session.user.name || "User",
      profile_image_url:
        creatorData?.profile_image_url || session.user.image || null,
      amount: pledgeAmountNum,
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
        amount: pledgeAmountNum,
        expires_at: expires_at || null,
        status: "active",
        backers_count: 1, // Creator counts as first backer
        total_backed: pledgeAmountNum, // Initialize with pledged amount
        backers: [creatorAsBacker], // Add creator to backers array
      })
      .select()
      .single();

    if (summonError) {
      captureApiError(summonError, "POST /api/summons:create");
      return NextResponse.json(
        { error: "Failed to create summon" },
        { status: 500 },
      );
    }

    if (!summon) {
      return NextResponse.json(
        { error: "Failed to create summon" },
        { status: 500 },
      );
    }

    // Creator is the first backer — add to their backed_ids
    await addSummonIdToUser(session.user.dbId, summon.id, "backed_ids");

    // Increment the creator's total_summons_created count
    // Try RPC first, then fall back to manual update
    const { error: rpcError } = await supabase.rpc("increment_user_summons", {
      user_id: session.user.dbId,
    });

    if (rpcError) {
      // If RPC doesn't exist, fetch current value and increment manually
      if (creatorData) {
        await supabase
          .from("users")
          .update({
            total_summons_created: (creatorData.total_summons_created || 0) + 1,
          })
          .eq("id", session.user.dbId);
      }
    }

    // Check if target user is already on Koru
    try {
      const { data: targetUser } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", target_username)
        .single();

      if (targetUser) {
        // Add summon to the target user's targeted_ids
        await addSummonIdToUser(targetUser.id, summon.id, "targeted_ids");

        // Check if this is the first summon for this user and notify
        const { count: previousSummons } = await supabase
          .from("summons")
          .select("*", { count: "exact", head: true })
          .eq("target_handle", target_username)
          .neq("id", summon.id);

        if (previousSummons === 0) {
          await notifySummonCreated(
            targetUser.id,
            creatorData?.name || session.user.name || "Someone",
            creatorData?.username || "user",
            creatorData?.profile_image_url || null,
            pledgeAmountNum,
            summon.id,
          );
        }
      }
    } catch (notifyError) {
      captureApiError(notifyError, "POST /api/summons:summon-notification");
      // Don't fail the request, summon was created successfully
    }

    return NextResponse.json({ summon });
  } catch (error) {
    captureApiError(error, "POST /api/summons");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
