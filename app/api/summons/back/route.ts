import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface BackerInfo {
  user_id: string;
  username: string;
  name: string;
  profile_image_url: string | null;
  amount: number;
  backed_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { summon_id, amount } = body;

    if (!summon_id || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: summon_id and amount" },
        { status: 400 }
      );
    }

    const pledgeAmount = parseFloat(amount);
    if (isNaN(pledgeAmount) || pledgeAmount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 }
      );
    }

    // Get the summon with current backers array
    const { data: summon, error: fetchError } = await supabase
      .from("summons")
      .select("total_backed, backers_count, backers")
      .eq("id", summon_id)
      .single();

    if (fetchError || !summon) {
      console.error("Error fetching summon:", fetchError);
      return NextResponse.json(
        { error: "Summon not found" },
        { status: 404 }
      );
    }

    // Check if user already backed this summon (check the backers array)
    const existingBackers: BackerInfo[] = summon.backers || [];
    const alreadyBacked = existingBackers.some(
      (b) => b.user_id === session.user.dbId
    );

    if (alreadyBacked) {
      return NextResponse.json(
        { error: "You have already backed this summon" },
        { status: 400 }
      );
    }

    // Get user info
    const { data: userData } = await supabase
      .from("users")
      .select("id, username, name, profile_image_url, total_summons_backed")
      .eq("id", session.user.dbId)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create new backer object
    const newBacker: BackerInfo = {
      user_id: userData.id,
      username: userData.username,
      name: userData.name,
      profile_image_url: userData.profile_image_url,
      amount: pledgeAmount,
      backed_at: new Date().toISOString(),
    };

    // Add to backers array
    const updatedBackers = [...existingBackers, newBacker];

    // Update the summon with new backer in array
    const { error: updateError } = await supabase
      .from("summons")
      .update({
        backers: updatedBackers,
        total_backed: (summon.total_backed || 0) + pledgeAmount,
        backers_count: updatedBackers.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", summon_id);

    if (updateError) {
      console.error("Error updating summon:", updateError);
      return NextResponse.json(
        { error: "Failed to back summon", details: updateError.message },
        { status: 500 }
      );
    }

    // Also add to summon_backers table for backwards compatibility
    await supabase
      .from("summon_backers")
      .insert({
        summon_id: summon_id,
        user_id: session.user.dbId,
        amount: pledgeAmount,
      })
      .catch(() => {
        // Ignore errors - the backers array is the source of truth now
      });

    // Increment user's total_summons_backed count
    await supabase
      .from("users")
      .update({
        total_summons_backed: (userData.total_summons_backed || 0) + 1,
      })
      .eq("id", session.user.dbId);

    return NextResponse.json({ 
      success: true,
      message: "Successfully backed summon",
      backer: newBacker
    });
  } catch (error) {
    console.error("Error backing summon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

