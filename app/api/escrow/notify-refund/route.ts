import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";
import { notifyEscrowRefund } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { escrowId, reason } = await request.json();
    if (!escrowId && escrowId !== 0) {
      return NextResponse.json(
        { error: "escrowId is required" },
        { status: 400 },
      );
    }
    if (reason !== "rejection" && reason !== "expiry") {
      return NextResponse.json(
        { error: "reason must be 'rejection' or 'expiry'" },
        { status: 400 },
      );
    }

    // Look up the escrow to find the depositor
    const { data: escrow, error } = await supabase
      .from("escrows")
      .select("depositor_user_id, amount")
      .eq("escrow_id", escrowId)
      .single();

    if (error || !escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if (!escrow.depositor_user_id) {
      return NextResponse.json(
        { error: "Could not determine depositor" },
        { status: 400 },
      );
    }

    await notifyEscrowRefund(
      escrow.depositor_user_id,
      escrow.amount || 0,
      reason,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, "POST /api/escrow/notify-refund");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
