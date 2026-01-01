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

    // Check if user already backed this summon
    const { data: existingBacker } = await supabase
      .from("summon_backers")
      .select("id")
      .eq("summon_id", summon_id)
      .eq("user_id", session.user.dbId)
      .limit(1);

    if (existingBacker && existingBacker.length > 0) {
      return NextResponse.json(
        { error: "You have already backed this summon" },
        { status: 400 }
      );
    }

    // Add the backer to summon_backers table
    const { error: backerError } = await supabase
      .from("summon_backers")
      .insert({
        summon_id: summon_id,
        user_id: session.user.dbId,
        amount: pledgeAmount,
      });

    if (backerError) {
      console.error("Error adding backer:", backerError);
      
      // Try appeal_backers as fallback (different schema)
      const { error: appealBackerError } = await supabase
        .from("appeal_backers")
        .insert({
          appeal_id: summon_id,
          user_id: session.user.dbId,
          amount: pledgeAmount,
        });

      if (appealBackerError) {
        console.error("Error adding appeal backer:", appealBackerError);
        return NextResponse.json(
          { error: "Failed to back summon", details: appealBackerError.message },
          { status: 500 }
        );
      }
    }

    // Update the summon's total_backed and backers_count
    // First get current values
    const { data: summon, error: fetchError } = await supabase
      .from("summons")
      .select("total_backed, backers_count")
      .eq("id", summon_id)
      .single();

    if (fetchError || !summon) {
      console.error("Error fetching summon:", fetchError);
      return NextResponse.json(
        { error: "Summon not found" },
        { status: 404 }
      );
    }

    // Update with new values
    const { error: updateError } = await supabase
      .from("summons")
      .update({
        total_backed: (summon.total_backed || 0) + pledgeAmount,
        backers_count: (summon.backers_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", summon_id);

    if (updateError) {
      console.error("Error updating summon:", updateError);
      return NextResponse.json(
        { error: "Failed to update summon totals" },
        { status: 500 }
      );
    }

    // Increment user's total_summons_backed count
    const { data: userData } = await supabase
      .from("users")
      .select("total_summons_backed")
      .eq("id", session.user.dbId)
      .single();

    if (userData) {
      await supabase
        .from("users")
        .update({
          total_summons_backed: (userData.total_summons_backed || 0) + 1,
        })
        .eq("id", session.user.dbId);
    }

    return NextResponse.json({ 
      success: true,
      message: "Successfully backed summon"
    });
  } catch (error) {
    console.error("Error backing summon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

