import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createChat, getUserByUsername, supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

// POST - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { creatorUsername, amount, slotName, slotDuration, escrowId } = body;

    if (!creatorUsername) {
      return NextResponse.json(
        { error: "Creator username is required" },
        { status: 400 },
      );
    }

    // Get creator's user ID from their username
    const creator = await getUserByUsername(creatorUsername);
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found on Koru" },
        { status: 404 },
      );
    }

    // Prevent chatting with yourself
    if (creator.id === session.user.dbId) {
      return NextResponse.json(
        { error: "Cannot create a chat with yourself" },
        { status: 400 },
      );
    }

    // Create the chat
    const chat = await createChat({
      requester_id: session.user.dbId,
      creator_id: creator.id,
      amount: amount || 0,
      slot_name: slotName || null,
      slot_duration: slotDuration || null,
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Failed to create chat" },
        { status: 500 },
      );
    }

    // If this is a paid chat, update the creator's pending balance
    if (amount && amount > 0) {
      const { error: balanceError } = await supabase
        .from("users")
        .update({
          pending_balance: (creator.pending_balance || 0) + amount,
        })
        .eq("id", creator.id);

      if (balanceError) {
        console.error("Failed to update pending balance:", balanceError);
        // Don't fail the request, chat was created successfully
      }
    }

    // Link the escrow to this chat if escrowId is provided
    if (escrowId !== undefined && escrowId !== null) {
      const { error: escrowError } = await supabase
        .from("escrows")
        .update({ chat_id: chat.id })
        .eq("escrow_id", escrowId);

      if (escrowError) {
        console.error("Failed to link escrow to chat:", escrowError);
        // Don't fail the request, chat was created successfully
      }
    }

    return NextResponse.json({ chat });
  } catch (error) {
    captureApiError(error, "POST /api/chats");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
