import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";
import { notifyDisputeRaised } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { escrowId } = await request.json();
    if (!escrowId && escrowId !== 0) {
      return NextResponse.json(
        { error: "escrowId is required" },
        { status: 400 },
      );
    }

    // Look up the escrow to find both parties
    const { data: escrow, error } = await supabase
      .from("escrows")
      .select("depositor_user_id, recipient_user_id, amount, chat_id")
      .eq("escrow_id", escrowId)
      .single();

    if (error || !escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    // Determine the other party (opposite of who raised the dispute)
    const isDepositor = escrow.depositor_user_id === session.user.dbId;
    const otherPartyId = isDepositor
      ? escrow.recipient_user_id
      : escrow.depositor_user_id;

    if (!otherPartyId) {
      return NextResponse.json(
        { error: "Could not determine other party" },
        { status: 400 },
      );
    }

    await notifyDisputeRaised(
      otherPartyId,
      session.user.username || "Someone",
      escrow.amount || 0,
      escrow.chat_id || "",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, "POST /api/escrow/notify-dispute");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
