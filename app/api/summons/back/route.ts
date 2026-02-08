import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureApiError } from "@/lib/sentry";
import { supabase } from "@/lib/supabase";
import { notifySummonBacked } from "@/lib/notifications";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { summon_id, amount, tags: backerTags, reason } = body;

    if (!summon_id || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: summon_id and amount" },
        { status: 400 },
      );
    }

    const pledgeAmount = parseFloat(amount);
    if (isNaN(pledgeAmount) || pledgeAmount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 },
      );
    }

    // Tags selected by this backer (array of strings)
    const selectedTags: string[] = backerTags || [];

    // Get the summon with current backers array, tags, and creator info
    const { data: summon, error: fetchError } = await supabase
      .from("summons")
      .select(
        "total_backed, backers_count, backers, tags, creator_id, target_handle",
      )
      .eq("id", summon_id)
      .single();

    if (fetchError || !summon) {
      console.error("Error fetching summon:", fetchError);
      return NextResponse.json({ error: "Summon not found" }, { status: 404 });
    }

    // Check if user already backed this summon (check the backers array)
    const existingBackers: BackerInfo[] = summon.backers || [];
    const alreadyBacked = existingBackers.some(
      (b) => b.user_id === session.user.dbId,
    );

    if (alreadyBacked) {
      return NextResponse.json(
        { error: "You have already backed this summon" },
        { status: 400 },
      );
    }

    // Get user info
    const { data: userData } = await supabase
      .from("users")
      .select("id, username, name, profile_image_url, total_summons_backed")
      .eq("id", session.user.dbId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new backer object
    const newBacker: BackerInfo = {
      user_id: userData.id,
      username: userData.username,
      name: userData.name,
      profile_image_url: userData.profile_image_url,
      amount: pledgeAmount,
      backed_at: new Date().toISOString(),
      reason: reason || undefined,
    };

    // Add to backers array
    const updatedBackers = [...existingBackers, newBacker];

    // Update tag counts - increment each tag the backer selected
    const existingTags: Record<string, number> = summon.tags || {};
    const updatedTags = { ...existingTags };
    selectedTags.forEach((tag) => {
      updatedTags[tag] = (updatedTags[tag] || 0) + 1;
    });

    // Update the summon with new backer in array and updated tags
    const { error: updateError } = await supabase
      .from("summons")
      .update({
        backers: updatedBackers,
        tags: updatedTags,
        total_backed: (summon.total_backed || 0) + pledgeAmount,
        backers_count: updatedBackers.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", summon_id);

    if (updateError) {
      console.error("Error updating summon:", updateError);
      return NextResponse.json(
        { error: "Failed to back summon", details: updateError.message },
        { status: 500 },
      );
    }

    // Also add to summon_backers table for backwards compatibility
    // Ignore errors - the backers array is the source of truth now
    try {
      await supabase.from("summon_backers").insert({
        summon_id: summon_id,
        user_id: session.user.dbId,
        amount: pledgeAmount,
      });
    } catch {
      // Ignore errors
    }

    // Increment user's total_summons_backed count
    await supabase
      .from("users")
      .update({
        total_summons_backed: (userData.total_summons_backed || 0) + 1,
      })
      .eq("id", session.user.dbId);

    // Notify the summon creator that someone backed their summon
    if (summon.creator_id && summon.creator_id !== session.user.dbId) {
      try {
        await notifySummonBacked(
          summon.creator_id,
          userData.name,
          userData.username,
          userData.profile_image_url,
          pledgeAmount,
          summon.target_handle || "",
          summon_id,
        );
      } catch (notifyError) {
        captureApiError(notifyError, "POST /api/summons/back:notification");
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully backed summon",
      backer: newBacker,
    });
  } catch (error) {
    captureApiError(error, "POST /api/summons/back");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
