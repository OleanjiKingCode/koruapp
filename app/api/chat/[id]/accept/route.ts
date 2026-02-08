import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";
import { notifyChatAccepted } from "@/lib/notifications";

// POST - Accept a chat (after on-chain escrow acceptance)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id: chatId } = await params;

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.dbId;
    const body = await request.json();
    const { escrowId } = body;

    // Get the chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify user is the creator (recipient)
    if (chat.creator_id !== userId) {
      return NextResponse.json(
        { error: "Only the creator can accept the chat" },
        { status: 403 },
      );
    }

    // Verify chat is in pending status
    if (chat.status !== "pending") {
      return NextResponse.json(
        { error: "Chat is not in pending status" },
        { status: 400 },
      );
    }

    // Update chat status to active
    const { error: updateChatError } = await supabase
      .from("chats")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    if (updateChatError) {
      console.error("Error updating chat:", updateChatError);
      return NextResponse.json(
        { error: "Failed to update chat status" },
        { status: 500 },
      );
    }

    // Update escrow status if escrowId provided
    if (escrowId !== undefined) {
      const { error: updateEscrowError } = await supabase
        .from("escrows")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("escrow_id", escrowId);

      if (updateEscrowError) {
        console.error("Error updating escrow:", updateEscrowError);
        // Don't fail the request, chat status was updated
      }
    }

    // Notify the requester that their chat was accepted
    try {
      // Get creator info for the notification
      const { data: creator } = await supabase
        .from("users")
        .select("name, username, profile_image_url")
        .eq("id", userId)
        .single();

      if (creator && chat.requester_id) {
        await notifyChatAccepted(
          chat.requester_id,
          creator.name || creator.username || "Someone",
          creator.username || "user",
          creator.profile_image_url,
          chatId,
        );
      }
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError);
      // Don't fail the request, chat was accepted successfully
    }

    return NextResponse.json({
      success: true,
      message: "Chat accepted successfully",
    });
  } catch (error) {
    captureApiError(error, "POST /api/chat/[id]/accept");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
