import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatId } = await params;
    const userId = session.user.dbId;

    // Fetch chat with user details
    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        *,
        requester:users!requester_id (
          id,
          name,
          username,
          profile_image_url
        ),
        creator:users!creator_id (
          id,
          name,
          username,
          profile_image_url
        )
      `,
      )
      .eq("id", chatId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify user has access to this chat
    if (data.requester_id !== userId && data.creator_id !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Transform to include otherParty based on the current user
    const isRequester = data.requester_id === userId;
    const chat = {
      ...data,
      otherParty: isRequester ? data.creator : data.requester,
    };

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
