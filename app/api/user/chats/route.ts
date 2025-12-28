import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserChats } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chats = await getUserChats(session.user.dbId);
    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


