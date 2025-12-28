import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
