import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { captureApiError } from "@/lib/sentry";

// GET - Get escrow details for a chat
export async function GET(
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

    // Get the chat to verify access
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify user is a participant
    if (chat.creator_id !== userId && chat.requester_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to find escrow by chat_id first
    let escrow = null;
    const { data: escrowByChat } = await supabase
      .from("escrows")
      .select("*")
      .eq("chat_id", chatId)
      .single();

    if (escrowByChat) {
      escrow = escrowByChat;
    } else {
      // Fallback: try to find by recipient user ID and amount/time
      // This handles escrows created before chat_id linking was added
      const { data: user } = await supabase
        .from("users")
        .select("connected_wallets")
        .eq("id", chat.creator_id)
        .single();

      if (user?.connected_wallets) {
        const wallets = user.connected_wallets as Array<{
          address: string;
          isPrimary?: boolean;
        }>;
        const primaryWallet = wallets.find((w) => w.isPrimary);
        const walletAddress = primaryWallet?.address || wallets[0]?.address;

        if (walletAddress) {
          // Find pending escrow for this recipient around the chat creation time
          const chatCreatedAt = new Date(chat.created_at);
          const timeWindowStart = new Date(
            chatCreatedAt.getTime() - 5 * 60 * 1000,
          ); // 5 min before
          const timeWindowEnd = new Date(
            chatCreatedAt.getTime() + 5 * 60 * 1000,
          ); // 5 min after

          const { data: escrowByRecipient } = await supabase
            .from("escrows")
            .select("*")
            .eq("recipient_address", walletAddress.toLowerCase())
            .eq("amount", chat.amount)
            .gte("created_at", timeWindowStart.toISOString())
            .lte("created_at", timeWindowEnd.toISOString())
            .is("chat_id", null) // Not yet linked
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (escrowByRecipient) {
            escrow = escrowByRecipient;
            // Link the escrow to the chat for future lookups
            await supabase
              .from("escrows")
              .update({ chat_id: chatId })
              .eq("id", escrowByRecipient.id);
          }
        }
      }
    }

    if (!escrow) {
      return NextResponse.json(
        { error: "No escrow found for this chat" },
        { status: 404 },
      );
    }

    return NextResponse.json({ escrow });
  } catch (error) {
    captureApiError(error, "GET /api/chat/[id]/escrow");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
