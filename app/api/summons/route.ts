import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createSummon } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { target_twitter_id, target_username, target_name, target_profile_image, message, pledged_amount, goal_amount, expires_at } = body;

    if (!target_username || !message || !pledged_amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const summon = await createSummon({
      creator_id: session.user.dbId,
      target_twitter_id: target_twitter_id || target_username,
      target_username,
      target_name,
      target_profile_image: target_profile_image || null,
      message,
      pledged_amount: parseFloat(pledged_amount),
      goal_amount: goal_amount ? parseFloat(goal_amount) : null,
      expires_at: expires_at || null,
    });

    if (!summon) {
      return NextResponse.json(
        { error: "Failed to create summon" },
        { status: 500 }
      );
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

