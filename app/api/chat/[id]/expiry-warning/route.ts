import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChatById } from "@/lib/supabase";
import { notifySessionExpiring } from "@/lib/notifications";
import { captureApiError } from "@/lib/sentry";

// POST - Send session expiry warning notifications to both parties
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

    const chat = await getChatById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const userId = session.user.dbId;
    if (chat.requester_id !== userId && chat.creator_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get both users' info from the chat
    const { supabase } = await import("@/lib/supabase");
    const { data: users } = await supabase
      .from("users")
      .select("id, name, username, profile_image_url")
      .in("id", [chat.requester_id, chat.creator_id]);

    if (!users || users.length < 2) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }

    const requester = users.find((u: any) => u.id === chat.requester_id);
    const creator = users.find((u: any) => u.id === chat.creator_id);

    if (!requester || !creator) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }

    // Notify both parties
    await Promise.all([
      notifySessionExpiring(
        chat.requester_id,
        creator.name || creator.username,
        creator.username,
        creator.profile_image_url,
        chatId,
      ),
      notifySessionExpiring(
        chat.creator_id,
        requester.name || requester.username,
        requester.username,
        requester.profile_image_url,
        chatId,
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError(error, "POST /api/chat/[id]/expiry-warning");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
