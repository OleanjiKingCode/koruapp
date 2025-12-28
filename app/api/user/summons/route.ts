import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserSummons, getUserBackedSummons } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [createdSummons, backedSummons] = await Promise.all([
      getUserSummons(session.user.dbId),
      getUserBackedSummons(session.user.dbId),
    ]);

    return NextResponse.json({
      createdSummons,
      backedSummons
    });
  } catch (error) {
    console.error("Error fetching user summons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


