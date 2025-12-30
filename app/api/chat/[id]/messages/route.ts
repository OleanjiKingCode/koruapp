import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getChatById,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/supabase";

// GET - Fetch messages for a chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: chatId } = await params;

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this chat
    const chat = await getChatById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const userId = session.user.dbId;
    if (chat.requester_id !== userId && chat.creator_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get messages
    const messages = await getChatMessages(chatId);

    // Mark messages as read for this user
    await markMessagesAsRead(chatId, userId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: chatId } = await params;

    if (!session?.user?.dbId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this chat
    const chat = await getChatById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const userId = session.user.dbId;
    if (chat.requester_id !== userId && chat.creator_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if chat is in a state that allows messaging
    if (chat.status !== "active" && chat.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot send messages to this chat" },
        { status: 400 }
      );
    }

    // Send the message
    const message = await sendMessage(chatId, userId, content);

    if (!message) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


